import React from "react";
 
export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-4 text-center text-sm text-gray-500">
      <p>© {new Date().getFullYear()} Lumina. All rights reserved. @Version1</p>
    </footer>
  );
}