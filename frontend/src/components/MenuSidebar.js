import React, { useState } from 'react';

// Emoji icons for auto-assigning to menus based on keywords
const MENU_ICONS = {
  drink: '🍹', drinks: '🍹', beverage: '🍹', cocktail: '🍸', beer: '🍺', wine: '🍷', coffee: '☕',
  food: '🍽️', meal: '🍽️', main: '🍽️',
  brunch: '🥂', breakfast: '🍳', egg: '🍳',
  lunch: '🥗',
  dinner: '🥩',
  dessert: '🍰', sweet: '🍰', cake: '🎂', pastry: '🥐',
  pizza: '🍕', pasta: '🍝', burger: '🍔', sandwich: '🥪',
  salad: '🥗', soup: '🍲',
  seafood: '🦞', fish: '🐟',
  grill: '🥩', bbq: '🥩', steak: '🥩', meat: '🥩',
  vegetarian: '🥦', vegan: '🌱',
  special: '⭐', specials: '⭐',
  snack: '🍟', appetizer: '🍤', starter: '🍤',
  kids: '👶',
  default: '🍴',
};

export function getMenuIcon(name) {
  const lower = (name || '').toLowerCase();
  for (const [key, icon] of Object.entries(MENU_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return MENU_ICONS.default;
}

/**
 * A single tree node row in the sidebar
 */
function TreeNode({ menu, depth = 0, activeId, onSelect, onAddChild, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(depth === 0);
  const hasChildren = menu.children && menu.children.length > 0;
  const isActive = activeId === menu._id;

  const totalItems = countTotalItems(menu);

  return (
    <div className="menu-tree-item">
      <div
        className={`menu-tree-row ${isActive ? 'active' : ''}`}
        style={{ paddingLeft: `${20 + depth * 16}px` }}
        onClick={() => onSelect(menu)}
      >
        {/* Expand/collapse toggle */}
        <span
          className={`menu-tree-toggle ${hasChildren ? (expanded ? 'expanded' : '') : 'placeholder'}`}
          onClick={e => {
            if (hasChildren) {
              e.stopPropagation();
              setExpanded(v => !v);
            }
          }}
        >
          ▶
        </span>

        <span className="menu-tree-icon">{getMenuIcon(menu.name)}</span>
        <span className="menu-tree-name">{menu.name}</span>
        {totalItems > 0 && <span className="menu-tree-badge">{totalItems}</span>}
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div className="menu-tree-children">
          {menu.children.map(child => (
            <TreeNode
              key={child._id}
              menu={child}
              depth={depth + 1}
              activeId={activeId}
              onSelect={onSelect}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function countTotalItems(menu) {
  let count = menu.items ? menu.items.length : 0;
  if (menu.children) {
    menu.children.forEach(c => { count += countTotalItems(c); });
  }
  return count;
}

/**
 * Sidebar with the full nested menu tree
 */
export function MenuSidebar({ menus, activeId, onSelect, onAddRoot, onAddChild, onEdit, onDelete, loading }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>Menu Navigation</h3>
      </div>

      {loading ? (
        <div className="loader" style={{ padding: '30px' }}>
          <div className="spinner"></div>
        </div>
      ) : (
        <nav className="menu-tree" aria-label="Menu navigation">
          {menus.length === 0 ? (
            <div style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
              No menus yet. Create your first menu below.
            </div>
          ) : (
            menus.map(menu => (
              <TreeNode
                key={menu._id}
                menu={menu}
                depth={0}
                activeId={activeId}
                onSelect={onSelect}
                onAddChild={onAddChild}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </nav>
      )}

      <button className="sidebar-add-btn" onClick={onAddRoot} id="add-root-menu-btn">
        <span>＋</span> Add Menu
      </button>
    </aside>
  );
}
