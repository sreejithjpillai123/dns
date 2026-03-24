import React, { useState } from 'react';

/**
 * Reusable Modal with overlay backdrop
 */
export function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <h2 className="modal-title" id="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/**
 * Confirmation dialog modal
 */
export function ConfirmModal({ title, message, onConfirm, onCancel, loading }) {
  return (
    <Modal title={title} onClose={onCancel}>
      <div className="confirm-modal">
        <div className="confirm-icon">⚠️</div>
        <p>{message}</p>
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/**
 * Menu create/edit form modal
 */
export function MenuFormModal({ title, initialData = {}, onSubmit, onClose, loading }) {
  const [name, setName] = useState(initialData.name || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [imageUrl, setImageUrl] = useState(initialData.imageUrl || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), description: description.trim(), imageUrl: imageUrl.trim() });
  };

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="menu-name">Menu Name *</label>
          <input
            id="menu-name"
            className="form-input"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Drinks, Food, Brunch…"
            required
            autoFocus
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="menu-desc">Description</label>
          <textarea
            id="menu-desc"
            className="form-textarea"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Brief description of this menu…"
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="menu-image">Image URL</label>
          <input
            id="menu-image"
            className="form-input"
            type="text"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            placeholder="e.g. /images/salad.png or https://..."
          />
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-gold" disabled={loading || !name.trim()}>
            {loading ? 'Saving…' : initialData._id ? 'Update Menu' : 'Create Menu'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/**
 * Menu item create/edit form modal
 */
export function ItemFormModal({ title, initialData = {}, onSubmit, onClose, loading }) {
  const [name, setName] = useState(initialData.name || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [price, setPrice] = useState(initialData.price || '');
  const [imageUrl, setImageUrl] = useState(initialData.imageUrl || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price) || 0,
      imageUrl: imageUrl.trim(),
    });
  };

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="item-name">Item Name *</label>
          <input
            id="item-name"
            className="form-input"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Caesar Salad, Mojito…"
            required
            autoFocus
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="item-desc">Description</label>
          <textarea
            id="item-desc"
            className="form-textarea"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Item description, ingredients, notes…"
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="item-price">Price ($)</label>
          <div className="form-input-prefix">
            <span>$</span>
            <input
              id="item-price"
              className="form-input"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="item-image">Image URL</label>
          <input
            id="item-image"
            className="form-input"
            type="text"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            placeholder="e.g. /images/item.png or https://..."
          />
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-gold" disabled={loading || !name.trim()}>
            {loading ? 'Saving…' : initialData._id ? 'Update Item' : 'Add Item'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
