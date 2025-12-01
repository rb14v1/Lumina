import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 
import logo from "../assets/logo.png";
import v1Logo from "../assets/v1_logo.png";
import profileIcon from "../assets/profileIcon.png";
import { LogOut } from "lucide-react";

export default function Header() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleLogoClick = () => {
    if (user?.isAdmin) navigate("/dashboard");
    else navigate("/home");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, 
[]);
 
return (
  <header className="bg-white shadow-sm sticky top-0 z-50 w-full border-b border-gray-100">
    <div className="w-full px-6 py-4 flex items-center justify-between">
      <div
        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={handleLogoClick}
      >
        <img src={v1Logo} alt="V1 Logo" className="h-8 w-auto object-contain" />
        <div className="h-8 w-px bg-gray-300 mx-1"></div>
        <img src={logo} alt="Lumina Logo" className="h-12 w-auto object-contain" />
      </div>
      {user && (
        <div className="relative flex flex-col items-center" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-haspopup="true"
            aria-expanded={menuOpen}
            className="rounded-full focus:outline-none"
          >
            <img
              src={profileIcon}
              alt="Profile"
              className="h-10 w-10 rounded-full cursor-pointer border border-teal-400 shadow-sm hover:shadow-md hover:border-teal-500 transition"
            />
          </button>
          <p className="text-black text-sm font-semibold mt-1">
            {user.username || user.name || user.email}
          </p>
          {menuOpen && (
            <div className="absolute right-0 mt-14 w-44 bg-white rounded-xl shadow-lg border border-teal-200 z-40">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 font-medium"
              >
                <div className="flex items-center gap-2 cursor-pointer">
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </div>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  </header>
);
}


