import StatusBadge from '../StatusBadge'
import Spinner from '../Spinner'

const InventoryTable = ({ loading, medicines, openEdit, setStatusChangeMed, fmt }) => {
    return (
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
    )
}

export default InventoryTable