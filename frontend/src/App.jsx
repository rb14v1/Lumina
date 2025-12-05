import { Routes, Route, Navigate } from "react-router-dom";
import React, { Suspense } from "react";
import { useAuth } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
 
// Lazy loaded pages
const AddPromptPage = React.lazy(() => import("./pages/AddPromptPage"));
const Auth = React.lazy(() => import("./pages/Auth.jsx"));
const Dashboard = React.lazy(() => import("./pages/Dashboard.jsx"));
const HomePage = React.lazy(() => import("./pages/HomePage.jsx"));
const UserPromptsPage = React.lazy(() => import("./pages/UserPromptPage.jsx"));
 
// Non-lazy (small component)
import CopyFeedbackPopup from "./components/CopyFeedbackPopup";
 
function App() {
  const {
    isLoggedIn,
    isAdmin,
    loadingUser,
    showFeedbackPopup,
    pendingPromptId,
    pendingPromptTitle,
    setShowFeedbackPopup,
  } = useAuth();
 
  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading user...</div>
      </div>
    );
  }
 
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Suspense wrapper handles lazy loading fallback */}
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center text-gray-600">
            Loading...
          </div>
        }
      >
        <Routes>
          {!isLoggedIn && (
            <>
              <Route path="/login" element={<Auth />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          )}
 
          {isLoggedIn && (
            <>
              {isAdmin ? (
                <>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route index element={<Navigate to="/dashboard" replace />} />
 
                  <Route path="/add-prompt" element={<AddPromptPage />} />
                  <Route path="/prompts/add" element={<AddPromptPage />} />
                  <Route
                    path="/prompts/edit/:promptId"
                    element={<AddPromptPage />}
                  />
                  <Route
                    path="/add-prompt/:promptId"
                    element={<AddPromptPage />}
                  />
 
                  <Route
                    path="/user/:username"
                    element={<UserPromptsPage />}
                  />
 
                  <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                  />
                </>
              ) : (
                <>
                  <Route index element={<HomePage />} />
                  <Route path="/" element={<HomePage />} />
                  <Route path="/home" element={<HomePage />} />
 
                  <Route path="/add-prompt" element={<AddPromptPage />} />
                  <Route path="/prompts/add" element={<AddPromptPage />} />
                  <Route
                    path="/prompts/edit/:promptId"
                    element={<AddPromptPage />}
                  />
                  <Route
                    path="/add-prompt/:promptId"
                    element={<AddPromptPage />}
                  />
 
                  <Route
                    path="/user/:username"
                    element={<UserPromptsPage />}
                  />
 
                  <Route
                    path="/dashboard"
                    element={<Navigate to="/" replace />}
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </>
              )}
            </>
          )}
        </Routes>
      </Suspense>
 
      <ToastContainer position="top-right" hideProgressBar closeOnClick />
 
      {showFeedbackPopup && isLoggedIn && pendingPromptId && (
        <CopyFeedbackPopup
          promptId={pendingPromptId}
          promptTitle={pendingPromptTitle}
          onClose={() => setShowFeedbackPopup(false)}
        />
      )}
    </div>
  );
}
 
export default App;
 
 