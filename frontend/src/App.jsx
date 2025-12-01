import { Routes, Route, Navigate } from "react-router-dom";
import AddPromptPage from "./pages/AddPromptPage";
import Auth from "./pages/Auth.jsx";
import { useAuth } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard.jsx";
import HomePage from "./pages/HomePage.jsx";
import UserPromptsPage from "./pages/UserPromptPage.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
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

                <Route path="/user/:username" element={<UserPromptsPage />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
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

                <Route path="/user/:username" element={<UserPromptsPage />} />

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

      <ToastContainer position="top-right" hideProgressBar closeOnClick />

      {showFeedbackPopup && isLoggedIn && pendingPromptId && (
        <CopyFeedbackPopup
          promptId={pendingPromptId}
          promptTitle={pendingPromptTitle}
          onClose={() => {
            setShowFeedbackPopup(false);
          }}
        />
      )}
    </div>
  );
}

export default App;
