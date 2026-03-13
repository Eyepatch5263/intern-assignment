
const Topbar = () => {
    return (
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
    )
}

export default Topbar