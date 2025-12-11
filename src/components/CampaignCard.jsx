const CampaignCard = ({ campaign, onDelete, onEdit }) => {
    return (
        <div className="card border-0 h-100 shadow">
            <div className="card-body d-flex flex-column">
                <div className="d-flex flex-row justify-content-between align-items-center mb-3">
                    <h3 className="card-title mb-0 text-break">{campaign.name}</h3>
                    <span className={`p-2 badge rounded-pill ${campaign.status === "on" ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}>
                        {campaign.status === "on" ? "ACTIVE" : "INACTIVE"}
                    </span>
                </div>

                <ul class="list-group list-group-flush">
                    <li class="list-group-item">
                        City:{" "}
                        <strong>
                            {campaign.town} ({campaign.radius} km)
                        </strong>
                    </li>
                    <li class="list-group-item">
                        Keywords:{" "}
                        <div className="d-flex flex-row flex-wrap gap-1 mt-1">
                            {campaign.keywords.map((k, index) => (
                                <span key={k.id || index} className="badge rounded-pill text-bg-secondary">
                                    {k.name || k}
                                </span>
                            ))}
                        </div>
                    </li>
                    <li class="list-group-item">
                        Bid amount: <strong>{campaign.bidAmount}</strong>
                    </li>
                    <li class="list-group-item">
                        Minimum bid amount: <strong>{campaign.minAmount}</strong>
                    </li>
                    <li class="list-group-item">
                        Funds: <strong>{campaign.campaignFund}</strong>
                    </li>
                    <li className="list-group-item"></li>
                </ul>
                <div className="d-flex flex-row gap-2 w-100 w-sm-auto justify-content-end mt-auto">
                    <button className="btn btn-secondary btn-sm flex-grow-1 flex-sm-grow-0" type="button" onClick={() => onEdit(campaign.id)}>
                        Edit
                    </button>
                    <button className="btn btn-outline-danger btn-sm flex-grow-1 flex-sm-grow-0" type="button" onClick={() => onDelete(campaign.id)}>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CampaignCard;
