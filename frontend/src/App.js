import React, { useState, useEffect, useCallback } from 'react';
import { getMenuTree, getMenu, createMenu } from './api/menuApi';
import MenuDetail from './components/MenuDetail';
import { MenuSidebar } from './components/MenuSidebar';
import { MenuFormModal } from './components/Modals';
import { ToastProvider, useToast } from './context/ToastContext';
import './index.css';

/* ─── Diamond SVG logo ─────────────────────────────────────────────────────── */
function DiamondLogo({ size = 40, color = '#c9a84c' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="30,2 58,18 58,42 30,58 2,42 2,18" fill="none" stroke={color} strokeWidth="2.5" />
      <polygon points="30,10 50,22 50,38 30,50 10,38 10,22" fill={color} opacity="0.15" />
      <polygon points="30,18 42,26 42,34 30,42 18,34 18,26" fill={color} opacity="0.6" />
    </svg>
  );
}

/* ─── Navbar ──────────────────────────────────────────────────────────────── */
function Navbar({ view, setView }) {
  return (
    <header className="navbar" role="banner">
      {/* Brand */}
      <div className="navbar-brand">
        <span className="navbar-title">
          <span className="brand-deep">DEEP</span>
          <span className="brand-net">NET</span>
          <span className="brand-soft">SOFT</span>
        </span>
      </div>

      {/* Centered diamond logo */}
      <div className="navbar-center-logo" aria-hidden="true">
        <DiamondLogo size={70} color="#c9a84c" />
      </div>

      {/* Nav links */}
      <nav className="navbar-nav" aria-label="Primary navigation">
        <button className={`nav-link ${view === 'home' ? 'active' : ''}`} id="nav-home" onClick={() => setView('home')}>HOME</button>
        <button className={`nav-link ${view === 'menu' ? 'active' : ''}`} id="nav-menu" onClick={() => setView('menu')}>MENU</button>
        <button className="nav-link" id="nav-reservation">MAKE A RESERVATION</button>
        <button className="nav-link" id="nav-contact">CONTACT US</button>
      </nav>
    </header>
  );
}

