const Topbar = ({ openAdd }) => {
    return (
        <div className="top-bar">
            <div className="top-bar-left">
                <h1>Inventory</h1>
                <p>Manage medicines &amp; stock levels</p>
            </div>
            <div className="top-bar-right">
                <button className="btn btn-primary" onClick={openAdd}>
                    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Medicine
                </button>
            </div>
        </div>
    )
}

export default Topbar