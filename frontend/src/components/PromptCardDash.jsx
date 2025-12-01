import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import CopyPromptButton from "../components/CopyPromptButton";

export default function PromptCardDash({
  prompt,
  onApprove,
  onReject,
  onHistory,
}) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loadingApprove, setLoadingApprove] = useState(false);
  const [loadingReject, setLoadingReject] = useState(false);

  if (!prompt) return null;

  const title =
    prompt.title ??
    prompt.raw?.title ??
    prompt.name ??
    prompt.prompt_title ??
    "Untitled";

  const author =
    prompt.author ??
    prompt.user_username ??
    prompt.creator ??
    prompt.user?.username ??
    prompt.raw?.user_username ??
    "Unknown";

  const promptText = prompt.prompt_text ?? prompt.raw?.prompt_text;
  const copyCount = prompt.copy_count ?? prompt.raw?.copy_count ?? 0;

  const department =
    prompt.department ?? prompt.category ?? prompt.raw?.category ?? "Uncategorized";

  const status = prompt.raw?.status ?? prompt.status ?? null;

  const isApproved =
    status === "approved" ||
    prompt?.raw?.is_approved ||
    prompt?.is_approved;

  const safeOnApprove =
    typeof onApprove === "function" ? onApprove : () => {};
  const safeOnReject =
    typeof onReject === "function" ? onReject : () => {};
  const safeOnHistory =
    typeof onHistory === "function" ? onHistory : () => {};

  const checkIsAdmin = (u) =>
    Boolean(
      u &&
        (u.is_staff ||
          u.is_superuser ||
          u.isStaff ||
          u.isSuperuser ||
          u.role === "admin" ||
          u.role === "staff")
    );

  const isOwner = user && author && user.username === author;
  const isAdmin = checkIsAdmin(user);

  const handleCardClick = (e) => {
    if (e.target.closest("button") || e.target.closest(".username-click")) return;

    const promptId = prompt.id ?? prompt.raw?.id;

    if (isOwner || isAdmin) navigate(`/prompts/edit/${promptId}`);
    else navigate(`/prompts/add?promptId=${promptId}&readonly=true`);
  };

  const SimpleSuccessToast = (message) => {
    toast.success(
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 15, color: "#374151" }}>{message}</span>
      </div>,
      {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        progressStyle: { background: "#22c55e" }, 
        closeOnClick: true,
        draggable: true,
        theme: "light",
      }
    );
  };

  const SimpleErrorToast = (message) => {
    toast.error(
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 15, color: "#374151" }}>{message}</span>
      </div>,
      {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        progressStyle: { background: "#ef4444" },
        theme: "light",
      }
    );
  };

  const handleApproveClick = async (e) => {
    e.stopPropagation();
    if (loadingApprove) return;

    setLoadingApprove(true);

    try {
      await safeOnApprove(prompt.id);
      SimpleSuccessToast("Prompt approved");
    } catch {
      SimpleErrorToast("Failed to approve prompt");
    } finally {
      setLoadingApprove(false);
    }
  };

  const handleRejectClick = async (e) => {
    e.stopPropagation();
    if (loadingReject) return;

    setLoadingReject(true);

    try {
      await safeOnReject(prompt.id);
      SimpleErrorToast("Prompt rejected.");
    } catch {
      SimpleErrorToast("Failed to reject prompt");
    } finally {
      setLoadingReject(false);
    }
  };

  const handleCopy = () => {
    SimpleSuccessToast("Prompt copied!");
  };

  return (
    <div
      className="bg-teal-50 p-6 rounded-xl shadow-sm border border-teal-300 flex flex-col gap-3 cursor-pointer min-w-0 hover:shadow-md transition-shadow"
      onClick={handleCardClick}
    >

      <div className="flex justify-between items-start mb-1 gap-3">
        <h3
          className="font-bold text-gray-900 break-words whitespace-normal leading-tight flex-1 min-w-0"
          style={{ minHeight: "40px", maxWidth: "300px" }}
        >
          {title}
        </h3>
      </div>

      <div className="flex justify-between items-center mb-1 gap-2">
        <p className="text-xs text-teal-600 font-semibold">
          <span
            className="username-click text-teal-700 underline cursor-pointer hover:text-teal-900"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/user/${author}`);
            }}
          >
            @{author}
          </span>{" "}
          {!isApproved && (
            <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-md whitespace-nowrap">
              #{department}
            </span>
          )}
        </p>

        {status !== "pending" && (
          <CopyPromptButton
            promptId={prompt.id ?? prompt.raw?.id}
            promptText={promptText}
            initialCount={copyCount}
            className="scale-90 origin-right"
            onCopy={handleCopy}
          />
        )}
      </div>

      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <p
          className="text-sm font-semibold text-gray-800 font-sans leading-relaxed whitespace-pre-wrap break-words overflow-y-auto"
          style={{ minHeight: "50px", maxHeight: "50px", scrollbarWidth: "thin" }}
        >
          {promptText || "No Prompt available"}
        </p>
      </div>

      <div className="flex flex-col gap-3 pt-3">
        {isApproved ? (
          <>
            <div className="flex justify-between items-center px-1">
              <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-md">
                #{department}
              </span>

              <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-md text-xs font-semibold">
                Approved
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                safeOnHistory(prompt.id);
              }}
              className="flex-1 w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-600 bg-gray-50 py-2 rounded-full hover:bg-white hover:text-teal-600 transition-colors"
            >
              View Edit History
            </button>
          </>
        ) : (
          <>
            <div className="flex gap-3">
              <button
                onClick={handleApproveClick}
                disabled={loadingApprove}
                className={`flex-1 cursor-pointer bg-teal-600 text-white py-2 rounded-lg text-sm font-medium ${
                  loadingApprove ? "opacity-70 cursor-not-allowed" : "hover:bg-teal-700"
                }`}
              >
                {loadingApprove ? (
                  <div className="flex justify-center">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  "Approve"
                )}
              </button>

              <button
                onClick={handleRejectClick}
                disabled={loadingReject}
                className={`flex-1 bg-white border border-red-200 text-red-500 py-2 rounded-lg text-sm font-medium ${
                  loadingReject ? "opacity-70 cursor-not-allowed" : "hover:bg-red-50"
                }`}
              >
                {loadingReject ? (
                  <div className="flex justify-center">
                    <div className="h-4 w-4  cursor-pointer border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  "Reject"
                )}
              </button>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                safeOnHistory(prompt.id);
              }}
              className="flex-1 w-full  cursor-pointer flex items-center justify-center gap-2 text-sm font-medium text-gray-600 bg-gray-50 py-2 rounded-full hover:bg-white hover:text-teal-600 transition-colors"
            >
              View Edit History
            </button>
          </>
        )}
      </div>
    </div>
  );
}
