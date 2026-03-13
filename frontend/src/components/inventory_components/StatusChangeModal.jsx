import Modal from '../Modal'
import StatusBadge from '../StatusBadge'
import { STATUS_OPTS } from '../../constant'

const StatusChangeModal = ({ statusChangeMed, setStatusChangeMed, handleStatusChange }) => {
    return (
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
    )
}

export default StatusChangeModal