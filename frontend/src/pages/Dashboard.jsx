import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import PromptCard from "../components/PromptCardDash";
import Footer from "../components/Footer";
import HistoryModal from "../components/HistoryModal.jsx";
import PaginatedGrid from "../components/PaginatedGrid";
 
const API_BASE = "/api";
 
export default function Dashboard() {
  const { isAdmin, isLoggedIn } = useAuth();
  const [loading, setLoading] = useState(false);
 
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
 
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
 
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedPromptId, setSelectedPromptId] = useState(null);
 
  useEffect(() => {
    const fetchPrompts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/prompts/?status=${activeTab}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
          },
        });
        const data = await res.json();
        setPrompts(data);
      } catch (err) {
        console.error("Error fetching prompts:", err);
      }finally {
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
        prev.map((p) => (p.id === id ? { ...p, status: "approved" } : p))
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
       
        {loading ? (
          <div className="text-center text-gray-500 py-10">
            Loading prompts...
          </div>
        ) : filteredPrompts.length === 0 ? (
        <div className="text-center text-gray-500">
          No prompts found.
        </div>
      ) : (
        <PaginatedGrid
          data={filteredPrompts}
          CardComponent={PromptCard}
          cardProps={{
            onApprove: handleApprove,
            onReject: handleReject,
            onHistory: handleOpenHistory,
          }}
        />
      )}
      </main>
 
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
 
 