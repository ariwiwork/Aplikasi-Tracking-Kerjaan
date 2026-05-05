"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, Briefcase, Wallet, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

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
        Loading...
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", borderBottom: "1px solid var(--border-color)", backgroundColor: "var(--bg-card)" }} className="md:hidden">
        <div style={{ fontWeight: "bold", fontSize: "1.25rem", color: "var(--primary)" }}>Tracking Rekap</div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="btn btn-outline" style={{ padding: "0.5rem" }}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'block' : 'hidden md:flex'}`} style={{ 
        position: mobileOpen ? "fixed" : "relative", 
        zIndex: 40, 
        height: "100vh",
        display: mobileOpen ? "flex" : undefined
      }}>
        <div style={{ padding: "2rem 1.5rem", borderBottom: "1px solid var(--border-color)" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--primary)", letterSpacing: "-0.05em" }}>
            Tracking Rekap
          </h2>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            Welcome, {session?.user?.name || "Admin"}
          </p>
        </div>
        
        <nav style={{ flex: 1, padding: "1.5rem 0", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
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

        <div style={{ padding: "1.5rem" }}>
          <button 
            onClick={() => signOut()} 
            className="btn btn-outline" 
            style={{ width: "100%", justifyContent: "flex-start", color: "var(--danger)", borderColor: "transparent" }}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
