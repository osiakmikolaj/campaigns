import { useEffect, useState } from "react";
import "./Dashboard.css";
import CampaignCard from "./CampaignCard";
import LoadingScreen from "./LoadingScreen";

const Dashboard = ({ onNavigateToEdit, onNavigateToCreate }) => {
    const [campaigns, setCampaigns] = useState([]);
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [campaignsRes, walletRes] = await Promise.all([fetch(`/campaigns`), fetch(`/wallet`)]);
                const campaignsData = await campaignsRes.json();
                const walletData = await walletRes.json();
                setCampaigns(campaignsData);
                setWallet(walletData);
            } catch (e) {
                console.error("Error!", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Delete the campaign?")) {
            try {
                const response = await fetch(`/campaigns/${id}`, {
                    method: "DELETE",
                });

                if (response.ok) {
                    setCampaigns(campaigns.filter((c) => c.id !== id));
                } else {
                    console.error("Error when deleting. Status:", response.status);
                    alert("Cannot delete selected campaign");
                }
            } catch (e) {
                console.error("Error!:", e);
            }
        }
    };

    const handleEdit = (id) => {
        onNavigateToEdit(id);
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Campaigns</h1>
                <div className="wallet-card">
                    <span className="wallet-label">Funds</span>
                    <span className="wallet-balance">{wallet?.balance.toFixed(2)}</span>
                </div>
            </header>

            <div className="action-bar">
                <button className="btn-primary" onClick={onNavigateToCreate}>
                    Add Campaign
                </button>
            </div>

            <div className="campaign-grid">
                {campaigns.length === 0 ? (
                    <p>No campaigns to list</p>
                ) : (
                    campaigns.map((campaign) => <CampaignCard key={campaign.id} campaign={campaign} onDelete={handleDelete} onEdit={handleEdit} />)
                )}
            </div>
        </div>
    );
};

export default Dashboard;
