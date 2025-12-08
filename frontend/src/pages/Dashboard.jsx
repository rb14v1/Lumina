import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import PromptCard from "../components/PromptCardDash";
import Footer from "../components/Footer";
import HistoryModal from "../components/HistoryModal.jsx";
import PaginatedGrid from "../components/PaginatedGrid";
import PromptSkeleton from "../components/PromptSkeleton";
 
const API_BASE = "/api"; 
 
export default function Dashboard() {
  const { isAdmin, isLoggedIn } = useAuth();
 
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedPromptId, setSelectedPromptId] = useState(null);
  const [loading, setLoading] = useState(false);
 
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
 
  useEffect(() => {
    const fetchPrompts = async () => {
      setLoading(true);
 
      try {
        const res = await fetch(`${API_BASE}/prompts/?status=${activeTab}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
          },
        });
 
        const json = await res.json();
 
        // ⚠️ BACKEND MAY RETURN:
        // 1. array []
        // 2. paginated: { results: [] }
        const data = Array.isArray(json) ? json : json?.results || [];
 
        setPrompts(data);
      } catch (err) {
        console.error("Error fetching prompts:", err);
        setPrompts([]); // fallback to empty
      } finally {
        setLoading(false);
      }
    };
 
    fetchPrompts();
  }, [activeTab]);
 
  const handleApprove = async (id) => {
    try {
      await fetch(`${API_BASE}/prompts/${id}/approve/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
          "Content-Type": "application/json",
        },
      });
 
      setPrompts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status: "approved" } : p
        )
      );
 
      setSelectedPrompt(null);
    } catch (err) {
      console.error("Backend sync failed:", err);
    }
  };
 
  const handleReject = async (id) => {
    try {
      await fetch(`${API_BASE}/prompts/${id}/reject/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
          "Content-Type": "application/json",
        },
      });
 
      setPrompts((prev) => prev.filter((p) => p.id !== id));
      setSelectedPrompt(null);
    } catch (err) {
      console.error("Reject sync failed:", err);
    }
  };
 
  const handleOpenHistory = (id) => {
    setSelectedPromptId(id);
    setHistoryModalOpen(true);
  };
 
  // same logic – filter by tab
  const filteredPrompts = prompts.filter((p) => p.status === activeTab);
 
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <Header />
 
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-6">
        <h1 className="text-3xl font-semibold mb-4">DASHBOARD</h1>
 
        <div className="flex items-center gap-2 bg-gray-300 p-1 rounded-full w-fit mb-6">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              activeTab === "pending"
                ? "bg-teal-500 text-white shadow-sm"
                : "text-gray-600 cursor-pointer hover:bg-gray-300"
            }`}
          >
            Pending
          </button>
 
          <button
            onClick={() => setActiveTab("approved")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              activeTab === "approved"
                ? "bg-teal-500 text-white shadow-sm"
                : "text-gray-600 cursor-pointer hover:bg-gray-300"
            }`}
          >
            Approved
          </button>
        </div>
 
        {/* SKELETON LOADING */}
        {loading && (
          <div className="mt-6">
            <PromptSkeleton count={12} />
          </div>
        )}
 
        {/* EMPTY STATE */}
        {!loading && filteredPrompts.length === 0 && (
          <p className="text-gray-500 text-center py-10">No prompts found.</p>
        )}
 
        {/* GRID CONTENT */}
        {!loading && prompts.length > 0 && (
          <PaginatedGrid
            data={prompts}
            CardComponent={PromptCard}
            cardProps={{
              onApprove: handleApprove,
              onReject: handleReject,
              onHistory: handleOpenHistory,
            }}
          />
        )}
      </main>
 
      {/* HISTORY MODAL */}
      {historyModalOpen && (
        <HistoryModal
          promptId={selectedPromptId}
          onClose={() => setHistoryModalOpen(false)}
        />
      )}
 
      <Footer />
    </div>
  );
}
 
 