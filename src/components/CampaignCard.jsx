const CampaignCard = ({ campaign, onDelete, onEdit }) => {
    return (
        <div className="campaign-card">
            <div className="card-header">
                <h3>{campaign.name}</h3>
                <span className={`status-badge ${campaign.status === "on" ? "active" : "inactive"}`}>{campaign.status === "on" ? "ACTIVE" : "OFF"}</span>
            </div>

            <div className="card-body">
                <div className="info-row">
                    <span>City:</span>{" "}
                    <strong>
                        {campaign.town} ({campaign.radius} km)
                    </strong>
                </div>
                <div className="info-row">
                    <span>Keywords:</span>
                    <div className="tags">
                        {campaign.keywords.map((k, index) => (
                            <span key={k.id || index} className="tag">
                                {k.name || k}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="info-row">
                    <span>Bid Amount:</span> <strong>{campaign.bidAmount}</strong>
                </div>
                <div className="info-row">
                    <span>Funds:</span> <strong>{campaign.campaignFund}</strong>
                </div>
            </div>

            <div className="card-actions">
                <button className="btn-secondary" onClick={() => onEdit(campaign.id)}>
                    Edit
                </button>
                <button className="btn-danger" onClick={() => onDelete(campaign.id)}>
                    Delete
                </button>
            </div>
        </div>
    );
};

export default CampaignCard;
