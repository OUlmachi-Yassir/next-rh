"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; 

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isClient, setIsClient] = useState(false);  
  const router = useRouter();  

  useEffect(() => {
    setIsClient(true);

    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = decodeToken(token); 
      if (decodedToken && decodedToken.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/offres");
      }
    }
  }, [router]);

  const decodeToken = (token: string) => {
    try {
      const payload = token.split('.')[1];  
      const decoded = atob(payload);       
      return JSON.parse(decoded);          
    } catch {
      return null;  
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();  

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token); 

      const token = localStorage.getItem("token");
      if (token) {
        const decodedToken = decodeToken(token); 
        if (decodedToken && decodedToken.role === "admin") {
          router.push("/admin");  
        } else if (decodedToken) {
          router.push("/offres"); 
        } else {
          alert("Invalid token format or role not found.");
        }
      }
    } else {
      alert(data.message || "Login failed");
    }
  }

  if (!isClient) return null;

  return (
    <div className="w-[450px] rounded-2xl bg-slate-900 mx-auto mt-16 p-8">
      <p className="text-center text-3xl text-gray-300 mb-4">Login</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="bg-slate-900 w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 focus:ring-offset-gray-800"
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="bg-slate-900 w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 focus:ring-offset-gray-800"
        />
        <button
          type="submit"
          className="inline-block cursor-pointer rounded-md bg-gray-700 px-4 py-3.5 text-center text-sm font-semibold uppercase text-white transition duration-200 ease-in-out hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-700 focus-visible:ring-offset-2 active:scale-95"
        >
          Login
        </button>
      </form>
    </div>
  );
}
