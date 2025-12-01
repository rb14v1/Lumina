import React, { useState, useEffect } from "react";
import { submitPromptFeedback } from "../api/promptFeedback.api";

// Simple Star Icon Component
const StarIcon = ({ filled, onClick, onMouseEnter, onMouseLeave }) => (
  <svg
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    className={`w-10 h-10 cursor-pointer transition-colors duration-200 ${
      filled ? "text-yellow-400 drop-shadow-sm" : "text-gray-300 hover:text-yellow-200"
    }`}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

export default function CopyFeedbackPopup({ promptId, promptTitle, onClose }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = async () => {
    // If they close without rating, we mark as skipped
    try {
      await submitPromptFeedback(promptId, "skipped", 0, "");
    } catch (err) {
      console.error("Skip error:", err);
    } finally {
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please select a star rating");
      return;
    }

    setSubmitting(true);

    try {
      // Send 'submitted' status along with the rating
      await submitPromptFeedback(promptId, "submitted", rating, feedback);
      onClose();
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]
      transition-opacity duration-300
      ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
    >
      <div
        className={`relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl
        transform transition-all duration-300
        ${visible ? "translate-y-0 scale-100" : "translate-y-10 scale-95"}`}
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-xl cursor-pointer"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold text-center text-gray-800 mb-1">
          How was the result?
        </h2>

        <p className="text-sm text-gray-500 text-center mb-6 px-4 truncate">
          {promptTitle || "Rate this prompt"}
        </p>

        {/* Star Rating Section */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={star}
              filled={star <= (hoverRating || rating)}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            />
          ))}
        </div>

        <textarea
          rows="3"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Any additional feedback? (Optional)"
          className="w-full border border-gray-200 bg-gray-50 rounded-lg p-3 mb-5 text-sm
             focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all resize-none"
        />

        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className={`w-full py-2.5 rounded-full font-medium transition-all
              ${rating > 0 
                ? "bg-teal-600 text-white hover:bg-teal-700 cursor-pointer shadow-md hover:shadow-lg transform hover:-translate-y-0.5" 
                : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
          >
            {submitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </div>
      </div>
    </div>
  );
}