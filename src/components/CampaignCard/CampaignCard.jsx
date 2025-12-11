const CampaignCard = ({ campaign, onDelete, onEdit }) => {
    return (
        <div className="card h-100">
            <div className="card-body">
                <h3 className="card-title">{campaign.name}</h3>
                <p className={`card-text status-badge ${campaign.status === "on" ? "active" : "inactive"}`}>
                    {campaign.status === "on" ? "ACTIVE" : "INACTIVE"}
                </p>

                <ul class="list-group list-group-flush">
                    <li class="list-group-item">
                        City:{" "}
                        <strong>
                            {campaign.town} ({campaign.radius} km)
                        </strong>
                    </li>
                    <li class="list-group-item">
                        Keywords:{" "}
                        <div className="tags">
                            {campaign.keywords.map((k, index) => (
                                <span key={k.id || index} className="tag">
                                    {k.name || k}
                                </span>
                            ))}
                        </div>
                    </li>
                    <li class="list-group-item">
                        Bid Amount: <strong>{campaign.bidAmount}</strong>
                    </li>
                    <li class="list-group-item">
                        Min Amount: <strong>{campaign.minAmount}</strong>
                    </li>
                    <li class="list-group-item">
                        Funds: <strong>{campaign.campaignFund}</strong>
                    </li>
                </ul>
            </div>

            <div className="d-grid gap-2 d-md-block">
                <button className="btn btn-outline-secondary" type="button" onClick={() => onEdit(campaign.id)}>
                    Edit
                </button>
                <button className="btn btn-outline-danger" type="button" onClick={() => onDelete(campaign.id)}>
                    Delete
                </button>
            </div>
        </div>
    );
};

export default CampaignCard;
