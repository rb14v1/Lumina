import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PromptCard from "../components/PromptCard";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { Bookmark, Plus, Search } from "lucide-react";
import api from "../api/axios";
import Select from "react-select";
import HistoryModal from "../components/HistoryModal";
import PaginatedGrid from "../components/PaginatedGrid";
import PromptSkeleton from "../components/PromptSkeleton";
 
export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
 
  const PAGE_SIZE = 12;
 
  const [allPrompts, setAllPrompts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
 
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
 
  const [task] = useState([]);
  const [output] = useState([]);
  const [department] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTaskTypes, setSelectedTaskTypes] = useState([]);
  const [selectedOutputFormats, setSelectedOutputFormats] = useState([]);
 
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
 
  const [searchTerm, setSearchTerm] = useState("");
 
  const [activeTab, setActiveTab] = useState("all");
 
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyPromptId, setHistoryPromptId] = useState(null);
 
  // sentinel element for infinite scroll
  const observerRef = useRef(null);
 
  // -------------------------
  // Mapping backend -> frontend
  // -------------------------
  const mapBackendPromptToFrontend = (p) => ({
    id: p.id,
    title: p.title,
    desc: p.prompt_description || p.prompt_text || "",
    task: p.task_type || "",
    output: p.output_format || "",
    department: p.category || "",
    author: p.user_username || "Unknown",
    template: p.prompt_text || "",
    description: p.prompt_description || "",
    intendedUse: p.intended_use || "",
    guide: p.guidance || "",
    raw: p,
  });
 
  // --------------------------------
  // API call
  // --------------------------------
  const fetchPrompts = useCallback(async (reset = false) => {
    const currentOffset = reset ? 0 : page * PAGE_SIZE;
 
    if (reset) setLoading(true);
    else setLoadingMore(true);
 
    setError(null);
 
    try {
      let url = "/prompts/";
      const params = [];
 
      if (activeTab === "my" && user?.username) params.push("mine=1");
 
      params.push(`limit=${PAGE_SIZE}`);
      params.push(`offset=${currentOffset}`);
 
      if (params.length > 0) url += "?" + params.join("&");
 
      const res = await api.get(url);
      const backendPrompts = res.data || [];
      const mapped = backendPrompts.map(mapBackendPromptToFrontend);
 
      if (reset) {
        setAllPrompts(mapped);
        setPage(1);
      } else {
        setAllPrompts((prev) => [...prev, ...mapped]);
        setPage((prev) => prev + 1);
      }
 
      setHasMore(backendPrompts.length === PAGE_SIZE);
 
      // bookmarks (append)
      const bkIds = backendPrompts
        .filter((p) => p.is_bookmarked || (p.raw && p.raw.is_bookmarked))
        .map((p) => p.id);
 
      if (reset) {
        setBookmarks(bkIds);
      } else {
        setBookmarks((prev) =>
          Array.from(new Set([...prev, ...bkIds]))
        );
      }
 
    } catch (err) {
      console.error(err);
      setError("Failed to load prompts");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [page, activeTab, user]);
 
  // --------------------------
  // RESET on tab changes
  // --------------------------
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchPrompts(true);
  }, [activeTab, user]);
 
  // --------------------------------------
  // CATEGORY OPTIONS
  // --------------------------------------
  const CATEGORY_OPTIONS = [
    { value: "Software", label: "Software" },
    { value: "content_comms", label: "Communication" },
    { value: "design", label: "Design" },
    { value: "engineering", label: "Engineering" },
    { value: "finance", label: "Finance" },
    { value: "hr", label: "Human Resources" },
    { value: "learning", label: "Learning & Development" },
    { value: "marketing", label: "Marketing" },
    { value: "product_management", label: "Product Management" },
    { value: "support", label: "Support" },
  ];
 
  useEffect(() => setCategoryOptions(CATEGORY_OPTIONS), []);
 
  // ------------------------------------------------
  // Filtering logic (unchanged)
  // ------------------------------------------------
  const matchesAny = (selectedArr, fieldValue) => {
    if (!selectedArr || selectedArr.length === 0) return true;
    if (!fieldValue) return false;
    return selectedArr.includes(fieldValue);
  };
 
  const filteredPrompts = allPrompts.filter((p) => {
    if (!matchesAny(task, p.task)) return false;
    if (!matchesAny(output, p.output)) return false;
    if (!matchesAny(department, p.department)) return false;
 
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      const titleMatch = p.title?.toLowerCase().includes(s);
      const descMatch = (p.desc || "").toLowerCase().includes(s);
      if (!titleMatch && !descMatch) return false;
    }
 
    if (selectedCategories.length > 0) {
      const vals = selectedCategories.map((c) => c.value);
      if (!vals.includes(p.department)) return false;
    }
 
    if (selectedTaskTypes.length > 0) {
      const vals = selectedTaskTypes.map((t) => t.value);
      if (!vals.includes(p.task)) return false;
    }
 
    if (selectedOutputFormats.length > 0) {
      const vals = selectedOutputFormats.map((o) => o.value);
      if (!vals.includes(p.output)) return false;
    }
 
    return true;
  });
 
  const baseList =
    activeTab === "my" && user?.username
      ? allPrompts.filter((p) => p.author === user.username)
      : filteredPrompts.filter(
          (p) => p.raw?.status === "approved" && p.raw?.is_public === true
        );
 
  const promptsToShow = showBookmarks
    ? baseList.filter((p) => bookmarks.includes(p.id))
    : baseList;
 
  // ---------------------------------------------------
  // Bookmark handlers
  // ---------------------------------------------------
  const handleBookmark = (prompt) => {
    setBookmarks((prev) =>
      prev.includes(prompt.id)
        ? prev.filter((id) => id !== prompt.id)
        : [...prev, prompt.id]
    );
  };
 
  // ---------------------------------------------------
  // Open history modal
  // ---------------------------------------------------
  const handleOpenHistory = (prompt) => {
    if (!user?.username) {
      alert("Please log in to view history.");
      return;
    }
    if (prompt.author !== user.username) {
      alert("You can only view history for prompts you created.");
      return;
    }
    setHistoryPromptId(String(prompt.id));
    setHistoryModalOpen(true);
  };
 
  // ---------------------------------------------------
  // EDIT
  // ---------------------------------------------------
  const handleCardEdit = (p) => navigate(`/add-prompt/${p.id}`);
 
  // ---------------------------------------------------
  // Intersection Observer - Lazy load
  // ---------------------------------------------------
  useEffect(() => {
    if (!hasMore || loadingMore) return;
 
    const observer = new IntersectionObserver((entries) => {
      const last = entries[0];
      if (last.isIntersecting) fetchPrompts(false);
    });
 
    if (observerRef.current) observer.observe(observerRef.current);
 
    return () => observer.disconnect();
  }, [hasMore, loadingMore, fetchPrompts]);
 
  // ---------------------------------------------------
  // Render UI
  // ---------------------------------------------------
 
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <Header />
 
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-6">
 
        {/* TOP BAR */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-2 bg-gray-300 p-1 rounded-full w-fit">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                activeTab === "all"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              Browse Library
            </button>
 
            <button
              onClick={() => setActiveTab("my")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                activeTab === "my"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              My Dashboard
            </button>
          </div>
 
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBookmarks((s) => !s)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 border ${
                showBookmarks
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-white text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Bookmark className="w-4 h-4" />
              {showBookmarks ? "Bookmarks" : "Show Bookmarks"}
            </button>
 
            <button
              onClick={() => navigate("/add-prompt")}
              className="px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 bg-teal-600 text-white shadow-sm hover:bg-teal-700"
            >
              <Plus className="w-4 h-4" />
              Create Prompt
            </button>
          </div>
        </div>
 
        {/* FILTERS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          {/* SEARCH */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm"
            />
          </div>
 
          {/* CATEGORY */}
          <Select
            isMulti
            options={categoryOptions}
            value={selectedCategories}
            onChange={setSelectedCategories}
            placeholder="Department"
          />
 
          {/* TASK */}
          <Select
            isMulti
            options={[]}
            value={selectedTaskTypes}
            onChange={setSelectedTaskTypes}
            placeholder="Task type"
          />
 
          {/* OUTPUT */}
          <Select
            isMulti
            options={[]}
            value={selectedOutputFormats}
            onChange={setSelectedOutputFormats}
            placeholder="Output format"
          />
        </div>
 
        {/* RESULTS */}
        <div className="mt-4">
          {loading && allPrompts.length === 0 ? (
            <PromptSkeleton count={12} />
          ) : error ? (
            <div className="text-red-500 text-sm py-4">{error}</div>
          ) : promptsToShow.length === 0 ? (
            <div className="text-gray-500 text-sm py-4">No prompts found.</div>
          ) : (
            <>
              <PaginatedGrid
                data={promptsToShow}
                CardComponent={PromptCard}
                cardProps={{
                  onClick: setSelectedPrompt,
                  handleBookmark,
                  bookmarks,
                  currentUserUsername: user?.username,
                  showOwnerActions: activeTab === "my",
                  onEdit: handleCardEdit,
                  onOpenHistory: handleOpenHistory,
                }}
              />
 
              {/* Sentinel for lazy loading */}
              {hasMore && (
                <div ref={observerRef} className="h-10 flex justify-center items-center">
                  {loadingMore && (
                    <div className="text-sm text-gray-500">Loading...</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
 
      <Footer />
 
      {historyModalOpen && historyPromptId && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99999 }}>
          <HistoryModal
            promptId={historyPromptId}
            onClose={() => {
              setHistoryModalOpen(false);
              setHistoryPromptId(null);
            }}
          />
        </div>
      )}
    </div>
  );
}
 
 