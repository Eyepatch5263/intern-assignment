
const CreateSaleForm = ({ saleError, saleCustomer, setSaleCustomer, saleItems, updateSaleLine, saleMedicines, selectedMedicineIds, addSaleLine, removeSaleLine, handleCreateSale, setShowSale, saleSaving }) => {
    return (
        <form onSubmit={handleCreateSale}>
            {saleError && <div className="error-box">{saleError}</div>}
            <div className="form-group">
                <label className="form-label">Customer Name</label>
                <input
                    className="input"
                    value={saleCustomer}
                    onChange={(e) => setSaleCustomer(e.target.value)}
                    placeholder="Walk-in Customer"
                />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {saleItems.map((line, idx) => (
                    <div key={idx} className="form-row" style={{ gridTemplateColumns: "1fr 120px auto", marginBottom: 0 }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Medicine</label>
                            <select
                                className="select"
                                value={line.medicine_id}
                                onChange={(e) => updateSaleLine(idx, "medicine_id", e.target.value)}
                                required
                            >
                                <option value="">Select medicine</option>
                                {saleMedicines
                                    .filter((m) => !selectedMedicineIds.has(m.id) || String(m.id) === line.medicine_id)
                                    .map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.name} (Stock: {m.stock})
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Qty</label>
                            <input
                                className="input"
                                type="number"
                                min="1"
                                value={line.quantity}
                                onChange={(e) => updateSaleLine(idx, "quantity", e.target.value)}
                                required
                            />
                        </div>

                        <div style={{ display: "flex", alignItems: "flex-end" }}>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => removeSaleLine(idx)}
                                disabled={saleItems.length === 1}
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={addSaleLine}>
                    Add Item
                </button>
            </div>

            <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowSale(false)}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saleSaving}>
                    {saleSaving ? "Creating..." : "Create Sale"}
                </button>
            </div>
        </form>
    )
}

export default CreateSaleForm