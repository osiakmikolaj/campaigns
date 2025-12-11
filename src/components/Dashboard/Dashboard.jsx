import { useEffect, useState } from "react";
import CampaignCard from "../CampaignCard/CampaignCard";
import LoadingScreen from "../LoadingScreen/LoadingScreen";

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
        <div className="container py-4">
            <header className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <h1 className="display-5 fw-bold">Campaigns</h1>
                <div className="card border-0 shadow-sm border-end border-5 border-primary">
                    <div className="card-body py-2 px-4 d-flex flex-column align-items-end">
                        <span className="text-muted small text-uppercase fw-bold">Emerald Account Funds</span>
                        <span className="h3 fw-bold text-primary mb-0">{wallet?.balance.toFixed(2)}</span>
                    </div>
                </div>
            </header>

            <div className="d-flex justify-content-end mb-4">
                <button className="btn btn-primary btn-lg" onClick={onNavigateToCreate}>
                    <i className="bi bi-plus-lg me-2"></i>Add Campaign
                </button>
            </div>

            <div className="row g-4">
                {campaigns.length === 0 ? (
                    <div className="col-12">
                        <p>No campaigns to list</p>
                    </div>
                ) : (
                    campaigns.map((campaign) => (
                        <div key={campaign.id} className="col-12 col-md-6 col-lg-4">
                            <CampaignCard campaign={campaign} onDelete={handleDelete} onEdit={handleEdit} />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Dashboard;
