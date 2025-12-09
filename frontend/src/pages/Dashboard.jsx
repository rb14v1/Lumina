import React, { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import PromptCard from "../components/PromptCardDash";
import Footer from "../components/Footer";
import HistoryModal from "../components/HistoryModal.jsx";
import PaginatedGrid from "../components/PaginatedGrid";
import PromptSkeleton from "../components/PromptSkeleton";
import api from "../api/axios";
 
export default function Dashboard() {
  const { isAdmin, isLoggedIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingBackground, setLoadingBackground] = useState(false);
 
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
 
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
 
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedPromptId, setSelectedPromptId] = useState(null);
 
  // request id to ignore stale responses when tab changes
  const reqIdRef = useRef(0);
 
  // helper: safely update prompts only if request id still matches
  const safeSetPrompts = (id, updater) => {
    if (reqIdRef.current !== id) return;
    setPrompts(updater);
  };
 
  const fetchInitialPrompts = async (id) => {
    try {
      setLoading(true);
      const url = `/prompts/?status=${activeTab}&limit=60&offset=0`;
      // debug
      // console.log("Fetching initial prompts from:", url);
      const res = await api.get(url);
      const dataArray = Array.isArray(res.data) ? res.data : res.data?.results || [];
      safeSetPrompts(id, () => dataArray);
    } catch (err) {
      // ignore if stale request
      if (reqIdRef.current !== id) return;
      console.error("Error fetching initial prompts:", err);
    } finally {
      if (reqIdRef.current === id) setLoading(false);
    }
  };
 
  const fetchRemainingPrompts = async (id) => {
    try {
      setLoadingBackground(true);
 
      let offset = 60;
      const LIMIT = 500;
      // safety: avoid infinite loops; allow up to 20 background pages
      const MAX_PAGES = 20;
      let pages = 0;
 
      while (pages < MAX_PAGES) {
        // if user changed tab or a new request started -> stop
        if (reqIdRef.current !== id) break;
 
        const url = `/prompts/?status=${activeTab}&limit=${LIMIT}&offset=${offset}`;
        // console.log("Fetching remaining prompts:", url);
        const res = await api.get(url);
        const dataArray = Array.isArray(res.data) ? res.data : res.data?.results || [];
 
        if (!dataArray.length) break;
 
        // append safely (but ensure still current request)
        if (reqIdRef.current === id) {
          setPrompts((prev) => {
            // avoid duplicates by id
            const existingIds = new Set(prev.map((p) => p.id));
            const filtered = dataArray.filter((d) => !existingIds.has(d.id));
            return [...prev, ...filtered];
          });
        } else {
          break;
        }
 
        offset += LIMIT;
        pages += 1;
      }
    } catch (err) {
      if (reqIdRef.current !== id) return;
      console.error("Background load failed:", err);
    } finally {
      if (reqIdRef.current === id) setLoadingBackground(false);
    }
  };
 
  // single effect that runs on activeTab change
  useEffect(() => {
    // bump request id so previous fetches are ignored
    reqIdRef.current += 1;
    const myReqId = reqIdRef.current;
 
    // clear old prompts immediately so UI doesn't show stale cards
    setPrompts([]);
    setLoadingBackground(false);
 
    // fetch initial + remaining for this tab only
    (async () => {
      await fetchInitialPrompts(myReqId);
      // if initial fetch returned and this request is still active, fetch remaining
      if (reqIdRef.current === myReqId) {
        fetchRemainingPrompts(myReqId);
      }
    })();
 
    // cleanup - when component unmounts, bump reqId to cancel
    return () => {
      reqIdRef.current += 1;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);
 
  const handleApprove = async (id) => {
    try {
      await api.post(`/prompts/${id}/approve/`);
      // If currently viewing pending tab, remove the prompt from list (since it's now approved)
      if (activeTab === "pending") {
        setPrompts((prev) => prev.filter((p) => p.id !== id));
      } else {
        // otherwise update in-place
        setPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, status: "approved" } : p)));
      }
      setSelectedPrompt(null);
    } catch (err) {
      console.error("Backend sync failed:", err);
    }
  };
 
  const handleReject = async (id) => {
    try {
      await api.post(`/prompts/${id}/reject/`);
      // remove from current view
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
 
        {loading && <PromptSkeleton count={12} />}
 
        {!loading && prompts.length === 0 && (
          <p className="text-gray-500 text-center py-10">No prompts found.</p>
        )}
 
        {!loading && prompts.length > 0 && (
          <>
            <PaginatedGrid
              data={prompts}
              CardComponent={PromptCard}
              cardProps={{
                onApprove: handleApprove,
                onReject: handleReject,
                onHistory: handleOpenHistory,
              }}
            />
            {loadingBackground && (
              <div className="mt-4">
                <p className="text-gray-500 text-center text-sm mb-3">Loading more prompts...</p>
                <PromptSkeleton count={12} />
              </div>
            )}
          </>
        )}
      </main>
 
      {historyModalOpen && (
        <HistoryModal promptId={selectedPromptId} onClose={() => setHistoryModalOpen(false)} />
      )}
      <Footer />
    </div>
  );
}