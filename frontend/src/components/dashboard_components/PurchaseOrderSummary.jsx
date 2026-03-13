const PurchaseOrderSummary = ({ po, fmt }) => {
    return (
        <div className="section">
            <div className="section-header">
                <div className="section-title">Purchase Orders</div>
            </div>
            <div className="overview-row" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                <div className="stat-mini">
                    <div className="stat-mini-label">Pending</div>
                    <div className="stat-mini-val" style={{ color: "var(--warning)" }}>{po.pending_count}</div>
                </div>
                <div className="stat-mini">
                    <div className="stat-mini-label">Approved</div>
                    <div className="stat-mini-val" style={{ color: "var(--info)" }}>{po.approved_count}</div>
                </div>
                <div className="stat-mini">
                    <div className="stat-mini-label">Delivered</div>
                    <div className="stat-mini-val" style={{ color: "var(--success)" }}>{po.delivered_count}</div>
                </div>
            </div>
            <div style={{ padding: "12px 20px", background: "var(--gray-50)", borderTop: "1px solid var(--gray-100)", borderRadius: "0 0 var(--radius) var(--radius)" }}>
                <div style={{ fontSize: 12, color: "var(--gray-500)" }}>Total pending value</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--gray-900)" }}>{fmt(po.total_pending_cost)}</div>
            </div>
        </div>
    )
}

export default PurchaseOrderSummary