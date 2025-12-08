import React, { useState, useEffect } from "react";
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
  const [task, setTask] = useState([]);
  const [output, setOutput] = useState([]);
  const [department, setDepartment] = useState([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);

  const PAGE_SIZE = 12;

  const [page, setPage] = useState(0);       // 0 => offset=0
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [allPrompts, setAllPrompts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const [searchTerm, setSearchTerm] = useState("");
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTaskTypes, setSelectedTaskTypes] = useState([]);
  const [selectedOutputFormats, setSelectedOutputFormats] = useState([]);


  const [activeTab, setActiveTab] = useState("all");
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyPromptId, setHistoryPromptId] = useState(null);


  const navigate = useNavigate();


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


  const taskTypeOptions = [
    { value: "create_content", label: "Create Content" },
    { value: "create_code", label: "Create Code" },
    { value: "research", label: "Research" },
    { value: "deep_research", label: "Deep Research / Analysis" },
    { value: "plan_organize", label: "Plan & Organize" },
    { value: "ideate", label: "Ideate / Brainstorm" },
    { value: "summarize", label: "Summarize / Review" },
    { value: "explain", label: "Explain / Teach" },
    { value: "optimize", label: "Optimize / Improve" },
  ];


  const outputFormatOptions = [
    { value: "text", label: "Text" },
    { value: "code", label: "Code" },
    { value: "chart_graph", label: "Chart / Graph" },
    { value: "checklist_table", label: "Checklist / Table" },
    { value: "template_framework", label: "Template / Framework" },
    { value: "image_visual", label: "Image / Visual" },
    { value: "slide_report", label: "Slide / Report" },
  ];

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

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: "40px",
      borderColor: state.isFocused ? "#14b8a6" : "#e5e7eb",
      borderWidth: "1px",
      borderRadius: "0.5rem",
      backgroundColor: "white",
      boxShadow: state.isFocused ? "0 0 0 1px #14b8a6" : "none",
      fontSize: "0.875rem",
      "&:hover": { borderColor: "#14b8a6" },
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: "2px 8px",
      display: "flex",
      flexWrap: "nowrap",
      overflowX: "auto",
      overflowY: "hidden",
      maxHeight: "38px",
      scrollbarWidth: "none",
      msOverflowStyle: "none",
      "&::-webkit-scrollbar": {
        display: "none",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#0d9488" : state.isFocused ? "#ccfbf1" : "white",
      color: state.isSelected ? "white" : "black",
      fontSize: "0.875rem",
      padding: "8px 12px",
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "#ccfbf1",
      fontSize: "0.875rem",
      margin: "2px",
      flexShrink: 0,
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "#0f766e",
      padding: "2px 6px",
      fontSize: "0.875rem",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "#0f766e",
      "&:hover": {
        backgroundColor: "#14b8a6",
        color: "white",
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#9ca3af",
      fontSize: "0.875rem"
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 50,
      marginTop: "4px",
    }),
    menuList: (provided) => ({
      ...provided,
      maxHeight: "200px",
    }),
  };

  const fetchPrompts = async (reset = false) => {
    // when reset, we start from offset=0 and show skeleton
    const currentOffset = reset ? 0 : page * PAGE_SIZE;

    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      let url = "/prompts/";
      const params = [];

      // respect "My Dashboard" tab
      if (activeTab === "my" && user?.username) {
        params.push("mine=1");
      }

      // lazy loading params
      params.push(`limit=${PAGE_SIZE}`);
      params.push(`offset=${currentOffset}`);

      if (params.length > 0) {
        url += "?" + params.join("&");
      }

      const res = await api.get(url);
      const backendPrompts = res.data || [];
      const mapped = backendPrompts.map(mapBackendPromptToFrontend);

      if (reset) {
        setAllPrompts(mapped);
        setPage(1); // next page index
      } else {
        setAllPrompts((prev) => [...prev, ...mapped]);
        setPage((prev) => prev + 1);
      }

      // if we got less than PAGE_SIZE, no more data
      setHasMore(backendPrompts.length === PAGE_SIZE);

      // bookmarks
      const bkIds = backendPrompts
        .filter((p) => p.is_bookmarked || (p.raw && p.raw.is_bookmarked))
        .map((p) => p.id);

      if (reset) {
        setBookmarks(bkIds);
      } else {
        setBookmarks((prev) => Array.from(new Set([...prev, ...bkIds])));
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load prompts");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };



  useEffect(() => {
  // whenever tab or user changes, reset the list and load first page
  fetchPrompts(true);
}, [activeTab, user]);


  useEffect(() => {
    setCategoryOptions(CATEGORY_OPTIONS);
  }, []);



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
      const inTitle = p.title && p.title.toLowerCase().includes(s);
      const inDesc = (p.desc || p.description || p.prompt_text || p.prompt_description || "").toLowerCase().includes(s);
      if (!inTitle && !inDesc) return false;
    }


    if (selectedCategories.length > 0) {
      const vals = selectedCategories.map((c) => c.value);
      if (!vals.includes(p.department || p.category)) return false;
    }


    if (selectedTaskTypes.length > 0) {
      const vals = selectedTaskTypes.map((t) => t.value);
      if (!vals.includes(p.task || p.task_type)) return false;
    }


    if (selectedOutputFormats.length > 0) {
      const vals = selectedOutputFormats.map((o) => o.value);
      if (!vals.includes(p.output || p.output_format)) return false;
    }


    return true;
  });


  let baseList;
  if (activeTab === "my" && user?.username) {
    baseList = allPrompts.filter((p) => p.author === user.username);
  } else {
    baseList = filteredPrompts.filter((p) => (p.raw && p.raw.status === "approved" && p.raw?.is_public === true));
  }


  const promptsToShow = showBookmarks ? baseList.filter((p) => bookmarks.includes(p.id)) : baseList;


  const handleBookmark = (prompt) => {
    setBookmarks((prev) => (prev.includes(prompt.id) ? prev.filter((id) => id !== prompt.id) : [...prev, prompt.id]));
  };


  const handleApprove = (id) => alert("Approved prompt: " + id);
  const handleReject = (id) => alert("Rejected prompt: " + id);


  const handleCardEdit = (prompt) => {
    navigate(`/add-prompt/${prompt.id}`);
  };


  const handleOpenHistory = (prompt) => {
    console.debug("[HomePage] handleOpenHistory called with prompt:", prompt);
    if (!user?.username) {
      console.warn("[HomePage] No user - cannot open history");
      alert("Please log in to view history.");
      return;
    }
    const owner = prompt.author ?? prompt.raw?.user_username ?? prompt.user_username ?? null;
    console.debug("[HomePage] prompt owner:", owner, "current user:", user.username);
    if (owner !== user.username) {
      console.warn(`[HomePage] current user (${user.username}) is not owner (${owner})`);
      alert("You can only view history for prompts you created.");
      return;
    }
    const idToSend = prompt.id ?? prompt.raw?.id ?? null;
    if (!idToSend) {
      console.error("[HomePage] No valid id found on prompt:", prompt);
      return;
    }
    setHistoryPromptId(String(idToSend));
    setHistoryModalOpen(true);
    console.debug("[HomePage] Opening history modal for id:", idToSend);
  };
  const handlePageChange = async (targetPage) => {
    // how many prompts we need to display up to this page
    const requiredCount = targetPage * PAGE_SIZE;

    // If we have less prompts loaded than needed → fetch more
    if (allPrompts.length < requiredCount && hasMore && !loadingMore) {
      await fetchPrompts(false);
    }
  };



  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <Header />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-2 bg-gray-300 p-1 rounded-full w-fit">
            <button onClick={() => setActiveTab("all")} className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === "all" ? "bg-teal-600 text-white shadow-sm" : "text-gray-600 cursor-pointer hover:bg-gray-200"}`}>
              Browse Library
            </button>
            <button onClick={() => setActiveTab("my")} className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === "my" ? "bg-teal-600 text-white shadow-sm" : "text-gray-600 cursor-pointer hover:bg-gray-200"}`}>
              My Dashboard
            </button>
          </div>


          <div className="flex items-center gap-3">
            <button onClick={() => setShowBookmarks((s) => !s)} className={`px-5 py-2 rounded-full text-sm cursor-pointer font-semibold transition-all flex items-center gap-2 border ${showBookmarks ? "bg-teal-600 text-white shadow-sm" : "bg-white text-gray-700 hover:bg-gray-200"}`}>
              <Bookmark className="w-4 h-4" />
              {showBookmarks ? "Bookmarks" : "Show Bookmarks"}
            </button>
            <button onClick={() => navigate("/add-prompt")} className="px-5 py-2 rounded-full text-sm cursor-pointer font-semibold transition-all flex items-center gap-2 bg-teal-600 text-white shadow-sm hover:bg-teal-700">
              <Plus className="w-4 h-4" />
              Create Prompt
            </button>
          </div>
        </div>


        <div className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-200">

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
            <div>
              <Select
                isMulti
                options={categoryOptions}
                value={selectedCategories}
                onChange={setSelectedCategories}
                placeholder="Department"
                styles={customSelectStyles}
                aria-label="Filter by categories"
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                isClearable={false}
                menuShouldScrollIntoView={false}
              />
            </div>


            <div>
              <Select
                isMulti
                options={taskTypeOptions}
                value={selectedTaskTypes}
                onChange={setSelectedTaskTypes}
                placeholder="Task type"
                styles={customSelectStyles}
                aria-label="Filter by task type"
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                isClearable={false}
                menuShouldScrollIntoView={false}
              />
            </div>


            <div>
              <Select
                isMulti
                options={outputFormatOptions}
                value={selectedOutputFormats}
                onChange={setSelectedOutputFormats}
                placeholder="Output format"
                styles={customSelectStyles}
                aria-label="Filter by output format"
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                isClearable={false}
                menuShouldScrollIntoView={false}
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto scrollbar-hide mt-3">
          <div className="flex gap-3 w-max py-2">
            {CATEGORY_OPTIONS.map((cat) => {
              const isActive = selectedCategories.some(
                (c) => c.value === cat.value
              );

              return (
                <button
                  key={cat.value}
                  onClick={() => {
                    if (isActive) {
                      setSelectedCategories([]);
                    } else {
                      setSelectedCategories([
                        { value: cat.value, label: cat.label },
                      ]);
                    }
                  }}
                  className={`px-4 py-2 rounded-full cursor-pointer border text-sm font-medium transition whitespace-nowrap
                    ${isActive
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-white hover:bg-gray-100"
                    }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-4">
          {loading && allPrompts.length === 0 ? (
            // first load → show skeletons
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
                onPageChange={handlePageChange}   
                cardProps={{
                  onClick: (p) => setSelectedPrompt(p),
                  handleBookmark: handleBookmark,
                  bookmarks: bookmarks,
                  onVote: (updatedBackendPrompt) => {
                    setAllPrompts((prev) =>
                      prev.map((existing) =>
                        existing.id === updatedBackendPrompt.id
                          ? mapBackendPromptToFrontend(updatedBackendPrompt)
                          : existing
                      )
                    );

                    const serverBookmarked =
                      updatedBackendPrompt.is_bookmarked ??
                      (updatedBackendPrompt.raw?.is_bookmarked ?? false);

                    setBookmarks((prev) =>
                      serverBookmarked
                        ? prev.includes(updatedBackendPrompt.id)
                          ? prev
                          : [...prev, updatedBackendPrompt.id]
                        : prev.filter((id) => id !== updatedBackendPrompt.id)
                    );

                    if (selectedPrompt && selectedPrompt.id === updatedBackendPrompt.id) {
                      setSelectedPrompt(
                        mapBackendPromptToFrontend(updatedBackendPrompt)
                      );
                    }
                  },
                  currentUserUsername: user?.username,
                  showOwnerActions: activeTab === "my",
                  onEdit: handleCardEdit,
                  onOpenHistory: handleOpenHistory,
                }}
              />
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

