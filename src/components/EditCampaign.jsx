import { useEffect, useState } from "react";
import { Typeahead } from "react-bootstrap-typeahead";
import LoadingScreen from "./LoadingScreen";

const API_URL = process.env.REACT_APP_SUPABASE_URL;
const API_KEY = process.env.REACT_APP_SUPABASE_KEY;

const getHeaders = () => ({
    apikey: API_KEY,
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
});

const EditCampaign = ({ id, onCancel, onSuccess }) => {
    const [formData, setFormData] = useState({
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

    const [towns, setTowns] = useState([]);
    const [products, setProducts] = useState([]);
    const [availableKeywords, setAvailableKeywords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alertInfo, setAlertInfo] = useState(null);
    const [originalFund, setOriginalFund] = useState(0);

    useEffect(() => {
        Promise.all([
            fetch(`${API_URL}/rest/v1/towns?select=*`, { headers: getHeaders() }).then((r) => r.json()),
            fetch(`${API_URL}/rest/v1/products?select=*`, { headers: getHeaders() }).then((r) => r.json()),
            fetch(`${API_URL}/rest/v1/campaigns?id=eq.${id}&select=*`, { headers: getHeaders() }).then((r) => r.json()),
            fetch(`${API_URL}/rest/v1/keywords?select=*`, { headers: getHeaders() }).then((r) => r.json()),
        ])
            .then(([townsData, productsData, campaignDataRes, keywordsData]) => {
                setTowns(townsData);
                setProducts(productsData);
                setAvailableKeywords(keywordsData);

                const campaignData = campaignDataRes[0];
                setFormData({
                    ...campaignData,
                    keywords: campaignData.keywords || [],
                });
                setOriginalFund(parseFloat(campaignData.campaignFund));
                setLoading(false);
            })
            .catch((e) => {
                console.error("Failed to fetch data", e);
                setLoading(false);
            });
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAlertInfo(null);

        if (formData.keywords.length === 0) {
            setAlertInfo({ type: "danger", message: "Keywords are mandatory! Please select at least one." });
            return;
        }

        const bid = parseFloat(formData.bidAmount);
        const min = parseFloat(formData.minAmount);

        if (min > bid) {
            setAlertInfo({ type: "danger", message: "Min Amount cannot be greater than Bid Amount!" });
            return;
        }

        try {
            const newFund = parseFloat(formData.campaignFund);
            const diff = newFund - originalFund;

            if (diff !== 0) {
                const walletRes = await fetch(`${API_URL}/rest/v1/wallet?select=*`, { headers: getHeaders() });
                const walletData = await walletRes.json();
                const wallet = walletData[0];

                if (diff > 0 && wallet.balance < diff) {
                    setAlertInfo({ type: "danger", message: `Not enough funds! (Required: ${diff}, Available: ${wallet.balance})` });
                    return;
                }

                await fetch(`${API_URL}/rest/v1/wallet?id=eq.${wallet.id}`, {
                    method: "PATCH",
                    headers: getHeaders(),
                    body: JSON.stringify({ balance: wallet.balance - diff }),
                });
            }

            const updatedCampaign = {
                ...formData,
                bidAmount: parseFloat(formData.bidAmount),
                minAmount: parseFloat(formData.minAmount),
                campaignFund: newFund,
                radius: parseInt(formData.radius),
                productId: String(formData.productId),
                keywords: formData.keywords,
            };

            await fetch(`${API_URL}/rest/v1/campaigns?id=eq.${id}`, {
                method: "PATCH",
                headers: getHeaders(),
                body: JSON.stringify(updatedCampaign),
            });
            setAlertInfo({ type: "success", message: "The changes are saved!" });
            setTimeout(() => onSuccess(), 2000);
        } catch (e) {
            console.error("Edit error.", e);
            setAlertInfo({ type: "danger", message: "An error occurred." });
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="container">
            <h3 className="mt-3">Edit Campaign (ID: {id})</h3>
            {alertInfo && (
                <div className={`alert alert-${alertInfo.type} alert-dismissible fade show`} role="alert">
                    {alertInfo.message}
                    <button type="button" className="btn-close" onClick={() => setAlertInfo(null)}></button>
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label" htmlFor="campaign-name">
                        Campaign Name:
                    </label>
                    <input className="form-control" id="campaign-name" type="text" name="name" value={formData.name} required onChange={handleChange} />
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
                        selected={formData.keywords}
                        placeholder="Select keywords..."
                        onChange={(selected) => {
                            setFormData({ ...formData, keywords: selected });
                        }}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label" htmlFor="product-select">
                        Product
                    </label>
                    <select className="form-control" id="product-select" name="productId" value={formData.productId} onChange={handleChange} required>
                        <option value="">Select Product</option>
                        {products.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label" htmlFor="city-select">
                        City
                    </label>
                    <select className="form-control" id="city-select" name="town" value={formData.town} required onChange={handleChange}>
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
                    <input className="form-control" id="radius-input" type="number" name="radius" value={formData.radius} required onChange={handleChange} />
                </div>

                <div className="mb-3">
                    <label className="form-label" htmlFor="bid-amount">
                        Bid Amount
                    </label>
                    <input
                        className="form-control"
                        id="bid-amount"
                        type="number"
                        min="1"
                        step="0.01"
                        name="bidAmount"
                        value={formData.bidAmount}
                        required
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label" htmlFor="min-amount">
                        Minimum Bid Amount:
                    </label>
                    <input
                        className="form-control"
                        id="min-amount"
                        type="number"
                        step="0.01"
                        name="minAmount"
                        value={formData.minAmount}
                        required
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label" htmlFor="campaign-funds">
                        Funds ($):
                    </label>
                    <input
                        className="form-control"
                        id="campaign-funds"
                        type="number"
                        step="0.01"
                        name="campaignFund"
                        value={formData.campaignFund}
                        required
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label" htmlFor="status-select">
                        Status
                    </label>
                    <select className="form-control" id="status-select" name="status" value={formData.status} onChange={handleChange}>
                        <option value="on">Active</option>
                        <option value="off">Inactive</option>
                    </select>
                </div>

                <div className="d-grid gap-2 d-md-flex justify-content-md-start mb-3">
                    <button type="button" onClick={onCancel} className="btn btn-secondary">
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                        Save changes
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditCampaign;
