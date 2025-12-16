const express = require('express');
const router = express.Router();
const User = require('@/models/user');
const { verifyToken, authorizeRoles } = require('@/middleware/auth');
const { ALL_PERMISSIONS } = require('@/config/sidebar');
const MenuItem = require('@/models/menuItem');

// List users (admin+)
router.get('/users', verifyToken, authorizeRoles('admin', 'super_admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Ban/unban user
router.put('/users/:id/ban', verifyToken, authorizeRoles('admin', 'super_admin'), async (req, res) => {
  try {
    const { banned } = req.body;
    if (typeof banned !== 'boolean') return res.status(400).json({ message: 'banned must be boolean' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.banned = banned;
    await user.save();
    res.json({ message: `User ${banned ? 'banned' : 'unbanned'}`, user: { id: user._id, banned: user.banned } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user permissions (replace full permissions array)
router.put('/users/:id/permissions', verifyToken, authorizeRoles('admin', 'super_admin'), async (req, res) => {
  try {
    const { permissions } = req.body;
    if (!Array.isArray(permissions)) return res.status(400).json({ message: 'permissions must be an array' });

    // Optionally validate permissions against known list
    const invalid = permissions.filter(p => !ALL_PERMISSIONS.includes(p));
    if (invalid.length > 0) return res.status(400).json({ message: 'Invalid permissions', invalid });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.permissions = permissions;
    await user.save();
    res.json({ message: 'Permissions updated', permissions: user.permissions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Change role
router.put('/users/:id/role', verifyToken, authorizeRoles('admin', 'super_admin'), async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) return res.status(400).json({ message: 'role is required' });

    // Prevent non-super_admins from assigning super_admin
    if (role === 'super_admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Only super_admin can assign super_admin role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = role;
    await user.save();
    res.json({ message: 'Role updated', role: user.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Public endpoint: list sidebar/menu items (static fallback + DB-driven)
// If there are menu items in DB, return a nested tree; otherwise return static list.
router.get('/sidebar/items', async (req, res) => {
  try {
    const items = await MenuItem.find().sort({ order: 1 }).lean();
    if (!items || items.length === 0) return res.json({ items: ALL_PERMISSIONS });

    // Build tree
    const map = new Map();
    items.forEach(i => { i.children = []; map.set(i._id.toString(), i); });
    const roots = [];
    items.forEach(i => {
      if (i.parent) {
        const p = map.get(i.parent.toString());
        if (p) p.children.push(i);
        else roots.push(i); // orphaned
      } else {
        roots.push(i);
      }
    });

    return res.json({ items: roots });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to load sidebar items' });
  }
});

// Create menu item (super_admin only)
router.post('/sidebar/items', verifyToken, authorizeRoles('super_admin'), async (req, res) => {
  try {
    const { key, label, route, parent, isPublic, permission, icon, iconType, badge, meta } = req.body;
    if (!key || !label) return res.status(400).json({ message: 'key and label required' });

    const exists = await MenuItem.findOne({ key });
    if (exists) return res.status(400).json({ message: 'Menu item with this key already exists' });

    let nextOrder;

    // ✅ PARENT KE ANDAR AUTOMATIC LAST ORDER
    if (parent) {
      // Same parent ke children me max order find karo
      const maxChildOrder = await MenuItem.findOne(
        { parent }, 
        { order: 1 }
      ).sort({ order: -1 });
      nextOrder = (maxChildOrder?.order || 0) + 1;
    } else {
      // Root level ke liye max order
      const maxRootOrder = await MenuItem.findOne(
        { parent: null }, 
        { order: 1 }
      ).sort({ order: -1 }) || { order: 0 };
      nextOrder = maxRootOrder.order + 1;
    }

    const mi = new MenuItem({
      key,
      label,
      route: route || '',
      parent: parent || null,
      order: nextOrder, // ✅ Automatic position (parent ya root)
      isPublic: !!isPublic,
      permission: permission || null,
      icon: icon || null,
      iconType: iconType || 'font',
      badge: badge || null,
      meta: meta || {},
      createdBy: req.user.id
    });
    await mi.save();
    res.status(201).json({ message: 'Menu item created', item: mi });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Update menu item (super_admin only)
router.put('/sidebar/items/:id', verifyToken, authorizeRoles('super_admin'), async (req, res) => {
  try {
    const updates = req.body;
    const item = await MenuItem.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    res.json({ message: 'Updated', item });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete menu item (super_admin only)
router.delete('/sidebar/items/:id', verifyToken, authorizeRoles('super_admin'), async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    // Optionally orphan or cascade-delete children. Here we orphan children (set parent=null)
    await MenuItem.updateMany({ parent: item._id }, { $set: { parent: null } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Assign permission to users or roles (super_admin only)
// body: { userIds: [...], addPermissions: [...], removePermissions: [...] }
router.post('/sidebar/items/:id/assign', verifyToken, authorizeRoles('super_admin'), async (req, res) => {
  try {
    const { userIds, addPermissions = [], removePermissions = [] } = req.body;
    if (!Array.isArray(userIds) || userIds.length === 0) return res.status(400).json({ message: 'userIds array required' });

    const users = await User.find({ _id: { $in: userIds } });
    for (const u of users) {
      const perms = new Set(u.permissions || []);
      addPermissions.forEach(p => perms.add(p));
      removePermissions.forEach(p => perms.delete(p));
      u.permissions = Array.from(perms);
      await u.save();
    }
    res.json({ message: 'Permissions updated for users', count: users.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
