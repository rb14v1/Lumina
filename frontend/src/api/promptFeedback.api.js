import api from "./axios";

// Updated to accept rating (1-5) instead of just status
export const submitPromptFeedback = (promptId, status, rating = 0, feedback = "") => {
  return api.post("/copy/submit/", {
    prompt_id: promptId,
    status: status, // 'submitted' or 'skipped'
    rating: rating, // 1 to 5
    feedback: feedback
  });
};

export const checkPendingFeedback = async () => {
  const res = await api.get("/copy/check/");
  return res.data;
};

export const saveCopiedPrompt = async (promptId) => {
  try {
    const res = await api.post("/copy/save/", {
      prompt_id: promptId
    });
    return res.data;
  } catch (err) {
    console.error("Error saving copied prompt:", err);
    throw err;
  }
};