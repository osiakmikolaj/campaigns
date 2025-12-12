import { useState } from "react";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import EditCampaign from "./components/EditCampaign";
import CreateCampaign from "./components/CreateCampaign";

function App() {
    const [view, setView] = useState<"dashboard" | "create" | "edit">("dashboard");
    const [editingId, setEditingId] = useState<number | null>(null);

    const handleStartEdit = (id: number) => {
        setEditingId(id);
        setView("edit");
    };

    return (
        <div className="App d-flex flex-column min-vh-100">
            <Navbar />
            {view === "dashboard" && <Dashboard onNavigateToCreate={() => setView("create")} onNavigateToEdit={handleStartEdit} />}
            {view === "create" && <CreateCampaign onCancel={() => setView("dashboard")} onSuccess={() => setView("dashboard")} />}
            {view === "edit" && editingId && <EditCampaign id={editingId} onCancel={() => setView("dashboard")} onSuccess={() => setView("dashboard")} />}
            <Footer />
        </div>
    );
}

export default App;
