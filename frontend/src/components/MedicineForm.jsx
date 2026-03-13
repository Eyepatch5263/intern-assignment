export default function MedicineForm({ form, setForm, onSubmit, onClose, saving, formError }) {
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
          <label className="form-label">Price (INR) *</label>
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