"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Briefcase, Wallet, LogOut, Menu, X, User } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid var(--border-color)", borderTopColor: "var(--primary)", animation: "spin 1s linear infinite" }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const menuItems = [
    { name: "Dashboard", href: "/", icon: <LayoutDashboard size={20} /> },
    { name: "Kerjaan", href: "/kerjaan", icon: <Briefcase size={20} /> },
    { name: "Keuangan", href: "/keuangan", icon: <Wallet size={20} /> },
  ];

  return (
    <div className="layout">
      {/* Mobile Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", borderBottom: "1px solid var(--border-color)", backgroundColor: "var(--bg-card)" }} className="md-hidden">
        <div style={{ fontWeight: "800", fontSize: "1.25rem", color: "var(--primary)", letterSpacing: "-0.02em" }}>Tracking Rekap</div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="btn btn-outline" style={{ padding: "0.5rem" }}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div style={{ padding: "2rem 1.5rem 1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ backgroundColor: "var(--primary)", color: "white", padding: "0.5rem", borderRadius: "var(--radius)" }}>
              <Briefcase size={24} />
            </div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: "800", color: "var(--text-main)", letterSpacing: "-0.03em" }}>
              Tracking<span style={{ color: "var(--primary)" }}>Rekap</span>
            </h2>
          </div>
        </div>
        
        <nav style={{ flex: 1, padding: "1.5rem 1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link href={item.href} key={item.name} className={`nav-item ${isActive ? "active" : ""}`} onClick={() => setMobileOpen(false)}>
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "1rem", borderTop: "1px solid var(--border-color)", marginTop: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", marginBottom: "0.5rem", borderRadius: "var(--radius)", backgroundColor: "var(--bg-color)" }}>
            <div style={{ backgroundColor: "var(--primary)", color: "white", borderRadius: "50%", padding: "0.4rem" }}>
              <User size={18} />
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <p style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--text-main)", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                {session?.user?.name || "Admin"}
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Administrator</p>
            </div>
          </div>
          
          <button 
            onClick={() => signOut()} 
            className="nav-item" 
            style={{ width: "100%", justifyContent: "flex-start", color: "var(--danger)" }}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
