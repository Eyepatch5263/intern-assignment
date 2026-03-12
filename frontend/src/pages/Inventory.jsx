import { useState, useEffect, useCallback } from "react";
import { inventoryApi } from "../api";
import StatusBadge from "../components/StatusBadge";
import Spinner from "../components/Spinner";

const EMPTY_FORM = {
  name: "", category: "", manufacturer: "", price: "", stock: "",
  low_stock_threshold: "20", expiry_date: "", description: "",
};

const STATUS_OPTS = ["Active", "Low Stock", "Expired", "Out of Stock"];

function fmt(n) { return "$" + Number(n || 0).toFixed(2); }

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function MedicineForm({ form, setForm, onSubmit, onClose, saving, formError }) {
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <form onSubmit={onSubmit}>
      {formError && <div className="error-box">{formError}</div>}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Medicine Name *</label>
          <input className="input" value={form.name} onChange={set("name")} required placeholder="e.g. Paracetamol 500mg" />
        </div>
        <div className="form-group">
          <label className="form-label">Category *</label>
          <input className="input" value={form.category} onChange={set("category")} required placeholder="e.g. Analgesic" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Manufacturer</label>
          <input className="input" value={form.manufacturer} onChange={set("manufacturer")} placeholder="e.g. GSK" />
        </div>
        <div className="form-group">
          <label className="form-label">Price (USD) *</label>
          <input className="input" type="number" step="0.01" min="0" value={form.price} onChange={set("price")} required placeholder="0.00" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Stock Quantity *</label>
          <input className="input" type="number" min="0" value={form.stock} onChange={set("stock")} required placeholder="0" />
        </div>
        <div className="form-group">
          <label className="form-label">Low Stock Threshold</label>
          <input className="input" type="number" min="1" value={form.low_stock_threshold} onChange={set("low_stock_threshold")} placeholder="20" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Expiry Date</label>
          <input className="input" type="date" value={form.expiry_date} onChange={set("expiry_date")} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea className="input" rows={2} value={form.description} onChange={set("description")} placeholder="Optional notes..." style={{ resize: "vertical" }} />
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save Medicine"}
        </button>
      </div>
    </form>
  );
}

