export default function Sidebar({ page, setPage }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-text">PharmaCRM</div>
        <div className="logo-sub">Pharmacy Management</div>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-label">Main Menu</div>
        <button className={`nav-item ${page === "dashboard" ? "active" : ""}`} onClick={() => setPage("dashboard")}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </button>
        <button className={`nav-item ${page === "inventory" ? "active" : ""}`} onClick={() => setPage("inventory")}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          Inventory
        </button>
        <div className="nav-label" style={{ marginTop: 16 }}>Quick Actions</div>
        <button className="nav-item" onClick={() => setPage("inventory")}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Medicine
        </button>
      </nav>
      <div style={{ padding: "16px 20px", borderTop: "1px solid var(--gray-100)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="avatar">A</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-800)" }}>Admin</div>
            <div style={{ fontSize: 11, color: "var(--gray-400)" }}>Pharmacist</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
