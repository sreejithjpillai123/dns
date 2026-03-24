import React, { useState } from 'react';
import { getMenuIcon } from './MenuSidebar';
import { ConfirmModal, MenuFormModal, ItemFormModal } from './Modals';
import { updateMenu, deleteMenu, createMenu, createItem, updateItem, deleteItem } from '../api/menuApi';
import { useToast } from '../context/ToastContext';

/**
 * Builds the breadcrumb trail for a selected menu by traversing the full tree
 */
function buildBreadcrumb(menus, targetId, trail = []) {
  for (const menu of menus) {
    const current = [...trail, { _id: menu._id, name: menu.name }];
    if (menu._id === targetId) return current;
    if (menu.children && menu.children.length > 0) {
      const found = buildBreadcrumb(menu.children, targetId, current);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Displays the detail view for a selected menu:
 * - Breadcrumb
 * - Menu name + description + actions (edit, delete, add sub-menu)
 * - Sub-menus grid (clickable cards)
 * - Items list with add/edit/delete
 */
export default function MenuDetail({ menu, allMenus, onRefresh, onSelectMenu }) {
  const { addToast } = useToast();

  // UI state
  const [editMenuOpen, setEditMenuOpen] = useState(false);
  const [deleteMenuOpen, setDeleteMenuOpen] = useState(false);
  const [addSubMenuOpen, setAddSubMenuOpen] = useState(false);
  const [editSubMenu, setEditSubMenu] = useState(null);
  const [deleteSubMenu, setDeleteSubMenu] = useState(null);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItemTarget, setDeleteItemTarget] = useState(null);
  const [loading, setLoading] = useState(false);

  const breadcrumb = buildBreadcrumb(allMenus, menu._id) || [{ _id: menu._id, name: menu.name }];

  // ─── Menu CRUD ──────────────────────────────────────────────────────────────

  const handleEditMenu = async (data) => {
    setLoading(true);
    try {
      await updateMenu(menu._id, data);
      addToast(`"${data.name}" updated successfully`);
      setEditMenuOpen(false);
      onRefresh();
    } catch {
      addToast('Failed to update menu', 'error');
    } finally { setLoading(false); }
  };

  const handleDeleteMenu = async () => {
    setLoading(true);
    try {
      await deleteMenu(menu._id);
      addToast(`"${menu.name}" deleted`);
      setDeleteMenuOpen(false);
      onRefresh(null); // deselect after delete
    } catch {
      addToast('Failed to delete menu', 'error');
    } finally { setLoading(false); }
  };

  // ─── Sub-menu CRUD ──────────────────────────────────────────────────────────

  const handleAddSubMenu = async (data) => {
    setLoading(true);
    try {
      await createMenu({ ...data, parent: menu._id });
      addToast(`Sub-menu "${data.name}" created`);
      setAddSubMenuOpen(false);
      onRefresh();
    } catch {
      addToast('Failed to create sub-menu', 'error');
    } finally { setLoading(false); }
  };

  const handleEditSubMenu = async (data) => {
    setLoading(true);
    try {
      await updateMenu(editSubMenu._id, data);
      addToast(`"${data.name}" updated`);
      setEditSubMenu(null);
      onRefresh();
    } catch {
      addToast('Failed to update sub-menu', 'error');
    } finally { setLoading(false); }
  };

  const handleDeleteSubMenu = async () => {
    setLoading(true);
    try {
      await deleteMenu(deleteSubMenu._id);
      addToast(`"${deleteSubMenu.name}" deleted`);
      setDeleteSubMenu(null);
      onRefresh();
    } catch {
      addToast('Failed to delete sub-menu', 'error');
    } finally { setLoading(false); }
  };

  // ─── Item CRUD ──────────────────────────────────────────────────────────────

  const handleAddItem = async (data) => {
    setLoading(true);
    try {
      await createItem(menu._id, data);
      addToast(`"${data.name}" added to menu`);
      setAddItemOpen(false);
      onRefresh();
    } catch {
      addToast('Failed to add item', 'error');
    } finally { setLoading(false); }
  };

  const handleEditItem = async (data) => {
    setLoading(true);
    try {
      await updateItem(menu._id, editItem._id, data);
      addToast(`"${data.name}" updated`);
      setEditItem(null);
      onRefresh();
    } catch {
      addToast('Failed to update item', 'error');
    } finally { setLoading(false); }
  };

  const handleDeleteItem = async () => {
    setLoading(true);
    try {
      await deleteItem(menu._id, deleteItemTarget._id);
      addToast(`"${deleteItemTarget.name}" removed`);
      setDeleteItemTarget(null);
      onRefresh();
    } catch {
      addToast('Failed to delete item', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="content-area">
      {/* Breadcrumb */}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <span
          className="breadcrumb-item"
          onClick={() => onSelectMenu(null)}
        >
          🏠 Home
        </span>
        {breadcrumb.map((crumb, i) => (
          <React.Fragment key={crumb._id}>
            <span className="breadcrumb-sep">›</span>
            <span
              className={`breadcrumb-item ${i === breadcrumb.length - 1 ? 'current' : ''}`}
              onClick={() => i < breadcrumb.length - 1 && onSelectMenu({ _id: crumb._id })}
            >
              {crumb.name}
            </span>
          </React.Fragment>
        ))}
      </nav>

      {/* Menu Header */}
      <div className="menu-header">
        <div className="menu-header-info">
          <h1>
            <span style={{ marginRight: '12px' }}>{getMenuIcon(menu.name)}</span>
            {menu.name}
          </h1>
          {menu.description && (
            <p className="menu-header-description">{menu.description}</p>
          )}
        </div>

        <div className="menu-header-actions">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setAddSubMenuOpen(true)}
            id="add-submenu-btn"
          >
            ＋ Sub-Menu
          </button>
          <button
            className="btn btn-ghost btn-sm btn-icon"
            onClick={() => setEditMenuOpen(true)}
            id="edit-menu-btn"
            title="Edit menu"
          >
            ✏️
          </button>
          <button
            className="btn btn-danger btn-sm btn-icon"
            onClick={() => setDeleteMenuOpen(true)}
            id="delete-menu-btn"
            title="Delete menu"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Sub-Menus Section */}
      {menu.children && menu.children.length > 0 && (
        <>
          <div className="section-divider">
            <div className="section-divider-line"></div>
            <span className="section-divider-title">Sub-Menus</span>
            <div className="section-divider-line"></div>
          </div>

          <div className="submenus-grid">
            {menu.children.map(child => (
              <div
                key={child._id}
                className="submenu-card"
                onClick={() => onSelectMenu(child)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && onSelectMenu(child)}
              >
                <div className="submenu-card-icon">{getMenuIcon(child.name)}</div>
                <div className="submenu-card-name">{child.name}</div>
                {child.description && (
                  <div className="submenu-card-description">{child.description}</div>
                )}
                <div className="submenu-card-meta">
                  <span className="submenu-card-count">
                    {child.items?.length || 0} item{child.items?.length !== 1 ? 's' : ''}
                    {child.children?.length > 0 && ` · ${child.children.length} sub-menu${child.children.length !== 1 ? 's' : ''}`}
                  </span>
                  <div className="submenu-card-actions" onClick={e => e.stopPropagation()}>
                    <button
                      className="icon-btn icon-btn-edit"
                      onClick={() => setEditSubMenu(child)}
                      title="Edit sub-menu"
                    >✏️</button>
                    <button
                      className="icon-btn icon-btn-danger"
                      onClick={() => setDeleteSubMenu(child)}
                      title="Delete sub-menu"
                    >🗑️</button>
                  </div>
                </div>
              </div>
            ))}

            {/* "Add sub-menu" card shortcut */}
            <div
              className="submenu-card"
              style={{ borderStyle: 'dashed', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px', minHeight: '140px' }}
              onClick={() => setAddSubMenuOpen(true)}
            >
              <span style={{ fontSize: '1.8rem', opacity: 0.4 }}>＋</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Add Sub-Menu</span>
            </div>
          </div>
        </>
      )}

      {/* Items Section */}
      <div className="section-divider">
        <div className="section-divider-line"></div>
        <span className="section-divider-title">Menu Items</span>
        <div className="section-divider-line"></div>
      </div>

      {menu.items && menu.items.length > 0 ? (
        <>
          <div className="items-list" style={{ marginBottom: '24px' }}>
            {menu.items.map(item => (
              <div key={item._id} className="item-card">
                <div className="item-card-dot"></div>
                <div className="item-card-info">
                  <div className="item-card-name">{item.name}</div>
                  {item.description && (
                    <div className="item-card-description">{item.description}</div>
                  )}
                </div>
                {item.price > 0 && (
                  <div className="item-card-price">{item.price.toFixed(2)}</div>
                )}
                <div className="item-card-actions">
                  <button
                    className="icon-btn icon-btn-edit"
                    onClick={() => setEditItem(item)}
                    title="Edit item"
                  >✏️</button>
                  <button
                    className="icon-btn icon-btn-danger"
                    onClick={() => setDeleteItemTarget(item)}
                    title="Delete item"
                  >🗑️</button>
                </div>
              </div>
            ))}
          </div>

          <button
            className="btn btn-gold"
            onClick={() => setAddItemOpen(true)}
            id="add-item-btn"
          >
            ＋ Add Item
          </button>
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">🍽️</div>
          <h3>No items yet</h3>
          <p>Start adding dishes, drinks, or offerings to this menu.</p>
          <button className="btn btn-gold" onClick={() => setAddItemOpen(true)} id="add-first-item-btn">
            ＋ Add Your First Item
          </button>
        </div>
      )}

      {/* ─── Modals ─────────────────────────────────────────────────────────── */}

      {editMenuOpen && (
        <MenuFormModal
          title={`Edit "${menu.name}"`}
          initialData={menu}
          onSubmit={handleEditMenu}
          onClose={() => setEditMenuOpen(false)}
          loading={loading}
        />
      )}

      {deleteMenuOpen && (
        <ConfirmModal
          title="Delete Menu"
          message={`Are you sure you want to delete "${menu.name}" and all its sub-menus and items? This cannot be undone.`}
          onConfirm={handleDeleteMenu}
          onCancel={() => setDeleteMenuOpen(false)}
          loading={loading}
        />
      )}

      {addSubMenuOpen && (
        <MenuFormModal
          title={`Add Sub-Menu under "${menu.name}"`}
          onSubmit={handleAddSubMenu}
          onClose={() => setAddSubMenuOpen(false)}
          loading={loading}
        />
      )}

      {editSubMenu && (
        <MenuFormModal
          title={`Edit "${editSubMenu.name}"`}
          initialData={editSubMenu}
          onSubmit={handleEditSubMenu}
          onClose={() => setEditSubMenu(null)}
          loading={loading}
        />
      )}

      {deleteSubMenu && (
        <ConfirmModal
          title="Delete Sub-Menu"
          message={`Delete "${deleteSubMenu.name}" and all its contents?`}
          onConfirm={handleDeleteSubMenu}
          onCancel={() => setDeleteSubMenu(null)}
          loading={loading}
        />
      )}

      {addItemOpen && (
        <ItemFormModal
          title={`Add Item to "${menu.name}"`}
          onSubmit={handleAddItem}
          onClose={() => setAddItemOpen(false)}
          loading={loading}
        />
      )}

      {editItem && (
        <ItemFormModal
          title={`Edit "${editItem.name}"`}
          initialData={editItem}
          onSubmit={handleEditItem}
          onClose={() => setEditItem(null)}
          loading={loading}
        />
      )}

      {deleteItemTarget && (
        <ConfirmModal
          title="Remove Item"
          message={`Remove "${deleteItemTarget.name}" from this menu?`}
          onConfirm={handleDeleteItem}
          onCancel={() => setDeleteItemTarget(null)}
          loading={loading}
        />
      )}
    </div>
  );
}
