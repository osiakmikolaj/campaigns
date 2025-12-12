import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { Typeahead } from "react-bootstrap-typeahead";
import LoadingScreen from "./LoadingScreen";

const API_URL = process.env.REACT_APP_SUPABASE_URL;
const API_KEY = process.env.REACT_APP_SUPABASE_KEY;

interface Town {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
}

interface Keyword {
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

interface CreateCampaignProps {
    onCancel: () => void;
    onSuccess: () => void;
}

interface FormData {
    name: string;
    keywords: Keyword[];
    bidAmount: number | string;
    minAmount: number | string;
    campaignFund: number | string;
    status: "on" | "off";
    town: string;
    radius: number | string;
    productId: string;
}

const getHeaders = (): Record<string, string> => ({
    apikey: API_KEY || "",
    Authorization: `Bearer ${API_KEY || ""}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
});

const CreateCampaign: React.FC<CreateCampaignProps> = ({ onCancel, onSuccess }) => {
    const [formData, setFormData] = useState<FormData>({
        name: "",
        keywords: [],
        bidAmount: 0,
        minAmount: 0,
        campaignFund: 0,
        status: "off",
        town: "",
        radius: 0,
        productId: "",
    });

    const [towns, setTowns] = useState<Town[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [availableKeywords, setaAvailableKeywords] = useState<Keyword[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [alertInfo, setAlertInfo] = useState<AlertInfo | null>(null);

    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            try {
                const [townsRes, productsRes, keywordsRes]: [Response, Response, Response] = await Promise.all([
                    fetch(`${API_URL}/rest/v1/towns?select=*`, { headers: getHeaders() }),
                    fetch(`${API_URL}/rest/v1/products?select=*`, { headers: getHeaders() }),
                    fetch(`${API_URL}/rest/v1/keywords?select=*`, { headers: getHeaders() }),
                ]);

                const townsData: Town[] = await townsRes.json();
                const productsData: Product[] = await productsRes.json();
                const keywordsData: Keyword[] = await keywordsRes.json();

                setTowns(townsData);
                setProducts(productsData);
                setaAvailableKeywords(keywordsData);
                setLoading(false);
            } catch (e) {
                console.error("Failed to fetch data", e);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setAlertInfo(null);

        if (formData.keywords.length === 0) {
            setAlertInfo({ type: "danger", message: "Keywords are mandatory! Please select at least one." });
            return;
        }

        const cost = parseFloat(formData.campaignFund.toString());
        const bid = parseFloat(formData.bidAmount.toString());
        const min = parseFloat(formData.minAmount.toString());

        if (min > bid) {
            setAlertInfo({ type: "danger", message: "Min Amount cannot be greater than Bid Amount!" });
            return;
        }

        if (cost <= 0) {
            setAlertInfo({ type: "danger", message: "Not enough funds!" });
            return;
        }

        try {
            const walletRes = await fetch(`${API_URL}/rest/v1/wallet?select=*`, {
                headers: getHeaders(),
            });
            const walletData: Wallet[] = await walletRes.json();

            if (!walletData || walletData.length === 0) {
                throw new Error("Wallet not found");
            }

            const wallet = walletData[0];

            if (wallet.balance < cost) {
                setAlertInfo({ type: "danger", message: `Not enough funds! (Cost: ${cost}, Available funds: ${wallet.balance})` });
                return;
            }

            await fetch(`${API_URL}/rest/v1/wallet?id=eq.${wallet.id}`, {
                method: "PATCH",
                headers: getHeaders(),
                body: JSON.stringify({ balance: wallet.balance - cost }),
            });

            const newCampaign = {
                id: Date.now().toString(),
                name: formData.name,
                keywords: formData.keywords,
                bidAmount: parseFloat(formData.bidAmount.toString()),
                minAmount: parseFloat(formData.minAmount.toString()),
                campaignFund: parseFloat(formData.campaignFund.toString()),
                status: formData.status,
                town: formData.town,
                radius: parseInt(formData.radius.toString()),
                productId: String(formData.productId),
            };

            await fetch(`${API_URL}/rest/v1/campaigns`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify(newCampaign),
            });

            setAlertInfo({ type: "success", message: "Campaign is created!" });
            setTimeout(() => onSuccess(), 2000);
        } catch (e) {
            console.log(e);
            setAlertInfo({ type: "danger", message: "An error occurred while communicating with the database." });
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="container">
            <h3 className="mt-3">New Campaign</h3>
            {alertInfo && (
                <div className={`alert alert-${alertInfo.type} alert-dismissible fade show`} role="alert">
                    {alertInfo.message}
                    <button type="button" className="btn-close" onClick={() => setAlertInfo(null)}></button>
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="product-select" className="form-label">
                        Product
                    </label>
                    <select id="product-select" className="form-control" name="productId" required onChange={handleChange}>
                        <option value="">Choose Product</option>
                        {products.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label" htmlFor="campaign-name">
                        Campaign Name
                    </label>
                    <input className="form-control" id="campaign-name" type="text" name="name" required onChange={handleChange} />
                </div>

                <div className="mb-3">
                    <label className="form-label" htmlFor="keywords-typeahead">
                        Keywords
                    </label>
                    <Typeahead
                        id="keywords-typeahead"
                        multiple
                        labelKey="name"
                        options={availableKeywords}
                        placeholder="Select required keywords..."
                        onChange={(selected: unknown[]) => {
                            setFormData({ ...formData, keywords: selected as Keyword[] });
                        }}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label" htmlFor="city-select">
                        City
                    </label>
                    <select id="city-select" className="form-control" name="town" required onChange={handleChange}>
                        <option value="">Choose City</option>
                        {towns.map((t) => (
                            <option key={t.id} value={t.name}>
                                {t.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label" htmlFor="radius-input">
                        Radius (km)
                    </label>
                    <input id="radius-input" className="form-control" type="number" name="radius" required onChange={handleChange} />
                </div>

                <div className="mb-3">
                    <label className="form-label" htmlFor="bid-amount">
                        Bid Amount
                    </label>
                    <input id="bid-amount" className="form-control" type="number" min="0" step="0.01" name="bidAmount" required onChange={handleChange} />
                </div>

                <div className="mb-3">
                    <label className="form-label" htmlFor="min-amount">
                        Minimum Bid Amount
                    </label>
                    <input id="min-amount" className="form-control" type="number" step="0.01" name="minAmount" required onChange={handleChange} />
                </div>

                <div className="mb-3">
                    <label className="form-label" htmlFor="campaign-funds">
                        Campaign Funds (taken from the wallet)
                    </label>
                    <input id="campaign-funds" className="form-control" type="number" step="0.01" name="campaignFund" required onChange={handleChange} />
                </div>

                <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select className="form-control" name="status" onChange={handleChange}>
                        <option value="off">Inactive (OFF)</option>
                        <option value="on">Active (ON)</option>
                    </select>
                </div>

                <div className="d-grid gap-2 d-md-flex justify-content-md-start mb-3">
                    <button type="button" onClick={onCancel} className="btn btn-secondary">
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                        Create and pay
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateCampaign;
