// components/Layout.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const NAV_ITEMS = [
  { href: '/dashboard',           icon: '🏠', label: 'होम',              labelEn: 'Home' },
  { href: '/dashboard/patients',  icon: '👥', label: 'मरीज़',             labelEn: 'Patients' },
  { href: '/dashboard/voice',     icon: '🎙', label: 'आवाज़ से दर्ज करें', labelEn: 'Voice Input', badge: 'NEW' },
  { href: '/dashboard/reports',   icon: '📋', label: 'रिपोर्ट',           labelEn: 'Reports' },
  { href: '/dashboard/vaccinations', icon: '💉', label: 'टीकाकरण',        labelEn: 'Vaccinations' },
  { href: '/dashboard/reminders', icon: '🔔', label: 'अनुस्मारक',         labelEn: 'Reminders' },
  { href: '/dashboard/settings',  icon: '⚙️', label: 'सेटिंग',            labelEn: 'Settings' },
];

export default function Layout({ children, workerName, workerDistrict }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [router.pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        .ss-layout {
          display: flex;
          min-height: 100vh;
          background: #f4faf6;
          font-family: 'DM Sans', sans-serif;
        }

        /* ─── SIDEBAR ─── */
        .ss-sidebar {
          width: 240px;
          flex-shrink: 0;
          background: #0d3d20;
          display: flex;
          flex-direction: column;
          padding: 0;
          position: relative;
          z-index: 10;
        }

        .ss-sidebar-logo {
          padding: 1.5rem 1.2rem 1.2rem;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .ss-sidebar-logo .logo-text {
          font-family: 'Sora', sans-serif;
          font-size: 1.15rem;
          font-weight: 800;
          color: #2ecc71;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .ss-sidebar-logo .lang-pill {
          display: inline-block;
          margin-top: 0.5rem;
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.55);
          font-size: 0.72rem;
          padding: 0.2rem 0.6rem;
          border-radius: 50px;
        }

        .ss-nav {
          flex: 1;
          padding: 1rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .ss-nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.65rem 0.85rem;
          border-radius: 10px;
          text-decoration: none;
          color: rgba(255,255,255,0.65);
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.18s;
          position: relative;
          cursor: pointer;
        }
        .ss-nav-item:hover {
          background: rgba(255,255,255,0.08);
          color: white;
        }
        .ss-nav-item.active {
          background: rgba(46,204,113,0.18);
          color: #2ecc71;
          font-weight: 600;
        }
        .ss-nav-item .nav-icon {
          font-size: 1.1rem;
          width: 24px;
          text-align: center;
        }
        .ss-nav-badge {
          margin-left: auto;
          background: #e67e22;
          color: white;
          font-size: 0.6rem;
          font-weight: 700;
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
          letter-spacing: 0.04em;
        }

        .ss-sidebar-footer {
          padding: 1rem 1.2rem;
          border-top: 1px solid rgba(255,255,255,0.08);
        }
        .ss-worker-card {
          background: rgba(255,255,255,0.06);
          border-radius: 10px;
          padding: 0.75rem 0.9rem;
        }
        .ss-worker-name {
          font-size: 0.88rem;
          font-weight: 600;
          color: white;
        }
        .ss-worker-district {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.45);
          margin-top: 2px;
        }

        /* ─── MOBILE TOPBAR ─── */
        .ss-topbar {
          display: none;
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 200;
          height: 56px;
          background: #0d3d20;
          align-items: center;
          padding: 0 1rem;
          gap: 0.75rem;
          box-shadow: 0 2px 12px rgba(0,0,0,0.3);
        }
        .ss-hamburger {
          background: none;
          border: none;
          color: white;
          font-size: 1.4rem;
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }
        .ss-hamburger:active {
          background: rgba(255,255,255,0.1);
        }
        .ss-topbar-logo {
          font-family: 'Sora', sans-serif;
          font-size: 1.1rem;
          font-weight: 800;
          color: #2ecc71;
        }
        .ss-topbar-action {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        /* ─── OVERLAY ─── */
        .ss-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 150;
          backdrop-filter: blur(2px);
        }
        .ss-overlay.open {
          display: block;
        }

        /* ─── CLOSE BTN inside sidebar (mobile only) ─── */
        .ss-close-btn {
          display: none;
          background: none;
          border: none;
          color: rgba(255,255,255,0.5);
          font-size: 1.3rem;
          cursor: pointer;
          padding: 1rem 1.2rem 0;
          margin-left: auto;
          line-height: 1;
        }

        /* ─── MAIN CONTENT ─── */
        .ss-main {
          flex: 1;
          min-width: 0;
          overflow-x: hidden;
        }

        /* ─── RESPONSIVE ─── */
        @media (max-width: 768px) {
          .ss-topbar {
            display: flex;
          }

          .ss-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            width: 270px;
            z-index: 300;
            transform: translateX(-100%);
            transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
            overflow-y: auto;
          }
          .ss-sidebar.open {
            transform: translateX(0);
            box-shadow: 4px 0 30px rgba(0,0,0,0.4);
          }

          .ss-close-btn {
            display: block;
          }

          .ss-main {
            padding-top: 56px;
          }
        }

        @media (min-width: 769px) {
          .ss-topbar { display: none; }
          .ss-close-btn { display: none; }
        }
      `}</style>

      {/* Mobile Top Bar */}
      <div className="ss-topbar">
        <button
          className="ss-hamburger"
          onClick={() => setSidebarOpen(true)}
          aria-label="मेनू खोलें"
        >
          ☰
        </button>
        <span className="ss-topbar-logo">🌿 SwasthyaSathi</span>
        <div className="ss-topbar-action">
          <Link
            href="/dashboard/patients/new"
            style={{
              background: '#2ecc71',
              color: '#0d3d20',
              padding: '0.4rem 0.9rem',
              borderRadius: '50px',
              textDecoration: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
          >
            + मरीज़
          </Link>
        </div>
      </div>

      {/* Overlay */}
      <div
        className={`ss-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className="ss-layout">
        {/* Sidebar */}
        <aside className={`ss-sidebar ${sidebarOpen ? 'open' : ''}`}>
          {/* Close button (mobile) */}
          <button
            className="ss-close-btn"
            onClick={() => setSidebarOpen(false)}
            aria-label="बंद करें"
          >
            ✕
          </button>

          {/* Logo */}
          <div className="ss-sidebar-logo">
            <div className="logo-text">🌿 SwasthyaSathi</div>
            <span className="lang-pill">🌐 LANGUAGE / भाषा</span>
            <div style={{ marginTop: '0.4rem' }}>
              <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600 }}>हिंदी — Hindi</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="ss-nav">
            {NAV_ITEMS.map((item) => {
              const isActive = router.pathname === item.href ||
                (item.href !== '/dashboard' && router.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`ss-nav-item ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ss-nav-badge">{item.badge}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Worker Info Footer */}
          <div className="ss-sidebar-footer">
            <div className="ss-worker-card">
              <div className="ss-worker-name">
                👩 {workerName || 'ASHA Worker'}
              </div>
              <div className="ss-worker-district">
                📍 {workerDistrict || 'District not set'}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ss-main">
          {children}
        </main>
      </div>
    </>
  );
}