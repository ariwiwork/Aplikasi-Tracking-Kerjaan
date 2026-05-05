"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Username atau password salah");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div className="card animate-fade-in" style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            justifyContent: "center", 
            width: "3rem", 
            height: "3rem", 
            borderRadius: "50%", 
            backgroundColor: "var(--primary)", 
            color: "white",
            marginBottom: "1rem" 
          }}>
            <Lock size={24} />
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "700" }}>Aplikasi Tracking Rekap</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.5rem" }}>Login untuk melanjutkan</p>
        </div>

        {error && (
          <div style={{ 
            padding: "0.75rem", 
            backgroundColor: "rgba(239, 68, 68, 0.1)", 
            color: "var(--danger)", 
            borderRadius: "var(--radius)", 
            fontSize: "0.875rem",
            marginBottom: "1rem",
            textAlign: "center"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label className="label">Username</label>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
                <User size={18} />
              </div>
              <input
                type="text"
                className="input"
                style={{ paddingLeft: "2.75rem" }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Password</label>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
                <Lock size={18} />
              </div>
              <input
                type="password"
                className="input"
                style={{ paddingLeft: "2.75rem" }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: "100%", marginTop: "0.5rem", padding: "0.875rem" }}
          >
            {loading ? "Loading..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
