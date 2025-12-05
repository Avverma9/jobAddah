import React, { useEffect, useState, useMemo } from "react";
import {
  Settings2,
  Plus,
  Trash2,
  Pencil,
  Loader2,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../../../util/api";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

export default function MenuItemsPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]); // tree from GET
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);

  const [expandedIds, setExpandedIds] = useState(new Set());
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    key: "",
    label: "",
    route: "",
    parent: "",
    isPublic: false,
    permission: "",
    icon: "",
    iconType: "font",
    badge: "",
    order: 0,
  });

  const resetForm = () => {
    setEditingItem(null);
    setForm({
      key: "",
      label: "",
      route: "",
      parent: "",
      isPublic: false,
      permission: "",
      icon: "",
      iconType: "font",
      badge: "",
      order: 0,
    });
  };

  const openCreateModal = (parentId) => {
    resetForm();
    if (parentId) {
      setForm((f) => ({ ...f, parent: parentId }));
    }
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      key: item.key || "",
      label: item.label || "",
      route: item.route || "",
      parent: item.parent || "",
      isPublic: !!item.isPublic,
      permission: item.permission || "",
      icon: item.icon || "",
      iconType: item.iconType || "font",
      badge: item.badge || "",
      order:
        typeof item.order === "number" && !Number.isNaN(item.order)
          ? item.order
          : 0,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/sidebar/items");
      setItems(res.data.items || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load menu items");
      toast.error("Failed to load menu items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.key.trim() || !form.label.trim()) {
      toast.error("Key and Label are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        key: form.key.trim(),
        label: form.label.trim(),
        route: form.route.trim(),
        parent: form.parent || null,
        isPublic: !!form.isPublic,
        permission: form.permission.trim() || null,
        icon: form.icon.trim() || null,
        iconType: form.iconType || "font",
        badge: form.badge.trim() || null,
        order: Number.isFinite(+form.order) ? +form.order : 0,
      };

      if (editingItem) {
        await api.put(`/sidebar/items/${editingItem._id}`, payload);
        toast.success("Menu item updated");
      } else {
        await api.post("/sidebar/items", payload);
        toast.success("Menu item created");
      }
      closeModal();
      fetchItems();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save menu item");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm(
      "Delete this menu item? Children will be orphaned."
    );
    if (!ok) return;
    try {
      setDeletingId(id);
      await api.delete(`/sidebar/items/${id}`);
      toast.success("Menu item deleted");
      fetchItems();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete item");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ------- helpers: flatten tree ---------
  const flattenItems = (nodes, depth = 0, acc = []) => {
    nodes.forEach((n) => {
      acc.push({ ...n, depth });
      if (n.children && n.children.length) {
        flattenItems(n.children, depth + 1, acc);
      }
    });
    return acc;
  };

  const flatList = useMemo(() => flattenItems(items), [items]);

  // ------- search filter on tree ---------
  const filteredTree = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    const result = [];

    const dfs = (node, ancestors) => {
      const selfMatch =
        (node.label || "").toLowerCase().includes(q) ||
        (node.key || "").toLowerCase().includes(q) ||
        (node.route || "").toLowerCase().includes(q);

      let childMatches = [];
      (node.children || []).forEach((c) => {
        const cm = dfs(c, [...ancestors, node]);
        if (cm) childMatches.push(cm);
      });

      if (selfMatch || childMatches.length) {
        const cloned = { ...node, children: childMatches };
        if (!ancestors.length) result.push(cloned);
        return cloned;
      }

      return null;
    };

    items.forEach((n) => dfs(n, []));
    return result;
  }, [items, search]);

  // ------- DnD helpers ---------
  const findNodeAndParent = (nodes, id, parent = null) => {
    for (const n of nodes) {
      if (n._id === id) return { node: n, parent };
      if (n.children?.length) {
        const res = findNodeAndParent(n.children, id, n);
        if (res) return res;
      }
    }
    return null;
  };

  const reorderArray = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const handleDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceParentId =
      source.droppableId === "root" ? null : source.droppableId;
    const destParentId =
      destination.droppableId === "root" ? null : destination.droppableId;

    // Only allow re-order within same parent
    if (sourceParentId !== destParentId) return;

    // Local tree clone
    const newItems = JSON.parse(JSON.stringify(items));

    // Parent locate
    const parentObj =
      sourceParentId === null
        ? { node: { children: newItems } }
        : findNodeAndParent(newItems, sourceParentId);

    if (!parentObj) return;

    const siblings = parentObj.node.children || newItems;
    const reordered = reorderArray(
      siblings,
      source.index,
      destination.index
    );

    if (sourceParentId === null) {
      // root level
      reordered.forEach((n) => delete n.parent); // root parent null
      newItems.splice(0, newItems.length, ...reordered);
    } else {
      parentObj.node.children = reordered;
    }

    // recompute order values & call API
    const parentChildren = sourceParentId === null ? newItems : parentObj.node.children;
    try {
      // optimistic UI
      setItems(newItems);

      await Promise.all(
        parentChildren.map((child, index) =>
          api.put(`/sidebar/items/${child._id}`, {
            order: index, // 0-based incremental
          })
        )
      );
      toast.success("Order updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update order");
      // fallback reload
      fetchItems();
    }
  };

  // ------- row render with droppable children ---------
  const renderChildrenDroppable = (parentId, children) => (
    <Droppable
      droppableId={parentId || "root"}
      type="MENU"
    >
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="space-y-2"
        >
          {children.map((node, index) => renderNode(node, index))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );

  const renderNode = (node, indexForDnD) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedIds.has(node._id);
    const statusLabel = node.isPublic ? "Public" : "Protected";

    return (
      <Draggable
        key={node._id}
        draggableId={node._id}
        index={indexForDnD}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`border border-slate-200 rounded-lg bg-white ${
              snapshot.isDragging ? "shadow-lg ring-2 ring-indigo-100" : ""
            }`}
          >
            <div className="flex items-center justify-between px-3 py-2.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => hasChildren && toggleExpand(node._id)}
                  className={`h-6 w-6 flex items-center justify-center rounded ${
                    hasChildren
                      ? "hover:bg-slate-100 text-slate-500"
                      : "opacity-0 pointer-events-none"
                  }`}
                >
                  {hasChildren ? (
                    isExpanded ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )
                  ) : null}
                </button>

                <div
                  {...provided.dragHandleProps}
                  className="cursor-grab active:cursor-grabbing mr-1 text-slate-300"
                  title="Drag to reorder"
                >
                  ::
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900">
                      {node.label}
                    </span>
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono">
                      {node.key}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      #{typeof node.order === "number" ? node.order : 0}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                    {node.route && (
                      <span className="text-[11px] text-slate-500 font-mono">
                        {node.route}
                      </span>
                    )}
                    {node.permission && (
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 font-mono">
                        {node.permission}
                      </span>
                    )}
                    <span
                      className={`text-[11px] px-1.5 py-0.5 rounded-full border ${
                        node.isPublic
                          ? "border-emerald-200 text-emerald-600 bg-emerald-50"
                          : "border-amber-200 text-amber-600 bg-amber-50"
                      }`}
                    >
                      {statusLabel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {node.icon && node.iconType === "font" && (
                  <i className={`${node.icon} text-slate-400 text-lg`} />
                )}
                <button
                  type="button"
                  onClick={() => openCreateModal(node._id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Plus size={12} />
                  Add child
                </button>
                <button
                  type="button"
                  onClick={() => openEditModal(node)}
                  className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-indigo-700"
                >
                  <Pencil size={12} />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(node._id)}
                  disabled={deletingId === node._id}
                  className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
                >
                  {deletingId === node._id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Trash2 size={12} />
                  )}
                  Delete
                </button>
              </div>
            </div>

            {hasChildren && isExpanded && (
              <div className="border-t border-slate-100 bg-slate-50 px-4 py-2">
                <div className="space-y-2 ml-4">
                  {renderChildrenDroppable(node._id, node.children)}
                </div>
              </div>
            )}
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            <Settings2 className="h-4 w-4" />
            <span>Admin</span>
          </div>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">
            Menu Items
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Configure sidebar menu structure, permissions, icons and order.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Dashboard
          </button>
          <button
            onClick={() => openCreateModal(null)}
            className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Root Item
          </button>
        </div>
      </div>

      {/* Search & info */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by label, key, or route..."
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="text-xs text-slate-400">
          Total items: {flatList.length}
        </div>
      </div>

      {/* Tree / states */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 sm:p-4">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading menu items…
          </div>
        ) : error ? (
          <div className="py-10 text-center">
            <p className="text-sm font-medium text-red-600">
              Failed to load menu items
            </p>
            <p className="mt-1 text-xs text-slate-400">{error}</p>
          </div>
        ) : filteredTree.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-500">
            No menu items found. Try adding a new one.
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            {renderChildrenDroppable(null, filteredTree)}
          </DragDropContext>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-900">
                {editingItem ? "Edit Menu Item" : "Add Menu Item"}
              </h3>
              <button
                onClick={closeModal}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Key *
                  </label>
                  <input
                    name="key"
                    value={form.key}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="adminFeatures"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Label *
                  </label>
                  <input
                    name="label"
                    value={form.label}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Admin Features"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Route
                </label>
                <input
                  name="route"
                  value={form.route}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="/admin-special-settings"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Parent
                  </label>
                  <select
                    name="parent"
                    value={form.parent}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">(Root)</option>
                    {flatList.map((n) => (
                      <option key={n._id} value={n._id}>
                        {"‣ ".repeat(n.depth)}
                        {n.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Permission
                  </label>
                  <input
                    name="permission"
                    value={form.permission}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="menu.adminFeatures"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Icon class (Remix / FontAwesome)
                  </label>
                  <input
                    name="icon"
                    value={form.icon}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="riSettings3Line"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Badge text
                  </label>
                  <input
                    name="badge"
                    value={form.badge}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="NEW"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Order (sibling position)
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={form.order}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="isPublic"
                  type="checkbox"
                  name="isPublic"
                  checked={form.isPublic}
                  onChange={handleFormChange}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="isPublic" className="text-xs text-slate-600">
                  Public (visible without auth)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
