import StatusBadge from "../StatusBadge";

const LowStock = ({ summary }) => {
    return (
        <div className="section">
            <div className="section-header">
                <div>
                    <div className="section-title">Low Stock Alert</div>
                    <div className="section-sub">{summary.low_stock_items.length} items need attention</div>
                </div>
            </div>
            <div className="section-body">
                {summary.low_stock_items.length === 0 ? (
                    <div className="empty-state" style={{ padding: "24px 0" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p>All items well stocked</p>
                    </div>
                ) : (
                    <div className="stock-list">
                        {summary.low_stock_items.slice(0, 6).map((item) => {
                            const pct = Math.min(100, Math.round((item.stock / (item.low_stock_threshold * 2)) * 100));
                            const barColor = item.status === "Expired" ? "var(--danger)" : item.stock === 0 ? "var(--gray-400)" : "var(--warning)";
                            return (
                                <div className="stock-item" key={item.id}>
                                    <div>
                                        <div className="stock-item-name">{item.name}</div>
                                        <div className="stock-bar-wrap">
                                            <div className="stock-bar" style={{ width: `${pct}%`, background: barColor }} />
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <StatusBadge status={item.status} />
                                        <div style={{ fontSize: 11, color: "var(--gray-500)", marginTop: 4 }}>
                                            {item.stock} / {item.low_stock_threshold} units
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default LowStock