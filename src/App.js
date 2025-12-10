import { use, useState } from "react";
import "./App.css";
import Dashboard from "./components/Dashboard";
import EditCampaign from "./components/EditCampaign";

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
            {view === "edit" && editingId && <EditCampaign id={editingId} onCancel={() => setView("dashboard")} onSuccess={() => setView("dashboard")} />}
        </div>
    );
}

export default App;
