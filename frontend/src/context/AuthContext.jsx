// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("accessToken")
  );
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);

  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [pendingPromptId, setPendingPromptId] = useState(null);
  const [pendingPromptTitle, setPendingPromptTitle] = useState("");

  const checkFeedback = async () => {
    if (!isLoggedIn) return;

    console.log("🔥 Checking for pending feedback...");
    try {
      const res = await api.get("/feedback/pending/");

      console.log("✅ API RESPONSE:", res);

      if (res?.data?.pending) {
        setPendingPromptId(res.data.prompt_id);
        setPendingPromptTitle(res.data.prompt_title || "");
        setShowFeedbackPopup(true);
      }
    } catch (err) {
      console.error("❌ Pending feedback check failed:", err);
    }
  };

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setUser(null);
      setIsLoggedIn(false);
      return;
    }

    setLoadingUser(true);

    try {
      const res = await api.get("/auth/user/");
      setUser(res.data);
      setIsLoggedIn(true);

      checkFeedback();
    } catch (err) {
      console.error("Failed to fetch current user:", err);
      if (err.response && err.response.status === 401) {
        logout();
      }
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      fetchCurrentUser();
    }
  }, []);

  useEffect(() => {
    const handleCopyEvent = () => {
      console.log("📋 Copy event received in AuthContext");
      checkFeedback();
    };

    window.addEventListener("prompt-copied", handleCopyEvent);

    return () => {
      window.removeEventListener("prompt-copied", handleCopyEvent);
    };
  }, [isLoggedIn]);

  const login = async (tokens) => {
    try {
      localStorage.setItem("accessToken", tokens.access);
      localStorage.setItem("refreshToken", tokens.refresh);

      setIsLoggedIn(true);
      await fetchCurrentUser();
    } catch (err) {
      console.error("Login/Fetch user failed:", err);
      logout();
    }
  };

  const loginWithMicrosoft = async (azureAccessToken) => {
    try {
      const res = await api.post("/sso-login/", {
        access_token: azureAccessToken,
      });

      localStorage.setItem("accessToken", res.data.token);

      setIsLoggedIn(true);
      await fetchCurrentUser();
      return true;
    } catch (err) {
      console.error("SSO Login failed:", err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    setIsLoggedIn(false);
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        loadingUser,
        isAdmin: !!(user && user.is_staff),

        login,
        loginWithMicrosoft,
        logout,
        fetchCurrentUser,

        showFeedbackPopup,
        setShowFeedbackPopup,
        pendingPromptId,
        pendingPromptTitle,
        checkFeedback,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
