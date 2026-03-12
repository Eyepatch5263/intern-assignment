const statusMap = {
  "Active": "badge-active",
  "Low Stock": "badge-low",
  "Expired": "badge-expired",
  "Out of Stock": "badge-out",
  "Pending": "badge-pending",
  "Approved": "badge-approved",
  "Delivered": "badge-delivered",
  "Cancelled": "badge-cancelled",
};

const dotColor = {
  "Active": "#10b981",
  "Low Stock": "#f59e0b",
  "Expired": "#ef4444",
  "Out of Stock": "#9ca3af",
  "Pending": "#f59e0b",
  "Approved": "#3b82f6",
  "Delivered": "#10b981",
  "Cancelled": "#9ca3af",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`badge ${statusMap[status] || "badge-out"}`}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: dotColor[status] || "#9ca3af", display: "inline-block" }} />
      {status}
    </span>
  );
}
