import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [dashboardRefreshToken, setDashboardRefreshToken] = useState(0);
  const [dashboardHistoryView, setDashboardHistoryView] = useState("sales");

  const navigateToPage = (nextPage) => {
    setPage(nextPage);
    if (nextPage === "dashboard") {
      setDashboardRefreshToken((v) => v + 1);
    }
  };

  // view: "sales" | "purchase"
  const navigateToDashboard = (view = "sales") => {
    setPage("dashboard");
    setDashboardRefreshToken((v) => v + 1);
    setDashboardHistoryView(view);
  };

  return (
    <div className="app-layout">
      <Sidebar page={page} setPage={navigateToPage} />
      <main className="main-content">
        {page === "dashboard" && (
          <Dashboard refreshToken={dashboardRefreshToken} initialHistoryView={dashboardHistoryView} />
        )}
        {page === "inventory" && <Inventory onNavigateDashboard={navigateToDashboard} />}
      </main>
    </div>
  );
}
