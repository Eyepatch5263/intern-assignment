const Stats = ({ medicines, counts, totalValue, fmt }) => {
    return (
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
                    <div className="stat-mini-label">Total Value</div>
                    <div className="stat-mini-val" style={{ fontSize: 18 }}>{fmt(totalValue)}</div>
                </div>
            </div>
        </div>
    )
}

export default Stats