/* ─── Admin View ──────────────────────────────────────────────────────────── */
function AdminView({ menus, fetchMenus }) {
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [addRootOpen, setAddRootOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleAddRoot = async (data) => {
    setLoading(true);
    try {
      await createMenu(data);
      addToast(`Menu "${data.name}" created`);
      setAddRootOpen(false);
      fetchMenus();
    } catch {
      addToast('Failed to create menu', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: 'calc(100vh - 68px)', backgroundColor: 'var(--bg-primary)' }}>
      <MenuSidebar
        menus={menus}
        activeId={selectedMenu?._id}
        onSelect={setSelectedMenu}
        onAddRoot={() => setAddRootOpen(true)}
      />

      {selectedMenu ? (
        <MenuDetail
          menu={selectedMenu}
          allMenus={menus}
          onRefresh={(menuOrNull) => {
            fetchMenus();
            if (menuOrNull !== undefined) setSelectedMenu(menuOrNull);
          }}
          onSelectMenu={setSelectedMenu}
        />
      ) : (
        <div className="content-area empty-state" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="empty-state-icon">📝</div>
          <h3>Menu Management</h3>
          <p>Select a menu from the sidebar or create a new one to add products.</p>
        </div>
      )}

      {addRootOpen && (
        <MenuFormModal
          title="Create New Menu"
          onSubmit={handleAddRoot}
          onClose={() => setAddRootOpen(false)}
          loading={loading}
        />
      )}
    </div>
  );
}

/* ─── Hero / Page Header ──────────────────────────────────────────────────── */
function Hero({ menus, activeTab, onTabChange }) {
  return (
    <section className="hero" aria-label="Menu header">
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-content">
        <h1 className="hero-title">MENU</h1>
        <p className="hero-description">
          Please take a look at our menu featuring food, drinks, and brunch. If you'd like to
          place an order, use the "Order Online" button located below the menu.
        </p>
        {/* Tab navigation built from root menus */}
        {menus.length > 0 && (
          <div className="tab-nav" role="tablist" aria-label="Menu categories">
            {menus.map(menu => (
              <button
                key={menu._id}
                role="tab"
                aria-selected={activeTab === menu._id}
                className={`tab-btn${activeTab === menu._id ? ' active' : ''}`}
                onClick={() => onTabChange(menu._id)}
                id={`tab-${menu._id}`}
              >
                {menu.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── Read-only item row ──────────────────────────────────────────────────── */
function HomeItemRow({ item }) {
  return (
    <div className="menu-item-row home-item-row">
      <div className="menu-item-top">
        <span className="menu-item-name">{item.name}</span>
        <span className="menu-item-dots" aria-hidden="true" />
        <span className="menu-item-price">
          <span className="price-sign">$</span>
          {item.price > 0 ? item.price.toFixed(0) : '—'}
        </span>
      </div>
      {item.description && (
        <div className="menu-item-desc">{item.description}</div>
      )}
    </div>
  );
}

/* ─── Read-only menu section ──────────────────────────────────────────────── */
function HomeMenuSection({ menu, index = 0 }) {
  const styleClass = index % 2 === 0 ? 'hms-odd' : 'hms-even';
  return (
    <div className={`menu-section home-menu-section ${styleClass}`}>
      <div className="category-label-col">
        <div className="category-badge">{menu.name}</div>
        {menu.description && (
          <div className="category-desc">{menu.description}</div>
        )}
      </div>
      <div className="menu-items-col">
        {menu.items && menu.items.length > 0 ? (
          menu.items.map(item => <HomeItemRow key={item._id} item={item} />)
        ) : (
          <p className="home-no-items">No items in this category yet.</p>
        )}
      </div>
      {menu.imageUrl && (
        <div className="category-image-col">
          <img src={menu.imageUrl} alt={menu.name} className="category-image" />
        </div>
      )}
    </div>
  );
}

/* ─── Opening Hours ───────────────────────────────────────────────────────── */
function OpeningHours() {
  return (
    <section className="hours-section" aria-label="Opening hours">
      <div className="hours-box">
        <div className="hours-label-col">
          <div className="hours-eyebrow">Be there on time</div>
          <div className="hours-title">OPENING HOURS</div>
        </div>
        <div className="hours-grid">
          <div className="hours-group">
            <div className="hours-day">MONDAY- THURSDAY</div>
            <div className="hours-time">12 PM–12 AM</div>
          </div>
          <div className="hours-group hours-separator">
            <div className="hours-day">FRIDAY- SATURDAY</div>
            <div className="hours-time">12 PM–01 AM</div>
          </div>
          <div className="hours-group hours-separator">
            <div className="hours-day">SUNDAY</div>
            <div className="hours-time">12 PM–11 PM</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ──────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-grid">
        {/* Connect With Us */}
        <div className="footer-col footer-box">
          <div className="footer-col-title">CONNECT WITH US</div>
          <div className="footer-info-row">
            <span className="footer-info-icon">📞</span>
            <span>+91 940 061 3433</span>
          </div>
          <div className="footer-info-row">
            <span className="footer-info-icon">✉️</span>
            <span>info@deepnetsoft.com</span>
          </div>
        </div>

        {/* Center logo */}
        <div className="footer-col footer-box footer-logo-area">
          <div className="footer-logo-overlap">
            <DiamondLogo size={60} color="#c9a84c" />
          </div>
          <div className="footer-brand"><span className="brand-deep">DEEP</span> <span className="brand-net">NET</span> <span className="brand-soft">SOFT</span></div>
          <div className="footer-social">
            <button className="social-link" title="Facebook">f</button>
            <button className="social-link" title="Twitter">𝕏</button>
            <button className="social-link" title="Youtube">▶</button>
            <button className="social-link" title="Instagram">ig</button>
          </div>
        </div>

        {/* Find Us */}
        <div className="footer-col footer-box">
          <div className="footer-col-title">FIND US</div>
          <div className="footer-info-row">
            <span className="footer-info-icon">📍</span>
            <span>First floor, Geo infopark,<br />Infopark EXPY, Kakkanad</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Deepnetsoft Solutions. All rights reserved.</span>
        <div className="footer-bottom-links">
          <a href="#terms">Terms &amp; Conditions</a>
          <a href="#privacy">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}

/* ─── Main App Content ────────────────────────────────────────────────────── */
function AppContent() {
  const { addToast } = useToast();

  const [view, setView] = useState('home');
  const [menus, setMenus] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [activeMenuData, setActiveMenuData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);

  /* ── Load full tree ─────────────────────────────────────────────────────── */
  const fetchMenus = useCallback(async () => {
    try {
      const tree = await getMenuTree();
      setMenus(tree);

      if (tree.length > 0) {
        const first = await getMenu(tree[0]._id);
        setActiveMenuData(first);
        setActiveTab(tree[0]._id);
      } else {
        setActiveMenuData(null);
        setActiveTab(null);
      }
    } catch {
      addToast('Failed to load menus', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchMenus(); }, [fetchMenus]);

  /* ── Switch tabs ────────────────────────────────────────────────────────── */
  const handleTabChange = useCallback(async (menuId) => {
    setActiveTab(menuId);
    setTabLoading(true);
    try {
      const full = await getMenu(menuId);
      setActiveMenuData(full);
    } catch {
      addToast('Could not load menu', 'error');
    } finally {
      setTabLoading(false);
    }
  }, [addToast]);

  /* ── Build flat list of sections ────────────────────────────────────────── */
  const sections = [];
  if (activeMenuData) {
    if (activeMenuData.items && activeMenuData.items.length > 0) {
      sections.push(activeMenuData);
    }
    if (activeMenuData.children && activeMenuData.children.length > 0) {
      activeMenuData.children.forEach(child => sections.push(child));
    }
  }

  return (
    <div className="app">
      <Navbar view={view} setView={setView} />

      {view === 'menu' ? (
        <AdminView menus={menus} fetchMenus={fetchMenus} />
      ) : (
        <>
          <Hero menus={menus} activeTab={activeTab} onTabChange={handleTabChange} />

          <main className="main" id="home-content">
            {loading ? (
              <div className="loader" style={{ minHeight: '30vh' }}>
                <div className="spinner" />
                <p className="loader-text">Loading…</p>
              </div>
            ) : menus.length === 0 ? (
              <div className="welcome-screen">
                <div className="welcome-icon">🍽️</div>
                <h2>No Menu Available</h2>
                <p>Check back soon for our upcoming menu.</p>
              </div>
            ) : tabLoading ? (
              <div className="loader" style={{ minHeight: '30vh' }}>
                <div className="spinner" />
                <p className="loader-text">Loading…</p>
              </div>
            ) : (
              <div className="menu-page" key={activeTab}>
                {sections.length > 0 ? (
                  <div className="menu-frame">
                    <img src="/images/img1.png" alt="Skewers" className="dec-img dec-skewers" aria-hidden="true" />
                    <img src="/images/img2.png" alt="Board" className="dec-img dec-board" aria-hidden="true" />
                    <img src="/images/img3.png" alt="Sandwich" className="dec-img dec-sandwich" aria-hidden="true" />
                    <div className="menu-frame-inner">
                      {sections.map((section, idx) => (
                        <HomeMenuSection key={section._id} menu={section} index={idx} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="welcome-screen">
                    <div className="welcome-icon">🍽️</div>
                    <h2>No items yet</h2>
                    <p>Check back soon.</p>
                  </div>
                )}
              </div>
            )}
          </main>

          <OpeningHours />
          <Footer />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
