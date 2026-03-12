import { useState, useEffect } from "react";
import { dashboardApi, salesApi } from "../api";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import Spinner from "../components/Spinner";

function fmt(n) {
  return "$" + Number(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function fmtDate(d) {
  return new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([dashboardApi.getSummary(), salesApi.getRecent(8)])
      .then(([sumData, salesData]) => {
        setSummary(sumData);
        setRecentSales(salesData);
      })
      .catch(() => setError("Failed to load dashboard data. Make sure the backend is running."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <><div className="top-bar"><div className="top-bar-left"><h1>Dashboard</h1><p>Sales overview & analytics</p></div></div><div className="page-content"><Spinner /></div></>;
  if (error) return <><div className="top-bar"><div className="top-bar-left"><h1>Dashboard</h1></div></div><div className="page-content"><div className="error-box">{error}</div></div></>;

  const s = summary.sales;
  const po = summary.purchase_orders;

  return (
    <>
      <div className="top-bar">
        <div className="top-bar-left">
          <h1>Dashboard</h1>
          <p>Sales overview &amp; inventory analytics</p>
        </div>
        <div className="top-bar-right">
          <span style={{ fontSize: 12, color: "var(--gray-500)" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </span>
        </div>
      </div>

      <div className="page-content">
        {/* Stat cards */}
        <div className="cards-grid">
          <StatCard
            label="Today's Revenue"
            value={fmt(s.today_revenue)}
            sub={`${s.today_sales_count} transactions today`}
            colorClass="card-purple"
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatCard
            label="Items Sold Today"
            value={s.total_items_sold_today}
            sub={`${s.monthly_sales_count} sales this month`}
            colorClass="card-green"
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
          />
          <StatCard
            label="Low Stock Items"
            value={summary.low_stock_items.length}
            sub={`${summary.out_of_stock_count} out of stock`}
            colorClass="card-amber"
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
          />
          <StatCard
            label="Pending Orders"
            value={po.pending_count}
            sub={`${fmt(po.total_pending_cost)} pending value`}
            colorClass="card-blue"
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
          />
          <StatCard
            label="Monthly Revenue"
            value={fmt(s.monthly_revenue)}
            sub={`${s.monthly_sales_count} sales this month`}
            colorClass="card-green"
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
          />
          <StatCard
            label="Total Medicines"
            value={summary.total_medicines}
            sub={`${summary.out_of_stock_count} out of stock`}
            colorClass="card-purple"
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}
          />
        </div>

        <div className="two-col">
          {/* Recent Sales */}
          <div className="section">
            <div className="section-header">
              <div>
                <div className="section-title">Recent Sales</div>
                <div className="section-sub">Latest transactions</div>
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.length === 0 ? (
                    <tr><td colSpan={5} className="text-center" style={{ color: "var(--gray-400)", padding: "32px" }}>No sales yet</td></tr>
                  ) : recentSales.map((sale) => (
                    <tr key={sale.id}>
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Low stock */}
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

            {/* Purchase Order Summary */}
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
          </div>
        </div>
      </div>
    </>
  );
}
