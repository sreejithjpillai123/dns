const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu');

// Helper: recursively build a tree from flat list
async function buildTree(parentId = null) {
  const menus = await Menu.find({ parent: parentId }).sort({ order: 1, createdAt: 1 });
  const result = [];
  for (const menu of menus) {
    const children = await buildTree(menu._id);
    result.push({
      _id: menu._id,
      name: menu.name,
      description: menu.description,
      imageUrl: menu.imageUrl,
      items: menu.items,
      order: menu.order,
      children,
      createdAt: menu.createdAt,
    });
  }
  return result;
}

// GET /api/menus - Get full nested menu tree
router.get('/', async (req, res) => {
  try {
    const tree = await buildTree(null);
    res.json(tree);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/menus/:id - Get a single menu with its children and items
router.get('/:id', async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    if (!menu) return res.status(404).json({ error: 'Menu not found' });
    const children = await buildTree(menu._id);
    res.json({ ...menu.toObject(), children });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/menus - Create a new menu (top-level or sub-menu)
router.post('/', async (req, res) => {
  try {
    const { name, description, parent, order, imageUrl } = req.body;
    const menu = new Menu({ name, description, parent: parent || null, order: order || 0, imageUrl: imageUrl || '' });
    await menu.save();
    res.status(201).json(menu);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/menus/:id - Update a menu
router.put('/:id', async (req, res) => {
  try {
    const { name, description, order, imageUrl } = req.body;
    const menu = await Menu.findByIdAndUpdate(
      req.params.id,
      { name, description, order, imageUrl },
      { new: true, runValidators: true }
    );
    if (!menu) return res.status(404).json({ error: 'Menu not found' });
    res.json(menu);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/menus/:id - Delete a menu and all its descendants
async function deleteDescendants(menuId) {
  const children = await Menu.find({ parent: menuId });
  for (const child of children) {
    await deleteDescendants(child._id);
    await Menu.findByIdAndDelete(child._id);
  }
}

router.delete('/:id', async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    if (!menu) return res.status(404).json({ error: 'Menu not found' });
    await deleteDescendants(req.params.id);
    await Menu.findByIdAndDelete(req.params.id);
    res.json({ message: 'Menu and all sub-menus deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/menus/:id/items - Add an item to a menu
router.post('/:id/items', async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    if (!menu) return res.status(404).json({ error: 'Menu not found' });
    const { name, description, price, imageUrl } = req.body;
    menu.items.push({ name, description, price, imageUrl });
    await menu.save();
    res.status(201).json(menu);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/menus/:id/items/:itemId - Update an item
router.put('/:id/items/:itemId', async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    if (!menu) return res.status(404).json({ error: 'Menu not found' });
    const item = menu.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    const { name, description, price, imageUrl } = req.body;
    if (name !== undefined) item.name = name;
    if (description !== undefined) item.description = description;
    if (price !== undefined) item.price = price;
    if (imageUrl !== undefined) item.imageUrl = imageUrl;
    await menu.save();
    res.json(menu);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/menus/:id/items/:itemId - Delete an item
router.delete('/:id/items/:itemId', async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    if (!menu) return res.status(404).json({ error: 'Menu not found' });
    menu.items = menu.items.filter(item => item._id.toString() !== req.params.itemId);
    await menu.save();
    res.json(menu);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
