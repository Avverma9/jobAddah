import express from "express";
import User from "../models/user.mjs";
import { verifyToken, authorizeRoles } from "../middleware/auth.mjs";
import { ALL_PERMISSIONS } from "../config/sidebar.mjs";
import MenuItem from "../models/dashboard/menuItem.mjs";
import govSection from "../models/govJob/govSection.mjs";
import Site from "../models/govJob/scrapperSite.mjs";
import govPostList from "../models/govJob/govPostListBycatUrl.mjs";

const router = express.Router();

router.get(
  "/users",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  async (req, res) => {
    try {
      const users = await User.find().select("-password");
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.put(
  "/users/:id/ban",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  async (req, res) => {
    try {
      const { banned } = req.body;
      if (typeof banned !== "boolean") {
        return res.status(400).json({ message: "banned must be boolean" });
      }

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.banned = banned;
      await user.save();

      res.json({
        message: `User ${banned ? "banned" : "unbanned"}`,
        user: { id: user._id, banned: user.banned },
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.put(
  "/users/:id/permissions",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  async (req, res) => {
    try {
      const { permissions } = req.body;
      if (!Array.isArray(permissions)) {
        return res
          .status(400)
          .json({ message: "permissions must be an array" });
      }

      const invalid = permissions.filter(
        (p) => !ALL_PERMISSIONS.includes(p)
      );
      if (invalid.length > 0) {
        return res
          .status(400)
          .json({ message: "Invalid permissions", invalid });
      }

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.permissions = permissions;
      await user.save();

      res.json({
        message: "Permissions updated",
        permissions: user.permissions,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.put(
  "/users/:id/role",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  async (req, res) => {
    try {
      const { role } = req.body;
      if (!role) {
        return res.status(400).json({ message: "role is required" });
      }

      if (role === "super_admin" && req.user.role !== "super_admin") {
        return res.status(403).json({
          message: "Only super_admin can assign super_admin role",
        });
      }

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.role = role;
      await user.save();

      res.json({ message: "Role updated", role: user.role });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.get("/sidebar/items", async (req, res) => {
  try {
    const items = await MenuItem.find().sort({ order: 1 }).lean();
    if (!items || items.length === 0) {
      return res.json({ items: ALL_PERMISSIONS });
    }

    const map = new Map();
    items.forEach((i) => {
      i.children = [];
      map.set(i._id.toString(), i);
    });

    const roots = [];
    items.forEach((i) => {
      if (i.parent) {
        const p = map.get(i.parent.toString());
        if (p) p.children.push(i);
        else roots.push(i);
      } else {
        roots.push(i);
      }
    });

    res.json({ items: roots });
  } catch {
    res.status(500).json({ message: "Failed to load sidebar items" });
  }
});

router.post(
  "/sidebar/items",
  verifyToken,
  authorizeRoles("super_admin"),
  async (req, res) => {
    try {
      const {
        key,
        label,
        route,
        parent,
        isPublic,
        permission,
        icon,
        iconType,
        badge,
        meta,
      } = req.body;

      if (!key || !label) {
        return res.status(400).json({ message: "key and label required" });
      }

      const exists = await MenuItem.findOne({ key });
      if (exists) {
        return res
          .status(400)
          .json({ message: "Menu item with this key already exists" });
      }

      let nextOrder;

      if (parent) {
        const maxChildOrder = await MenuItem.findOne(
          { parent },
          { order: 1 }
        ).sort({ order: -1 });
        nextOrder = (maxChildOrder?.order || 0) + 1;
      } else {
        const maxRootOrder =
          (await MenuItem.findOne({ parent: null }, { order: 1 }).sort({
            order: -1,
          })) || { order: 0 };
        nextOrder = maxRootOrder.order + 1;
      }

      const mi = new MenuItem({
        key,
        label,
        route: route || "",
        parent: parent || null,
        order: nextOrder,
        isPublic: !!isPublic,
        permission: permission || null,
        icon: icon || null,
        iconType: iconType || "font",
        badge: badge || null,
        meta: meta || {},
        createdBy: req.user.id,
      });

      await mi.save();
      res.status(201).json({ message: "Menu item created", item: mi });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.put(
  "/sidebar/items/:id",
  verifyToken,
  authorizeRoles("super_admin"),
  async (req, res) => {
    try {
      const updates = req.body;
      const item = await MenuItem.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true }
      );
      if (!item) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      res.json({ message: "Updated", item });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.delete(
  "/sidebar/items/:id",
  verifyToken,
  authorizeRoles("super_admin"),
  async (req, res) => {
    try {
      const item = await MenuItem.findByIdAndDelete(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Menu item not found" });
      }

      await MenuItem.updateMany(
        { parent: item._id },
        { $set: { parent: null } }
      );

      res.json({ message: "Deleted" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.post(
  "/sidebar/items/:id/assign",
  verifyToken,
  authorizeRoles("super_admin"),
  async (req, res) => {
    try {
      const { userIds, addPermissions = [], removePermissions = [] } = req.body;
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ message: "userIds array required" });
      }

      const users = await User.find({ _id: { $in: userIds } });
      for (const u of users) {
        const perms = new Set(u.permissions || []);
        addPermissions.forEach((p) => perms.add(p));
        removePermissions.forEach((p) => perms.delete(p));
        u.permissions = Array.from(perms);
        await u.save();
      }

      res.json({
        message: "Permissions updated for users",
        count: users.length,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.get("/dashboard/get-site", async (req, res) => {
  try {
    const siteData = await Site.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json({
      success: true,
      count: siteData.length,
      data: siteData,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || "Internal server error",
    });
  }
});



export default router;
