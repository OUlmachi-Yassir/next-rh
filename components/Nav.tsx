"use client";
import { useEffect, useState } from "react";
import Link from "next/link"; // Link for navigating between pages

const Nav = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token); // Set to true if token exists, false otherwise
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    window.location.href = "/login"; // Redirect to login page
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/" className="text-white text-xl font-bold">
            MyApp
          </Link>
        </div>

        <ul className="flex space-x-4 text-white">
          <li>
            <Link href="/" className="hover:text-gray-400">
              Home
            </Link>
          </li>
          <li>
            <Link href="/about" className="hover:text-gray-400">
              About
            </Link>
          </li>
          {/* Only show these links if the user is logged in */}
          {isLoggedIn ? (
            <>
              <li>
                <Link href="/dashboard" className="hover:text-gray-400">
                  Dashboard
                </Link>
              </li>
              <li>
                <button onClick={handleLogout} className="hover:text-gray-400">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link href="/login" className="hover:text-gray-400">
                Login
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Nav;
