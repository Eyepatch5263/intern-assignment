import { useState, useEffect } from "react";
import { dashboardApi, purchaseOrderApi, salesApi } from "../api";
import Spinner from "../components/Spinner";
import Topbar from "../components/dashboard_components/Topbar";
import Stats from "../components/dashboard_components/Stats";
import TransactionsHistory from "../components/dashboard_components/TransactionsHistory";
import LowStock from "../components/dashboard_components/LowStock";
import PurchaseOrderSummary from "../components/dashboard_components/PurchaseOrderSummary";
import { fmt, fmtDate } from "../utils";


export default function Dashboard({ refreshToken = 0, initialHistoryView = "sales" }) {
  const [summary, setSummary] = useState(null);
  const [recentSales, setRecentSales] = useState([]);
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [historyView, setHistoryView] = useState(initialHistoryView);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination states
  const [salesPage, setSalesPage] = useState(1);
  const [purchasePage, setPurchasePage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Sync tab whenever a fresh navigation arrives (refreshToken bumps)
  useEffect(() => {
    setHistoryView(initialHistoryView);
  }, [refreshToken, initialHistoryView]);

  useEffect(() => {
    setError(null);
    setLoading(true);
    Promise.all([
      dashboardApi.getSummary(),
      salesApi.getRecent(100), // Fetch more to allow for pagination
      purchaseOrderApi.getRecent(100),
    ])
      .then(([sumData, salesData, purchaseData]) => {
        setSummary(sumData);
        setRecentSales(salesData);
        setRecentPurchases(purchaseData);
      })
      .catch(() => setError("Failed to load dashboard data. Make sure the backend is running."))
      .finally(() => setLoading(false));
  }, [refreshToken]);

  if (loading) return <><div className="top-bar"><div className="top-bar-left"><h1>Dashboard</h1><p>Sales overview & analytics</p></div></div><div className="page-content"><Spinner /></div></>;
  if (error) return <><div className="top-bar"><div className="top-bar-left"><h1>Dashboard</h1></div></div><div className="page-content"><div className="error-box">{error}</div></div></>;

  const s = summary.sales;
  const po = summary.purchase_orders;

  // Pagination logic
  const currentSales = recentSales.slice((salesPage - 1) * ITEMS_PER_PAGE, salesPage * ITEMS_PER_PAGE);
  const totalSalesPages = Math.ceil(recentSales.length / ITEMS_PER_PAGE);

  const currentPurchases = recentPurchases.slice((purchasePage - 1) * ITEMS_PER_PAGE, purchasePage * ITEMS_PER_PAGE);
  const totalPurchasePages = Math.ceil(recentPurchases.length / ITEMS_PER_PAGE);

  return (
    <>
      <Topbar />
      <div className="page-content">
        {/* Stats */}
        <Stats summary={summary} fmt={fmt} po={po} s={s} />

        <div className="two-col">
          {/* History */}
          <TransactionsHistory
            historyView={historyView}
            setHistoryView={setHistoryView}
            recentSales={recentSales}
            recentPurchases={recentPurchases}
            currentSales={currentSales}
            currentPurchases={currentPurchases}
            totalSalesPages={totalSalesPages}
            totalPurchasePages={totalPurchasePages}
            salesPage={salesPage}
            purchasePage={purchasePage}
            setSalesPage={setSalesPage}
            setPurchasePage={setPurchasePage}
            fmt={fmt}
            fmtDate={fmtDate}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Low stock */}
            <LowStock summary={summary} />

            {/* Purchase Order Summary */}
            <PurchaseOrderSummary po={po} fmt={fmt} />
          </div>
        </div>
      </div>
    </>
  );
}
