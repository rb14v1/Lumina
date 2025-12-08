// src/pages/Auth.jsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Footer from "../components/Footer";
//import { useMsal } from "@azure/msal-react"; 
//import { loginRequest } from "../api/authConfig"; 

import version1Logo from "../assets/version1.png";
import promptHubLogo from "../assets/lumina.png";

// ... Keep your existing UserIcon, LockIcon, MailIcon, Spinner components here ...
// (I am omitting them to keep the answer short, but keep them in your file!)
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 0 0-16 0" /></svg>
);
const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
);
const MailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
);
const Spinner = () => (
    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
);

const Auth = () => {
  // const { login, loginWithMicrosoft } = useAuth(); 
  // const { instance } = useMsal(); 
  const { login } = useAuth();
  const [state, setState] = useState("login"); 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // const handleMicrosoftLogin = async () => {
  //     setMessage("");
  //     try {
  //         const loginResponse = await instance.loginPopup(loginRequest);
  //         setLoading(true);
          
  //         await loginWithMicrosoft(loginResponse.accessToken);
  //         setMessage("✅ SSO Login successful!");
  //     } catch (error) {
  //         console.error(error);
  //         setMessage("❌ SSO Login Failed");
  //         setLoading(false);
  //     }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      if (state === "register") {
        await api.post("/register/", {
          username: formData.username,
          password: formData.password,
          email: formData.email,
        });
        setMessage("✅ Registration successful! Please log in.");
        setState("login");
        setFormData({ username: "", password: "", email: "" });
      } else {
        const response = await api.post(
          "/token/",
          new URLSearchParams({
            username: formData.username,
            password: formData.password,
          }),
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );
        login(response.data);
        setMessage("✅ Login successful!");
      }
    } catch (err) {
      console.error("API Error:", err);
      setMessage("❌ Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  const handleForgetPassword = () => {
    setMessage("");
    if (!formData.username) {
      setMessage("⚠️ Please enter your username to reset password.");
    } else {
      setMessage("🔗 Password reset link sent (simulation).");
    }
  };

  const toggleState = () => {
    setState((prev) => (prev === "login" ? "register" : "login"));
    setFormData({ username: "", password: "", email: "" });
    setMessage("");
  };

  return (
    <div className="min-h-screen pt-10 flex flex-col justify-between bg-gray-100">
      <div className="absolute top-5 left-5 lg:top-10 lg:left-10 flex gap-4 items-center z-10">
        <img src={version1Logo} alt="Version1 Logo" className="h-10 w-auto object-contain rounded" />
        <img src={promptHubLogo} alt="PromptHub Logo" className="h-10 w-auto object-contain rounded" />
      </div>

      <div className="flex flex-1 items-center justify-center p-4">
        <form
          onSubmit={handleSubmit}
          className="sm:w-[350px] w-full text-center rounded-2xl px-8 bg-white shadow-lg border border-teal-200 pb-8"
        >
          <h1 className="text-gray-900 text-3xl mt-10 font-medium">
            {state === "login" ? "Login" : "Sign Up"}
          </h1>
          <p className="text-gray-500 text-sm mt-2 mb-6">
            {state === "login" ? "Please sign in to continue" : "Create a new account"}
          </p>

          {message && (
            <div className={`mb-4 text-sm font-medium ${message.includes("✅") ? "text-green-600" : message.includes("⚠️") ? "text-yellow-600" : "text-red-600"}`}>
              {message}
            </div>
          )}

          {/* {state === "login" && (
            <>
              <button
                type="button"
                onClick={handleMicrosoftLogin}
                className="w-full h-11 rounded-full border border-teal-500 bg-white text-teal-600 hover:bg-teal-50 font-medium transition-colors mb-6 flex items-center justify-center"
              >
                Log in with Version 1 SSO
              </button>
              
              <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or log in with email</span>
                  </div>
              </div>
            </>
          )} */}

          <div className="flex items-center w-full border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2 focus-within:ring-2 focus-within:ring-teal-500 transition-all">
            <UserIcon />
            <input type="text" name="username" placeholder="Username" className="w-full h-full border-none outline-none" value={formData.username} onChange={handleChange} required />
          </div>

          {state === "register" && (
            <div className="flex items-center mt-4 w-full border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2 focus-within:ring-2 focus-within:ring-teal-500 transition-all">
              <MailIcon />
              <input type="email" name="email" placeholder="Email" className="w-full h-full border-none outline-none" value={formData.email} onChange={handleChange} required />
            </div>
          )}

          <div className="flex items-center mt-4 w-full border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2 focus-within:ring-2 focus-within:ring-teal-500 transition-all">
            <LockIcon />
            <input type="password" name="password" placeholder="Password" className="w-full h-full border-none outline-none" value={formData.password} onChange={handleChange} required />
          </div>

          {/* <div className="mt-4 text-left text-teal-500">
            <button type="button" onClick={handleForgetPassword} className="text-sm hover:underline">Forget password?</button>
          </div> */}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full h-11 rounded-full text-white bg-teal-500 cursor-pointer hover:opacity-90 transition-opacity flex justify-center items-center"
          >
            {loading ? <Spinner /> : state === "login" ? "Login" : "Sign Up"}
          </button>
          
          <p className="text-gray-500 text-sm mt-3">
            {state === "login" ? "Don't have an account?" : "Already have an account?"}
            <button type="button" onClick={toggleState} className="ml-1 text-teal-500 cursor-pointer hover:underline">Click here</button>
          </p>
        </form>
      </div>
      <Footer />
    </div>
  );
};
export default Auth;