export default function Inventory() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState([]);

  const [showAdd, setShowAdd] = useState(false);
  const [editMed, setEditMed] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const [statusChangeMed, setStatusChangeMed] = useState(null);

  const fetchData = useCallback(() => {
    const params = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    if (categoryFilter) params.category = categoryFilter;

    setLoading(true);
    inventoryApi.getMedicines(params)
      .then(setMedicines)
      .catch(() => setError("Failed to load inventory."))
      .finally(() => setLoading(false));
  }, [search, statusFilter, categoryFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    inventoryApi.getCategories().then(setCategories).catch(() => { });
  }, []);

  const openAdd = () => { setForm(EMPTY_FORM); setFormError(null); setShowAdd(true); };
  const openEdit = (med) => {
    setForm({
      name: med.name, category: med.category, manufacturer: med.manufacturer || "",
      price: String(med.price), stock: String(med.stock),
      low_stock_threshold: String(med.low_stock_threshold),
      expiry_date: med.expiry_date || "", description: med.description || "",
    });
    setFormError(null);
    setEditMed(med);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setFormError(null);
    const payload = {
      name: form.name, category: form.category, manufacturer: form.manufacturer || null,
      price: parseFloat(form.price), stock: parseInt(form.stock),
      low_stock_threshold: parseInt(form.low_stock_threshold) || 20,
      expiry_date: form.expiry_date || null, description: form.description || null,
    };
    try {
      if (editMed) {
        await inventoryApi.updateMedicine(editMed.id, payload);
        setEditMed(null);
      } else {
        await inventoryApi.createMedicine(payload);
        setShowAdd(false);
      }
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.detail || "Failed to save medicine.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (med, newStatus) => {
    try {
      await inventoryApi.updateStatus(med.id, newStatus);
      fetchData();
    } catch {
      alert("Failed to update status.");
    }
    setStatusChangeMed(null);
  };

  // Summary counts
  const counts = medicines.reduce((acc, m) => {
    acc[m.status] = (acc[m.status] || 0) + 1;
    return acc;
  }, {});
  const totalValue = medicines.reduce((sum, m) => sum + m.price * m.stock, 0);

  return (
    <>
      <div className="top-bar">
        <div className="top-bar-left">
          <h1>Inventory</h1>
          <p>Manage medicines &amp; stock levels</p>
        </div>
        <div className="top-bar-right">
          <button className="btn btn-primary" onClick={openAdd}>
            <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Medicine
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* Overview */}
        <div className="section" style={{ marginBottom: 20 }}>
          <div className="overview-row">
            <div className="stat-mini">
              <div className="stat-mini-label">Total Items</div>
              <div className="stat-mini-val">{medicines.length}</div>
            </div>
            <div className="stat-mini">
              <div className="stat-mini-label">Active</div>
              <div className="stat-mini-val" style={{ color: "var(--success)" }}>{counts["Active"] || 0}</div>
            </div>
            <div className="stat-mini">
              <div className="stat-mini-label">Low Stock</div>
              <div className="stat-mini-val" style={{ color: "var(--warning)" }}>{counts["Low Stock"] || 0}</div>
            </div>
            <div className="stat-mini">
              <div className="stat-mini-label">Out of Stock</div>
              <div className="stat-mini-val" style={{ color: "var(--gray-500)" }}>{counts["Out of Stock"] || 0}</div>
            </div>
            <div className="stat-mini">
              <div className="stat-mini-label">Expired</div>
              <div className="stat-mini-val" style={{ color: "var(--danger)" }}>{counts["Expired"] || 0}</div>
            </div>
            <div className="stat-mini">
              <div className="stat-mini-label">Inventory Value</div>
              <div className="stat-mini-val" style={{ fontSize: 18 }}>${totalValue.toFixed(0)}</div>
            </div>
          </div>
        </div>

        {/* Inventory table */}
        <div className="section">
          <div className="section-header">
            <div className="section-title">Medicine List</div>
            <div className="flex items-center gap-8" style={{ flexWrap: "wrap", gap: 10 }}>
              {/* Search */}
              <div className="search-wrap" style={{ width: 220 }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input className="input" placeholder="Search medicines..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              {/* Category filter */}
              <select className="select" style={{ width: 150 }} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="">All Categories</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Status chips */}
          <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--gray-100)" }}>
            <div className="filter-bar">
              {["", "Active", "Low Stock", "Out of Stock", "Expired"].map((s) => (
                <button key={s} className={`chip ${statusFilter === s ? "active" : ""}`} onClick={() => setStatusFilter(s)}>
                  {s || "All Status"}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="error-box" style={{ margin: 20 }}>{error}</div>}

          <div className="table-wrap">
            {loading ? (
              <Spinner />
            ) : medicines.length === 0 ? (
              <div className="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p>No medicines found</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Category</th>
                    <th>Manufacturer</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Expiry</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.map((med) => (
                    <tr key={med.id}>
                      <td>
                        <div className="td-bold">{med.name}</div>
                        {med.description && <div className="td-muted" style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{med.description}</div>}
                      </td>
                      <td>
                        <span style={{ background: "var(--gray-100)", padding: "2px 8px", borderRadius: 4, fontSize: 12 }}>{med.category}</span>
                      </td>
                      <td>{med.manufacturer || <span className="td-muted">—</span>}</td>
                      <td><span style={{ fontWeight: 600 }}>{fmt(med.price)}</span></td>
                      <td>
                        <span style={{
                          fontWeight: 600,
                          color: med.stock === 0 ? "var(--gray-400)" : med.stock <= med.low_stock_threshold ? "var(--warning)" : "var(--gray-800)"
                        }}>
                          {med.stock}
                        </span>
                        <span className="td-muted"> / {med.low_stock_threshold}</span>
                      </td>
                      <td>
                        {med.expiry_date
                          ? <span className={new Date(med.expiry_date) < new Date() ? "td-muted" : ""}>{med.expiry_date}</span>
                          : <span className="td-muted">—</span>}
                      </td>
                      <td><StatusBadge status={med.status} /></td>
                      <td>
                        <div className="action-btns">
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(med)} title="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button className="btn btn-secondary btn-sm" onClick={() => setStatusChangeMed(med)} title="Change Status">
                            <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                            Status
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <Modal title="Add New Medicine" onClose={() => setShowAdd(false)}>
          <MedicineForm form={form} setForm={setForm} onSubmit={handleSubmit} onClose={() => setShowAdd(false)} saving={saving} formError={formError} />
        </Modal>
      )}

      {/* Edit Modal */}
      {editMed && (
        <Modal title={`Edit: ${editMed.name}`} onClose={() => setEditMed(null)}>
          <MedicineForm form={form} setForm={setForm} onSubmit={handleSubmit} onClose={() => setEditMed(null)} saving={saving} formError={formError} />
        </Modal>
      )}

      {/* Status Change Modal */}
      {statusChangeMed && (
        <Modal title="Update Status" onClose={() => setStatusChangeMed(null)}>
          <p style={{ color: "var(--gray-600)", marginBottom: 16 }}>
            Change status for <strong>{statusChangeMed.name}</strong>
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {STATUS_OPTS.map((s) => (
              <button
                key={s}
                className={`btn ${statusChangeMed.status === s ? "btn-primary" : "btn-secondary"}`}
                style={{ justifyContent: "flex-start", textAlign: "left" }}
                onClick={() => handleStatusChange(statusChangeMed, s)}
              >
                <StatusBadge status={s} />
                {statusChangeMed.status === s && <span style={{ marginLeft: "auto", fontSize: 11 }}>Current</span>}
              </button>
            ))}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setStatusChangeMed(null)}>Cancel</button>
          </div>
        </Modal>
      )}
    </>
  );
}
