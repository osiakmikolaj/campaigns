import { use, useState } from "react";
import Dashboard from "./components/Dashboard/Dashboard";
import EditCampaign from "./components/CampaignForm/EditCampaign";
import CreateCampaign from "./components/CampaignForm/CreateCampaign";

function App() {
    const [view, setView] = useState("dashboard");
    const [editingId, setEditingId] = useState(null);

    const handleStartEdit = (id) => {
        setEditingId(id);
        setView("edit");
    };

    return (
        <div className="App">
            {view === "dashboard" && <Dashboard onNavigateToCreate={() => setView("create")} onNavigateToEdit={handleStartEdit} />}
            {view === "create" && <CreateCampaign onCancel={() => setView("dashboard")} onSuccess={() => setView("dashboard")} />}
            {view === "edit" && editingId && <EditCampaign id={editingId} onCancel={() => setView("dashboard")} onSuccess={() => setView("dashboard")} />}
        </div>
    );
}

export default App;
