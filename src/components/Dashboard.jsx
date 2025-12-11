import { useEffect, useState } from "react";
import CampaignCard from "./CampaignCard";
import LoadingScreen from "./LoadingScreen";

const Dashboard = ({ onNavigateToEdit, onNavigateToCreate }) => {
    const [campaigns, setCampaigns] = useState([]);
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);

    const [deleteId, setDeleteId] = useState(null);
    const [alertInfo, setAlertInfo] = useState(null);

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

    const handleDeleteClick = (id) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            const response = await fetch(`/campaigns/${deleteId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setCampaigns(campaigns.filter((c) => c.id !== deleteId));
                setAlertInfo({ type: "success", message: "Campaign deleted successfully!" });
            } else {
                console.error("Error when deleting. Status:", response.status);
                setAlertInfo({ type: "danger", message: "Cannot delete selected campaign" });
            }
        } catch (e) {
            console.error("Error!:", e);
            setAlertInfo({ type: "danger", message: "An error occurred" });
        } finally {
            setDeleteId(null);
            setTimeout(() => setAlertInfo(null), 3000);
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
            {alertInfo && (
                <div className={`alert alert-${alertInfo.type} alert-dismissible fade show`} role="alert">
                    {alertInfo.message}
                    <button type="button" className="btn-close" onClick={() => setAlertInfo(null)}></button>
                </div>
            )}

            {deleteId && (
                <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Delete</h5>
                                <button type="button" className="btn-close" onClick={() => setDeleteId(null)}></button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete this campaign?</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setDeleteId(null)}>
                                    Cancel
                                </button>
                                <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <header className="d-flex flex-column flex-sm-row justify-content-center justify-content-sm-between align-items-center mb-4 gap-3">
                <h3 className="display-6 fw-bold">Campaigns</h3>
                <div className="card border-1 shadow-sm ms-auto">
                    <div className="card-body py-2 px-3 d-flex flex-column align-items-end">
                        <span className="text-muted small text-uppercase fw-bold">Emerald Account Funds</span>
                        <span className="h4 fw-bold text-primary mb-0">
                            {wallet?.currency} {wallet?.balance.toFixed(2)}
                        </span>
                    </div>
                </div>
            </header>

            <div className="d-flex flex-row justify-content-end mb-4">
                <button className="btn btn-primary btn-md" onClick={onNavigateToCreate}>
                    Add Campaign
                </button>
            </div>

            <div className="row g-3">
                {campaigns.length === 0 ? (
                    <div className="col-12">
                        <p>No campaigns to list</p>
                    </div>
                ) : (
                    campaigns.map((campaign) => (
                        <div key={campaign.id} className="col-12 col-md-6 col-lg-4">
                            <CampaignCard campaign={campaign} onDelete={handleDeleteClick} onEdit={handleEdit} />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Dashboard;
