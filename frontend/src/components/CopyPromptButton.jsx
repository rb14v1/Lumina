// src/components/CopyPromptButton.jsx
import React, { useState } from "react";
import { toast } from "react-toastify";
import { Copy, Check, Flame } from "lucide-react";
import api from "../api/axios";
 
const CopyPromptButton = ({
  promptId,
  promptText,
  promptTitle = "",
  initialCount = 0,
  className = "",
}) => {
 
  const [copyCount, setCopyCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
 
  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
 
    if (loading) return;
    setLoading(true);
 
    const toastId = toast(
      <span className="flex items-center gap-2">
        <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full"></span>
        Copying...
      </span>,
      {
        position: "top-right",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: false,
        closeButton: false,
      }
    );
 
    try {
      // ✅ 1. Copy text
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(promptText || "");
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = promptText || "";
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }
 
      // UI change
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
 
      // ✅ 2. Update copy count
      if (promptId) {
        try {
          const res = await api.post(`/prompts/${promptId}/copy/`);
          if (res?.data?.copy_count !== undefined) {
            setCopyCount(res.data.copy_count);
          }
        } catch (err) {
          console.error("Copy count failed:", err);
        }
      }
 
      // ✅ 3. Create feedback entry (HYBRID SYSTEM)
      if (promptId) {
        try {
          await api.post("/copy/save/", { prompt_id: promptId });
 
          setTimeout(() => {
            window.dispatchEvent(new Event("prompt-copied"));
          }, 2000);
 
        } catch (err) {
          console.error("Feedback save failed:", err);
        }
      }
 
      toast.update(toastId, {
        render: "Prompt copied!",
        type: "success",
        autoClose: 2000,
        isLoading: false,
        closeButton: true,
      });
 
    } catch (err) {
      toast.update(toastId, {
        render: "Copy failed",
        type: "error",
        autoClose: 3000,
        isLoading: false,
        closeButton: true,
      });
    } finally {
      setLoading(false);
    }
  };
 
 
  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      onClick={(e) => e.stopPropagation()}  // extra safety
    >
      {/* 🔥 Count */}
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg border border-teal-200 text-xs font-semibold shadow-sm select-none">
        <Flame className="w-3.5 h-3.5" />
        <span>{copyCount}</span>
      </div>
 
      {/* 📋 Copy Button */}
      <button
        type="button"
        onClick={handleCopy}
        disabled={loading}
        className="inline-flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-teal-700 border border-gray-200 hover:border-teal-300 rounded-lg px-3 py-1.5 bg-white hover:bg-teal-50 transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-60"
      >
        {loading ? (
          <span className="w-3.5 h-3.5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></span>
        ) : copied ? (
          <Check className="w-3.5 h-3.5 text-green-600" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
        <span>{loading ? "..." : copied ? "Copied" : "Copy"}</span>
      </button>
    </div>
  );
};
 
export default CopyPromptButton;
 
 