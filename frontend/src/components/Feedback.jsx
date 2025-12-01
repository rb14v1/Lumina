
import React from "react";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";

export default function FeedbackButtons({ 
  onUpvote, 
  onDownvote, 
  likeCount = 0, 
  dislikeCount = 0,
  userVote = 0 
}) 
{
  const likedColor = "#00796b";
  const dislikedColor = "#e11d48";
  const neutralBorder = "#c8f0ee";

  const upvoted = userVote === 1;
  const downvoted = userVote === -1;

  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <button
          onClick={(e) => { e.stopPropagation(); onUpvote && onUpvote(); }}
          aria-pressed={upvoted}
          style={{
            backgroundColor: "white",
            border: `2px solid ${upvoted ? likedColor : neutralBorder}`,
            color: upvoted ? likedColor : "#333",
            padding: "6px 10px",
            borderRadius: 8,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <FaThumbsUp size={14} />
        </button>
        <span style={{ fontWeight: "600", minWidth:6 }}>{likeCount}</span>
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap:4 }}>
        <button
          onClick={(e) => { e.stopPropagation(); onDownvote && onDownvote(); }}
          aria-pressed={downvoted}
          style={{
            backgroundColor: "white",
            border: `2px solid ${downvoted ? dislikedColor : neutralBorder}`,
            color: downvoted ? dislikedColor : "#333",
            padding: "6px 10px",
            borderRadius: 8,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <FaThumbsDown size={14} />
        </button>
        <span style={{ fontWeight: "600", minWidth: 6 }}>{dislikeCount}</span>
      </div>

    </div>
  );
}
