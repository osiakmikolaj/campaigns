import { useEffect, useState } from "react";
import LoadingScreen from "../LoadingScreen/LoadingScreen";
import "./CampaignForm.css";

const CreateCampaign = ({ onCancel, onSuccess }) => {
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
        Promise.all([fetch(`/towns`).then((r) => r.json()), fetch(`/products`).then((r) => r.json())])
            .then(([townsData, productsData]) => {
                setTowns(townsData);
                setProducts(productsData);
                setLoading(false);
            })
            .catch((e) => {
                console.error(e);
                setLoading(false);
            });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const cost = parseFloat(formData.campaignFund);
        const bid = parseFloat(formData.bidAmount);
        const min = parseFloat(formData.minAmount);

        if (min > bid) {
            alert("Min Amount cannot be greater than Bid Amount!");
            return;
        }

        if (cost <= 0) return alert("Not enough funds!");

        try {
            const walletRes = await fetch(`/wallet`);
            const wallet = await walletRes.json();

            if (wallet.balance < cost) {
                alert(`Not enough funds! (Cost: ${cost}, Available funds: ${wallet.balance}`);
                return;
            }

            const newBalance = wallet.balance - cost;
            await fetch(`/wallet`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ balance: newBalance }),
            });

            const keywordsArray = formData.keywords.split(",").map((word, index) => ({
                id: Date.now() + index,
                name: word.trim(),
            }));

            const newCampaign = {
                name: formData.name,
                keywords: keywordsArray,
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

            alert("Campaign is created!");
            onSuccess();
        } catch (e) {
            console.log(e);
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="dashboard-container">
            <h2>New campaign</h2>

            <form onSubmit={handleSubmit} className="campaign-form">
                <div className="form-group">
                    <label>Product:</label>
                    <select name="productId" required onChange={handleChange}>
                        <option value="">-- Choose product --</option>
                        {products.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Name of the campaign:</label>
                    <input type="text" name="name" required onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>Keywords (separate with commas):</label>
                    <input type="text" name="keywords" placeholder="e.g. bike, summer, sale" required onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>City:</label>
                    <select name="town" required onChange={handleChange}>
                        <option value="">-- Choose the city --</option>
                        {towns.map((t) => (
                            <option key={t.id} value={t.name}>
                                {t.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Radius (km):</label>
                    <input type="number" name="radius" required onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>Bid Amount:</label>
                    <input type="number" min="1" step="0.01" name="bidAmount" required onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>Min Amount:</label>
                    <input type="number" step="0.01" name="minAmount" required onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>Campaign funds (taken from the wallet):</label>
                    <input type="number" step="0.01" name="campaignFund" required onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>Status:</label>
                    <select name="status" onChange={handleChange}>
                        <option value="off">Unactive (OFF)</option>
                        <option value="on">Active (ON)</option>
                    </select>
                </div>

                <div className="form-actions">
                    <button type="button" onClick={onCancel} className="btn-secondary">
                        Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                        Create and pay
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateCampaign;
