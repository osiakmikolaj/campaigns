import { useEffect, useState } from "react";
import "./Dashboard.css";
import LoadingScreen from "./LoadingScreen";

const EditCampaign = ({ id, onCancel, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: "",
        keywords: "",
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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([fetch(`/towns`).then((r) => r.json()), fetch(`/products`).then((r) => r.json()), fetch(`/campaigns/${id}`).then((r) => r.json())])
            .then(([townsData, productsData, campaignData]) => {
                setTowns(townsData);
                setProducts(productsData);

                const keywordsString = Array.isArray(campaignData.keywords) ? campaignData.keywords.map((k) => k.name || k).join(", ") : campaignData.keywords;

                setFormData({
                    ...campaignData,
                    keywords: keywordsString,
                });
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch data", err);
                setLoading(false);
            });
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const bid = parseFloat(formData.bidAmount);
        const min = parseFloat(formData.minAmount);

        if (min > bid) {
            alert("Min Amount cannot be greater than Bid Amount!");
            return;
        }

        try {
            const updatedCampaign = {
                ...formData,
                bidAmount: parseFloat(formData.bidAmount),
                minAmount: parseFloat(formData.minAmount),
                campaignFund: parseFloat(formData.campaignFund),
                radius: parseInt(formData.radius),
                productId: parseInt(formData.productId),
                keywords: formData.keywords.split(",").map((k, index) => ({
                    id: Date.now() + index,
                    name: k.trim(),
                })),
            };

            await fetch(`/campaigns/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updatedCampaign) });
            alert("The changes are saved!");
            onSuccess();
        } catch (e) {
            console.error("Edit error.", e);
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="dashboard-container">
            <h2>Edit Campaign (ID: {id})</h2>
            <form onSubmit={handleSubmit} className="campaign-form">
                <div className="form-group">
                    <label>Campaign name:</label>
                    <input type="text" name="name" value={formData.name} required onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>Keywords:</label>
                    <input type="text" name="keywords" value={formData.keywords} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>Product:</label>
                    <select name="productId" value={formData.productId} onChange={handleChange} required>
                        <option value="">-- Select Product --</option>
                        {products.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Miasto:</label>
                    <select name="town" value={formData.town} required onChange={handleChange}>
                        <option value="">-- Wybierz miasto --</option>
                        {towns.map((t) => (
                            <option key={t.id} value={t.name}>
                                {t.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Radius (km):</label>
                    <input type="number" name="radius" value={formData.radius} required onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>Bid Amount:</label>
                    <input type="number" min="1" step="0.01" name="bidAmount" value={formData.bidAmount} required onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>Min Amount:</label>
                    <input type="number" step="0.01" name="minAmount" value={formData.minAmount} required onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>Funds (Emerald):</label>
                    <input type="number" step="0.01" name="campaignFund" value={formData.campaignFund} required onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>Status:</label>
                    <select name="status" value={formData.status} onChange={handleChange}>
                        <option value="on">Active</option>
                        <option value="off">Not Active</option>
                    </select>
                </div>

                <div className="form-actions">
                    <button type="button" onClick={onCancel} className="btn-secondary">
                        Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                        Save changes
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditCampaign;
