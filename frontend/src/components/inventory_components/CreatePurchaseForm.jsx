const CreatePurchaseForm = ({ purchaseForm, setPurchaseForm, purchaseMedicines, purchaseError, handleCreatePurchase, setShowPurchase, purchaseSaving }) => {
    return (
        <form onSubmit={handleCreatePurchase}>
            {purchaseError && <div className="error-box">{purchaseError}</div>}

            <div className="form-group">
                <label className="form-label">Medicine *</label>
                <select
                    className="select"
                    value={purchaseForm.medicine_id}
                    onChange={(e) => setPurchaseForm((f) => ({ ...f, medicine_id: e.target.value }))}
                    required
                >
                    <option value="">Select medicine</option>
                    {purchaseMedicines.map((m) => (
                        <option key={m.id} value={m.id}>
                            {m.name} (Current Stock: {m.stock})
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Quantity *</label>
                    <input
                        className="input"
                        type="number"
                        min="1"
                        value={purchaseForm.quantity}
                        onChange={(e) => setPurchaseForm((f) => ({ ...f, quantity: e.target.value }))}
                        required
                    />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Unit Cost (INR) *</label>
                    <input
                        className="input"
                        type="number"
                        min="0"
                        step="0.01"
                        value={purchaseForm.unit_cost}
                        onChange={(e) => setPurchaseForm((f) => ({ ...f, unit_cost: e.target.value }))}
                        required
                    />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Supplier</label>
                <input
                    className="input"
                    value={purchaseForm.supplier}
                    onChange={(e) => setPurchaseForm((f) => ({ ...f, supplier: e.target.value }))}
                    placeholder="Optional supplier name"
                />
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <input
                    type="checkbox"
                    checked={purchaseForm.mark_delivered}
                    onChange={(e) => setPurchaseForm((f) => ({ ...f, mark_delivered: e.target.checked }))}
                />
                Mark as delivered now (adds stock immediately)
            </label>

            <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPurchase(false)}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={purchaseSaving}>
                    {purchaseSaving ? "Creating..." : "Create Purchase"}
                </button>
            </div>
        </form>
    )
}

export default CreatePurchaseForm