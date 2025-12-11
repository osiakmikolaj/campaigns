import { useEffect, useState } from "react";
import { Typeahead } from "react-bootstrap-typeahead";
import LoadingScreen from "./LoadingScreen";

const CreateCampaign = ({ onCancel, onSuccess }) => {
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
    const [availableKeywords, setaAvailableKeywords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alertInfo, setAlertInfo] = useState(null);

    useEffect(() => {
        Promise.all([fetch(`/towns`).then((r) => r.json()), fetch(`/products`).then((r) => r.json()), fetch(`/keywords`).then((r) => r.json())])
            .then(([townsData, productsData, keywordsData]) => {
                setTowns(townsData);
                setProducts(productsData);
                setaAvailableKeywords(keywordsData);
                setLoading(false);
            })
            .catch((e) => {
                console.error("Failed to fetch data", e);
                setLoading(false);
            });
    }, []);

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

        const cost = parseFloat(formData.campaignFund);
        const bid = parseFloat(formData.bidAmount);
        const min = parseFloat(formData.minAmount);

        if (min > bid) {
            setAlertInfo({ type: "danger", message: "Min Amount cannot be greater than Bid Amount!" });
            return;
        }

        if (cost <= 0) {
            setAlertInfo({ type: "danger", message: "Not enough funds!" });
            return;
        }

        try {
            const walletRes = await fetch(`/wallet`);
            const wallet = await walletRes.json();

            if (wallet.balance < cost) {
                setAlertInfo({ type: "danger", message: `Not enough funds! (Cost: ${cost}, Available funds: ${wallet.balance}` });
                return;
            }

            await fetch(`/wallet`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ balance: wallet.balance - cost }),
            });

            const newCampaign = {
                name: formData.name,
                keywords: formData.keywords,
                bidAmount: parseFloat(formData.bidAmount),
                minAmount: parseFloat(formData.minAmount),
                campaignFund: parseFloat(formData.campaignFund),
                status: formData.status,
                town: formData.town,
                radius: parseInt(formData.radius),
                productId: parseInt(formData.productId),
            };

            await fetch(`/campaigns`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newCampaign),
            });

            setAlertInfo({ type: "success", message: "Campaign is created!" });
            setTimeout(() => onSuccess(), 2000);
        } catch (e) {
            console.log(e);
            setAlertInfo({ type: "danger", message: "An error occurred." });
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
                    <label for="product-select" className="form-label">
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
                    <label className="form-label" for="campaign-name">
                        Campaign Name
                    </label>
                    <input className="form-control" id="campaign-name" type="text" name="name" required onChange={handleChange} />
                </div>

                <div className="mb-3">
                    <label className="form-label" for="keywords-typeahead">
                        Keywords
                    </label>
                    <Typeahead
                        id="keywords-typeahead"
                        multiple
                        labelKey="name"
                        options={availableKeywords}
                        placeholder="Select required keywords..."
                        onChange={(selected) => {
                            setFormData({ ...formData, keywords: selected });
                        }}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label" for="city-select">
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
                    <label className="form-label" for="radius-input">
                        Radius (km)
                    </label>
                    <input id="radius-input" className="form-control" type="number" name="radius" required onChange={handleChange} />
                </div>

                <div className="mb-3">
                    <label className="form-label" for="bid-amount">
                        Bid Amount
                    </label>
                    <input id="bid-amount" className="form-control" type="number" min="1" step="0.01" name="bidAmount" required onChange={handleChange} />
                </div>

                <div className="mb-3">
                    <label className="form-label" for="min-amount">
                        Minimum Bid Amount
                    </label>
                    <input id="min-amount" className="form-control" type="number" step="0.01" name="minAmount" required onChange={handleChange} />
                </div>

                <div className="mb-3">
                    <label className="form-label" for="campaign-funds">
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
