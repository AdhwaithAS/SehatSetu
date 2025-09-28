"use client";

import React from "react";
import { useRouter } from "next/navigation";
import styles from "./navbar.module.css";

export default function Navbar({ email = (typeof window !== "undefined" ? window.localStorage.getItem('email') : "admin@admin.in"), initials = "SW" }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      document.cookie =
        "sb-access-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/login");
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span style={{ color: "var(--accent)" }}>Sehat</span>
          <span>Admin</span>
        </div>

        <div className={styles.right}>
          <span className={styles.email}>{email}</span>
          <button
            className={styles.logoutButton}
            onClick={handleLogout}
            aria-label="Logout"
            title="Logout"
          >
            Logout
          </button>
          <button className={styles.avatarButton} aria-label="Profile">
            <span className={styles.avatarInitials}>{initials}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
