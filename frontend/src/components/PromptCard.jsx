import React, { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import FeedbackButtons from "./Feedback";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import CopyPromptButton from "../components/CopyPromptButton";
 
export default function PromptCard({
  prompt,
  onClick,
  handleBookmark,
  bookmarks,
  onVote,
  currentUserUsername,
  showOwnerActions = false,
  onEdit,
  onOpenHistory,
}) {
  const navigate = useNavigate();
  if (!prompt) return null;
 
  const raw = prompt.raw || {
    user_username: prompt.username || prompt.user_username,
    status: prompt.status || null,
    like_count: prompt.likes || prompt.like_count || 0,
    dislike_count: prompt.dislikes || prompt.dislike_count || 0,
    vote: 0,
    vote_count: 0,
    user_vote: 0,
    is_bookmarked: prompt.is_bookmarked || false,
  };
 
  const description =
    prompt.desc ||
    prompt.description ||
    prompt.prompt_description ||
    "No description available";
 
  const promptText = prompt.prompt_text ?? prompt.raw?.prompt_text ?? description;
  const copyCount = prompt.copy_count ?? prompt.raw?.copy_count ?? 0;
 
  const department =
    prompt.department ||
    prompt.category ||
    "Uncategorized";
 
  const isBookmarked =
    raw.is_bookmarked ?? (bookmarks?.includes(prompt.id) ?? false);
 
  const [userVote, setUserVote] = useState(raw.user_vote ?? 0);
  const [count, setCount] = useState(raw.vote_count ?? raw.vote ?? 0);
  const [processing, setProcessing] = useState(false);
 
  useEffect(() => {
    setUserVote(raw.user_vote ?? 0);
    setCount(raw.vote_count ?? raw.vote ?? 0);
  }, [raw]);
 
  const ownerUsername =
    raw.user_username ||
    prompt.user_username ||
    prompt.username ||
    prompt.author ||
    prompt.user?.username ||
    null;
 
  const isOwner =
    Boolean(currentUserUsername) &&
    Boolean(ownerUsername) &&
    currentUserUsername === ownerUsername;
 
  const handleUsernameClick = (e) => {
    e.stopPropagation();
    if (ownerUsername) {
      navigate(`/user/${ownerUsername}`);
    }
  };
 
  const handleApiVote = async (value) => {
    if (processing) return;
    setProcessing(true);
 
    const prevUserVote = userVote;
    const prevCount = count;
 
    let newVote = userVote;
    let newCount = count;
 
    if (userVote === value) {
      newVote = 0;
      newCount -= value;
    } else if (userVote === -value) {
      newVote = value;
      newCount += 2 * value;
    } else {
      newVote = value;
      newCount += value;
    }
 
    setUserVote(newVote);
    setCount(newCount);
 
    try {
      const endpoint = value === 1 ? "upvote" : "downvote";
      const res = await api.post(`/prompts/${prompt.id}/${endpoint}/`);
      const backend = res.data;
 
      setUserVote(Number(backend.user_vote ?? 0));
      setCount(Number(backend.vote_count ?? 0));
      if (onVote) onVote(backend);
    } catch (err) {
      setUserVote(prevUserVote);
      setCount(prevCount);
      console.error("Voting failed:", err);
    } finally {
      setProcessing(false);
    }
  };
 
  const handleBookmarkClick = async (e) => {
    e.stopPropagation();
    try {
      const res = await api.post(`/prompts/${prompt.id}/bookmark/`);
      if (res?.data && onVote) {
        onVote(res.data);
      } else if (handleBookmark) {
        handleBookmark(prompt);
      }
    } catch (err) {
      console.error("Bookmark failed:", err);
    }
  };
 
  // 🔹 ADDED: Helper functions for Owner Actions
  const handleEditClick = (e) => {
    e.stopPropagation();
    if (typeof onEdit === "function") {
      onEdit(prompt);
    } else {
      navigate(`/add-prompt/${prompt.id}`);
    }
  };
 
  const handleHistoryClick = (e) => {
    e.stopPropagation();
    if (typeof onOpenHistory === "function") {
      try {
        onOpenHistory(prompt);
      } catch (err) {
        console.error("[PromptCard] onOpenHistory error:", err);
      }
    }
  };
 
  const status = raw.status || null;
  const showHistoryForStatus = ["approved", "pending", "rejected"];
  const canShowHistory = showHistoryForStatus.includes(status);
 
  return (
    <div
      onClick={() =>
        navigate(`/add-prompt?promptId=${prompt.id}&readonly=true`)
      }
      className="bg-teal-50 p-4 rounded-xl shadow-sm border border-teal-300 cursor-pointer flex flex-col gap-3 relative min-w-0"
      style={{ maxWidth: "350px" }}
    >
      <div className="flex justify-between items-start gap-2">
        <h3
          className="font-bold text-gray-900 break-words leading-tight min-w-0 pr-8"
          style={{ minHeight: "30px" }}
        >
          {prompt.title}
        </h3>
       
        <button
          onClick={handleBookmarkClick}
          className="cursor-pointer"
        >
          <Bookmark
            className={`w-5 h-5 ${
              isBookmarked ? "text-teal-600 fill-teal-600" : "text-gray-400"
            }`}
          />
        </button>
      </div>
 
      <div className="flex justify-between items-center mb-1">
        <button
          onClick={handleUsernameClick}
          className="text-xs text-teal-600 font-semibold cursor-pointer hover:underline text-left"
        >
          @{ownerUsername}
        </button>
 
        {status === 'approved' && (
          <CopyPromptButton
            promptId={prompt.id}
            promptText={promptText}
            initialCount={copyCount}
            className="scale-90 origin-right"
          />
        )}
      </div>
 
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <p
          className="text-sm font-semibold text-gray-800 leading-relaxed whitespace-pre-wrap break-words overflow-y-auto"
          style={{
            minHeight: "50px",
            maxHeight: "50px",
            scrollbarWidth: "thin",
            scrollbarColor: "#E6FFFA",
          }}
        >
          {promptText}
        </p>
      </div>
 
      <div
        className="flex items-center justify-between mt-1"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 font-semibold rounded-md">
            #{department}
          </span>
 
          {status === "pending" && (
            <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded-md border border-yellow-200">
              Pending
            </span>
          )}
          {status === "rejected" && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md border border-gray-200">
              Rejected
            </span>
          )}
        </div>
 
        <FeedbackButtons
          onUpvote={() => handleApiVote(1)}
          onDownvote={() => handleApiVote(-1)}
          likeCount={raw.like_count ?? 0}
          dislikeCount={raw.dislike_count ?? 0}
          userVote={userVote}
        />
      </div>
 
      {/* 🔹 RESTORED: Owner Actions (Edit / History) */}
      {showOwnerActions && isOwner && (
        <div
          className="flex gap-2 mt-2 justify-around"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleEditClick}
            className="px-8 py-1 bg-white cursor-pointer border border-teal-300 text-teal-700 rounded-md hover:bg-teal-100 transition"
            aria-label={`Edit prompt ${prompt.id}`}
          >
            Edit
          </button>
 
          {canShowHistory && (
            <button
              onClick={handleHistoryClick}
              className="px-7 py-1 bg-white cursor-pointer border border-teal-300 text-teal-700 rounded-md hover:bg-teal-100 transition"
              aria-label={`View history for ${prompt.id}`}
              title="View version history"
            >
              History
            </button>
          )}
        </div>
      )}
    </div>
  );
}
 
 