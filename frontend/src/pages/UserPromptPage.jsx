import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PromptCard from "../components/PromptCard";
import PaginatedGrid from "../components/PaginatedGrid";
import PromptSkeleton from "../components/PromptSkeleton";
 
export default function UserPromptsPage() {
  const { username } = useParams();
  const navigate = useNavigate();
 
  const [prompts, setPrompts] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingBackground, setLoadingBackground] = useState(false);
  const [error, setError] = useState("");
 
  const mapPrompt = (p) => ({
    id: p.id,
    title: p.title,
    desc: p.prompt_description || p.prompt_text || "",
    description: p.prompt_description || "",
    department: p.category || "",
    author: p.user_username || "",
    prompt_text: p.prompt_text || "",
    copy_count: p.copy_count || 0,
    raw: p,
  });
 
  const fetchInitialPrompts = async () => {
    try {
      setLoading(true);
      setError("");
 
      let url = `/prompts/?limit=60&offset=0`;
      if (username) url += `&username=${username}`;
 
      const res = await api.get(url);
 
      const backend = Array.isArray(res.data)
        ? res.data
        : res.data?.results || [];
 
      const mapped = backend.map(mapPrompt);
      setPrompts(mapped);
 
      const bookmarkIds = backend
        .filter((p) => p.is_bookmarked || p.raw?.is_bookmarked)
        .map((p) => p.id);
 
      setBookmarks(bookmarkIds);
    } catch (err) {
      console.error("❌ Initial load error:", err);
      setError("Failed to load prompts.");
    } finally {
      setLoading(false);
    }
  };
 
  const fetchRemainingPrompts = async () => {
    try {
      setLoadingBackground(true);
 
      let offset = 60;
      const LIMIT = 500;
 
      while (true) {
        let url = `/prompts/?limit=${LIMIT}&offset=${offset}`;
        if (username) url += `&username=${username}`;
 
        const res = await api.get(url);
 
        const backend = Array.isArray(res.data)
          ? res.data
          : res.data?.results || [];
 
        if (!backend.length) break;
 
        const mapped = backend.map(mapPrompt);
 
        setPrompts((prev) => [...prev, ...mapped]);
 
        const newBK = backend
          .filter((p) => p.is_bookmarked || p.raw?.is_bookmarked)
          .map((p) => p.id);
 
        setBookmarks((prev) =>
          Array.from(new Set([...prev, ...newBK]))
        );
 
        offset += LIMIT;
      }
    } catch (err) {
      console.error("❌ Background load failed:", err);
    } finally {
      setLoadingBackground(false);
    }
  };
 
  useEffect(() => {
    if (!username) return;
    fetchInitialPrompts().then(() => fetchRemainingPrompts());
  }, [username]);
 
  const handleBookmark = (promptObj) => {
    setBookmarks((prev) =>
      prev.includes(promptObj.id)
        ? prev.filter((id) => id !== promptObj.id)
        : [...prev, promptObj.id]
    );
  };
 
  const handleVoteUpdate = (updatedBackendPrompt) => {
    setPrompts((prev) =>
      prev.map((p) =>
        p.id === updatedBackendPrompt.id
          ? mapPrompt(updatedBackendPrompt)
          : p
      )
    );
 
    const isBookmarked =
      updatedBackendPrompt.is_bookmarked ??
      updatedBackendPrompt.raw?.is_bookmarked ??
      false;
 
    setBookmarks((prev) =>
      isBookmarked
        ? prev.includes(updatedBackendPrompt.id)
          ? prev
          : [...prev, updatedBackendPrompt.id]
        : prev.filter((id) => id !== updatedBackendPrompt.id)
    );
  };
 
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <Header />
 
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-6 pb-24">
        <div className="relative flex items-center w-full mt-2 mb-2">
          <button
            onClick={() => {
              if (window.history.length > 1) navigate(-1);
              else navigate(`/user/${username}`);
            }}
            className="px-4 py-2 cursor-pointer bg-teal-600 text-white rounded-lg shadow hover:bg-teal-700 transition absolute left-0"
          >
            ← Back
          </button>
 
          <div className="mx-auto text-center mb-3">
            <h1 className="text-2xl font-bold">{username}'s Prompts</h1>
          </div>
        </div>
 
        {loading ? (
          <>{prompts.length === 0 && <PromptSkeleton count={9} />}</>
        ) : error ? (
          <p className="text-center text-red-500 mt-10">{error}</p>
        ) : prompts.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No prompts found.</p>
        ) : (
          <PaginatedGrid
            data={prompts}
            CardComponent={PromptCard}
            cardProps={{
              handleBookmark: handleBookmark,
              bookmarks: bookmarks,
              onVote: handleVoteUpdate,
              currentUserUsername: username,
              showOwnerActions: false,
            }}
          />
        )}
      </main>
 
      <Footer />
    </div>
  );
}
 
 