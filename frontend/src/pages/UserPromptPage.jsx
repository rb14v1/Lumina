// frontend/src/pages/UserPromptsPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PromptCard from "../components/PromptCard";
import PaginatedGrid from "../components/PaginatedGrid";
 
export default function UserPromptsPage() {
    const { username } = useParams();
    const navigate = useNavigate();
 
    const [prompts, setPrompts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
 
    useEffect(() => {
        if (!username) return;
 
        const fetchPrompts = async () => {
            setLoading(true);
            setError("");
 
            try {
                const res = await api.get("/prompts/", {
                    params: { username },
                });
 
                console.log("📌 USER PROMPTS API RESPONSE:", res.data);
 
                setPrompts(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("❌ Error fetching user prompts:", err);
                setError("Failed to load prompts.");
            } finally {
                setLoading(false);
            }
        };
 
        fetchPrompts();
    }, [username]);
 
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
            <Header />
 
            <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-6 pb-24">
                <div className="relative flex items-center w-full mt-2 mb-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 cursor-pointer bg-teal-600 text-white rounded-lg shadow hover:bg-teal-700 transition absolute left-0"
                    >
                        ← Back
                    </button>
 
                    <div className="mx-auto text-center mb-3">
                        <h1 className="text-2xl font-bold">{username}'s Prompts</h1>
                    </div>
                </div>
 
                {loading ? (
                    <p className="text-center text-gray-500 mt-10">Loading prompts...</p>
                    ) : error ? (
                    <p className="text-center text-red-500 mt-10">{error}</p>
                    ) : prompts.length === 0 ? (
                    <p className="text-center text-gray-500 mt-10">No prompts found.</p>
                    ) : (
                    <PaginatedGrid
                        data={prompts}
                        CardComponent={PromptCard}
                    />
                    )}
            </main>
 
            <Footer />
        </div>
    );
}
 