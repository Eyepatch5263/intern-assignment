import StatusBadge from '../StatusBadge'

const TransactionsHistory = ({ historyView, setHistoryView, recentSales, recentPurchases, currentSales, currentPurchases, totalSalesPages, totalPurchasePages, salesPage, purchasePage, fmt, fmtDate}) => {
    return (
        <div className="section">
            <div className="section-header">
                <div>
                    <div className="section-title">History</div>
                    <div className="section-sub">
                        {historyView === "sales" ? "Latest sales transactions" : "Latest purchase orders"}
                    </div>
                </div>
                <div className="filter-bar" style={{ margin: 0 }}>
                    <button
                        type="button"
                        className={`chip ${historyView === "sales" ? "active" : ""}`}
                        onClick={() => setHistoryView("sales")}
                    >
                        Sales
                    </button>
                    <button
                        type="button"
                        className={`chip ${historyView === "purchase" ? "active" : ""}`}
                        onClick={() => setHistoryView("purchase")}
                    >
                        Purchase
                    </button>
                </div>
            </div>
            <div className="table-wrap">
                <table>
                    <thead>
                        {historyView === "sales" ? (
                            <tr>
                                <th>ID</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Amount</th>
                                <th>Time</th>
                            </tr>
                        ) : (
                            <tr>
                                <th>ID</th>
                                <th>Medicine</th>
                                <th>Qty</th>
                                <th>Cost</th>
                                <th>Status</th>
                                <th>Time</th>
                            </tr>
                        )}
                    </thead>
                    <tbody>
                        {historyView === "sales" ? (
                            recentSales.length === 0 ? (
                                <tr><td colSpan={5} className="text-center" style={{ color: "var(--gray-400)", padding: "32px" }}>No sales yet</td></tr>
                            ) : currentSales.map((sale) => (
                                <tr key={`sale-${sale.id}`}>
                                    <td><span style={{ fontFamily: "monospace", fontSize: 12 }}>#{String(sale.id).padStart(4, "0")}</span></td>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                                                {(sale.customer_name || "W")[0]}
                                            </div>
                                            <span className="td-bold" style={{ fontSize: 13 }}>{sale.customer_name || "Walk-in"}</span>
                                        </div>
                                    </td>
                                    <td>{sale.items.length} item{sale.items.length !== 1 ? "s" : ""}</td>
                                    <td><span style={{ fontWeight: 700, color: "var(--primary)" }}>{fmt(sale.total_amount)}</span></td>
                                    <td><span className="td-muted">{fmtDate(sale.created_at)}</span></td>
                                </tr>
                            ))
                        ) : (
                            recentPurchases.length === 0 ? (
                                <tr><td colSpan={6} className="text-center" style={{ color: "var(--gray-400)", padding: "32px" }}>No purchase orders yet</td></tr>
                            ) : currentPurchases.map((order) => (
                                <tr key={`po-${order.id}`}>
                                    <td><span style={{ fontFamily: "monospace", fontSize: 12 }}>#{String(order.id).padStart(4, "0")}</span></td>
                                    <td>
                                        <span className="td-bold" style={{ fontSize: 13 }}>{order.medicine_name || `Medicine #${order.medicine_id}`}</span>
                                    </td>
                                    <td>{order.quantity}</td>
                                    <td><span style={{ fontWeight: 700, color: "var(--primary)" }}>{fmt(order.total_cost)}</span></td>
                                    <td><StatusBadge status={order.status} /></td>
                                    <td><span className="td-muted">{fmtDate(order.created_at)}</span></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="pagination-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderTop: "1px solid var(--gray-100)" }}>
                <button
                    className="btn-outline btn-sm"
                    disabled={historyView === "sales" ? salesPage === 1 : purchasePage === 1}
                    onClick={() => historyView === "sales" ? setSalesPage(p => p - 1) : setPurchasePage(p => p - 1)}
                >
                    Previous
                </button>
                <span style={{ fontSize: 13, color: "var(--gray-500)" }}>
                    Page {historyView === "sales" ? salesPage : purchasePage} of {historyView === "sales" ? totalSalesPages : totalPurchasePages}
                </span>
                <button
                    className="btn-outline btn-sm"
                    disabled={historyView === "sales" ? salesPage === totalSalesPages : purchasePage === totalPurchasePages}
                    onClick={() => historyView === "sales" ? setSalesPage(p => p + 1) : setPurchasePage(p => p + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    )
}

export default TransactionsHistory