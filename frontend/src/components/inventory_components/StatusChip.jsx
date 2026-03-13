
const StatusChip = ({ statusFilter, setStatusFilter }) => {
    return (
        <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--gray-100)" }}>
            <div className="filter-bar">
                {["", "Active", "Low Stock", "Out of Stock", "Expired"].map((s) => (
                    <button key={s} className={`chip ${statusFilter === s ? "active" : ""}`} onClick={() => setStatusFilter(s)}>
                        {s || "All Status"}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default StatusChip