import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CampaignCard from "./CampaignCard";
import LoadingScreen from "./LoadingScreen";

const API_URL = process.env.REACT_APP_SUPABASE_URL;
const API_KEY = process.env.REACT_APP_SUPABASE_KEY;

interface Campaign {
    id: number;
    name: string;
    status: "on" | "off";
    town: string;
    radius: number;
    keywords: { id: number; name: string }[];
    bidAmount: number;
    minAmount: number;
    campaignFund: number;
    productId: string;
    productName?: string;
}

interface Product {
    id: number;
    name: string;
}

interface Wallet {
    id: number;
    balance: number;
}

interface AlertInfo {
    type: "success" | "danger";
    message: string;
}

interface DashboardProps {}

const getHeaders = (): Record<string, string> => ({
    apikey: API_KEY || "",
    Authorization: `Bearer ${API_KEY || ""}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
});

const Dashboard: React.FC<DashboardProps> = () => {
    const navigate = useNavigate();

    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [alertInfo, setAlertInfo] = useState<AlertInfo | null>(null);

    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            try {
                const [campaignsRes, productsRes, walletRes] = await Promise.all([
                    fetch(`${API_URL}/rest/v1/campaigns?select=*`, { headers: getHeaders() }),
                    fetch(`${API_URL}/rest/v1/products?select=*`, { headers: getHeaders() }),
                    fetch(`${API_URL}/rest/v1/wallet?select=*`, { headers: getHeaders() }),
                ]);

                if (!campaignsRes.ok || !productsRes.ok || !walletRes.ok) {
                    throw new Error("Error while fetching the data from API");
                }

                const campaignsData: Campaign[] = await campaignsRes.json();
                const productsData: Product[] = await productsRes.json();
                const walletData: Wallet[] = await walletRes.json();

                const productsMap = new Map(productsData.map((p) => [p.id.toString(), p.name]));

                const mappedCampaigns = campaignsData.map((campaign) => ({
                    ...campaign,
                    productName: productsMap.get(campaign.productId) || undefined,
                }));

                setCampaigns(mappedCampaigns);
                setWallet(walletData.length > 0 ? walletData[0] : { id: 0, balance: 0 });
            } catch (e) {
                console.error("Error!", e);
                setAlertInfo({ type: "danger", message: "Failed to load data from server." });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleDeleteClick = (id: number): void => {
        setDeleteId(id);
    };

    const confirmDelete = async (): Promise<void> => {
        if (!deleteId) return;
        try {
            const response = await fetch(`${API_URL}/rest/v1/campaigns?id=eq.${deleteId}`, {
                method: "DELETE",
                headers: getHeaders(),
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

    const handleEdit = (id: number): void => {
        navigate(`/edit/${id}`);
    };

    const handleNavigateToCreate = (): void => {
        navigate("/create");
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
                <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
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
                        <span className="h4 fw-bold text-primary mb-0">$ {wallet?.balance?.toFixed(2) || "0.00"}</span>
                    </div>
                </div>
            </header>

            <div className="d-flex flex-row justify-content-end mb-4">
                <button className="btn btn-primary btn-md" onClick={handleNavigateToCreate}>
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
