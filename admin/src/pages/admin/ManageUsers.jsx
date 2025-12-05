import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  Loader2,
  ShieldCheck,
  Ban,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Settings2,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../../util/api";

const ROLES = ["user", "editor", "admin", "super_admin"];

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [banLoadingId, setBanLoadingId] = useState(null);
  const [roleLoadingId, setRoleLoadingId] = useState(null);
  const [permLoadingId, setPermLoadingId] = useState(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [selectedIds, setSelectedIds] = useState([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignMenuItemId, setAssignMenuItemId] = useState("");
  const [addPerms, setAddPerms] = useState("");
  const [removePerms, setRemovePerms] = useState("");

  // single user permissions edit
  const [permEditModalOpen, setPermEditModalOpen] = useState(false);
  const [permEditUser, setPermEditUser] = useState(null);
  const [permEditValue, setPermEditValue] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        (u.name || "")
          .toLowerCase()
          .includes(q) ||
        (u.email || "")
          .toLowerCase()
          .includes(q) ||
        (u.role || "")
          .toLowerCase()
          .includes(q)
    );
  }, [users, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pageUsers = filtered.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const stats = useMemo(() => {
    const total = users.length;
    const banned = users.filter((u) => u.banned).length;
    const admins = users.filter(
      (u) => u.role === "admin" || u.role === "super_admin"
    ).length;
    return { total, banned, admins };
  }, [users]);

  const toggleBan = async (user) => {
    const newStatus = !user.banned;
    try {
      setBanLoadingId(user._id);
      await api.put(`/users/${user._id}/ban`, { banned: newStatus });
      toast.success(`User ${newStatus ? "banned" : "unbanned"}`);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === user._id ? { ...u, banned: newStatus } : u
        )
      );
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Ban/unban failed");
    } finally {
      setBanLoadingId(null);
    }
  };

  const changeRole = async (user, role) => {
    if (role === user.role) return;
    try {
      setRoleLoadingId(user._id);
      await api.put(`/users/${user._id}/role`, { role });
      toast.success("Role updated");
      setUsers((prev) =>
        prev.map((u) =>
          u._id === user._id ? { ...u, role } : u
        )
      );
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update role");
    } finally {
      setRoleLoadingId(null);
    }
  };

  const openPermEdit = (user) => {
    setPermEditUser(user);
    setPermEditValue((user.permissions || []).join("\n"));
    setPermEditModalOpen(true);
  };

  const saveUserPermissions = async () => {
    if (!permEditUser) return;
    const raw = permEditValue
      .split(/\r?\n/)
      .map((p) => p.trim())
      .filter(Boolean);
    try {
      setPermLoadingId(permEditUser._id);
      await api.put(`/users/${permEditUser._id}/permissions`, {
        permissions: raw,
      });
      toast.success("Permissions updated");
      setUsers((prev) =>
        prev.map((u) =>
          u._id === permEditUser._id ? { ...u, permissions: raw } : u
        )
      );
      setPermEditModalOpen(false);
      setPermEditUser(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update permissions");
    } finally {
      setPermLoadingId(null);
    }
  };

  // bulk selection
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAllOnPage = () => {
    const allIds = pageUsers.map((u) => u._id);
    const allSelected = allIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !allIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allIds])));
    }
  };

  const openAssignModal = () => {
    if (selectedIds.length === 0) {
      toast.error("Select at least one user");
      return;
    }
    setAssignModalOpen(true);
  };

  const submitAssign = async () => {
    if (!assignMenuItemId && !addPerms.trim() && !removePerms.trim()) {
      toast.error("Provide menu permission or custom permissions");
      return;
    }

    // Manual permission strings (comma/newline separated)
    const extrasAdd = addPerms
      .split(/[,;\r\n]/)
      .map((p) => p.trim())
      .filter(Boolean);
    const extrasRemove = removePerms
      .split(/[,;\r\n]/)
      .map((p) => p.trim())
      .filter(Boolean);

    // Menu item permission key se permission derive karoge to backend ya UI se
    // abhi simple assume kar rahe hain ki assignMenuItemId already ek permission string hai
    const addPermissions = extrasAdd;
    const removePermissions = extrasRemove;

    try {
      const payload = {
        userIds: selectedIds,
        addPermissions,
        removePermissions,
      };
      await api.post(`/sidebar/items/${assignMenuItemId || "dummy"}/assign`, payload);
      toast.success("Permissions updated for selected users");
      setAssignModalOpen(false);
      setAddPerms("");
      setRemovePerms("");
      setAssignMenuItemId("");
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Bulk assign failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            <Users className="h-4 w-4" />
            <span>Admin</span>
          </div>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">
            Manage Users
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            View, ban, change roles, and manage permissions for all users.
          </p>
        </div>
      </div>

      {/* Search + bulk actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or role..."
            className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openAssignModal}
            className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
            disabled={selectedIds.length === 0}
          >
            <Settings2 className="h-3.5 w-3.5" />
            Assign permissions ({selectedIds.length})
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="text-3xl font-bold text-slate-900">
            {stats.total}
          </div>
          <div className="text-sm text-slate-500 mt-1">Total Users</div>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <div className="text-2xl font-bold text-emerald-600">
              {stats.admins}
            </div>
          </div>
          <div className="text-sm text-emerald-700 mt-1">Admins / Super</div>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-red-600" />
            <div className="text-2xl font-bold text-red-600">
              {stats.banned}
            </div>
          </div>
          <div className="text-sm text-red-700 mt-1">Banned</div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  onChange={toggleSelectAllOnPage}
                  checked={
                    pageUsers.length > 0 &&
                    pageUsers.every((u) => selectedIds.includes(u._id))
                  }
                />
              </th>
              <th className="px-4 py-3 text-left font-medium">User</th>
              <th className="px-4 py-3 text-left font-medium">Role</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">
                Permissions
              </th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-500">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">Loading users…</span>
                  </div>
                </td>
              </tr>
            ) : pageUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-slate-500">
                  No users found.
                </td>
              </tr>
            ) : (
              pageUsers.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 align-middle">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      checked={selectedIds.includes(u._id)}
                      onChange={() => toggleSelect(u._id)}
                    />
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">
                        {u.name || "(no name)"}
                      </span>
                      <span className="text-xs text-slate-500">
                        {u.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-700">
                      <span>{u.role}</span>
                      <div className="relative">
                        <select
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          value={u.role}
                          onChange={(e) => changeRole(u, e.target.value)}
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="h-3 w-3 text-slate-400" />
                      </div>
                    </div>
                    {roleLoadingId === u._id && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 ml-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        updating…
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    {u.banned ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600">
                        <XCircle className="h-3 w-3" />
                        Banned
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <button
                      onClick={() => openPermEdit(u)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Settings2 className="h-3.5 w-3.5" />
                      {(u.permissions || []).length} perms
                    </button>
                  </td>
                  <td className="px-4 py-3 align-middle text-right">
                    <button
                      onClick={() => toggleBan(u)}
                      disabled={banLoadingId === u._id}
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium ${
                        u.banned
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "bg-red-50 text-red-600 hover:bg-red-100"
                      } disabled:opacity-50`}
                    >
                      {banLoadingId === u._id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : u.banned ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <Ban className="h-3.5 w-3.5" />
                      )}
                      {u.banned ? "Unban" : "Ban"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
            <div>
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-slate-700">
                {Math.min(startIndex + pageSize, filtered.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">
                {filtered.length}
              </span>{" "}
              users
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 ${
                  currentPage === 1
                    ? "cursor-not-allowed border-slate-100 text-slate-300"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Prev
              </button>
              <span className="text-[11px] text-slate-500">
                Page{" "}
                <span className="font-semibold text-slate-700">
                  {currentPage}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {totalPages}
                </span>
              </span>
              <button
                onClick={() =>
                  setPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 ${
                  currentPage === totalPages
                    ? "cursor-not-allowed border-slate-100 text-slate-300"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk assign modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-900">
                Assign permissions to {selectedIds.length} users
              </h3>
              <button
                onClick={() => setAssignModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-4 py-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Menu item ID (optional)
                </label>
                <input
                  value={assignMenuItemId}
                  onChange={(e) => setAssignMenuItemId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Menu item id (for tracking)"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Add permissions (comma or newline separated)
                  </label>
                  <textarea
                    rows={4}
                    value={addPerms}
                    onChange={(e) => setAddPerms(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                    placeholder="menu.dashboard
menu.jobs.view"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Remove permissions
                  </label>
                  <textarea
                    rows={4}
                    value={removePerms}
                    onChange={(e) => setRemovePerms(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/40"
                    placeholder="menu.jobs.create"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 px-4 py-3">
              <button
                onClick={() => setAssignModalOpen(false)}
                className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={submitAssign}
                className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Single user permissions modal */}
      {permEditModalOpen && permEditUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-900">
                Edit permissions – {permEditUser.email}
              </h3>
              <button
                onClick={() => {
                  setPermEditModalOpen(false);
                  setPermEditUser(null);
                }}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-4 py-4 space-y-3">
              <p className="text-xs text-slate-500">
                One permission per line. This will replace the full permissions
                array of the user.
              </p>
              <textarea
                rows={10}
                value={permEditValue}
                onChange={(e) => setPermEditValue(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 px-4 py-3">
              <button
                onClick={() => {
                  setPermEditModalOpen(false);
                  setPermEditUser(null);
                }}
                className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={saveUserPermissions}
                disabled={permLoadingId === permEditUser._id}
                className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
              >
                {permLoadingId === permEditUser._id ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
