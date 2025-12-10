import "./Dashboard.css";

// const API_URL = "https://localhost:3001";

const Dashboard = () => {
    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Campaigns</h1>
                <div className="wallet-card">
                    <span className="wallet-label">Funds</span>
                    <span className="wallet-balance">000.0</span>
                </div>
            </header>

            <div className="action-bar">
                <button className="btn-primary">Add Campaign</button>
            </div>

            <div className="campaign-grid">
                <p>No Campaigns to list</p>
            </div>
        </div>
    );
};

export default Dashboard;
