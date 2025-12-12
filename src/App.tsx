import { BrowserRouter, Routes, Route } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import EditCampaign from "./components/EditCampaign";
import CreateCampaign from "./components/CreateCampaign";

function App() {
    return (
        <BrowserRouter>
            <div className="App d-flex flex-column min-vh-100">
                <Navbar />
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/create" element={<CreateCampaign />} />
                    <Route path="/edit/:id" element={<EditCampaign />} />
                </Routes>
                <Footer />
            </div>
        </BrowserRouter>
    );
}

export default App;
