"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./navbar.module.css";

export default function Navbar() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.brand}>
          <Image
            src="/logo.png"
            alt="App Logo"
            width={28}
            height={28}
            className={styles.logo}
            priority
          />
          <span className={styles.appName}>SehatSetu</span>
        </Link>

        <button
          className={styles.menuButton}
          type="button"
          aria-label="Toggle navigation"
          aria-expanded="false"
          aria-controls="primary-navigation"
          onClick={(e) => {
            const btn = e.currentTarget;
            const expanded = btn.getAttribute("aria-expanded") === "true";
            btn.setAttribute("aria-expanded", (!expanded).toString());
            const nav = document.getElementById("primary-navigation");
            if (nav) nav.classList.toggle(styles.open);
          }}
        >
          <span className={styles.menuIcon} />
        </button>

        <nav id="primary-navigation" className={styles.nav}>
          <ul className={styles.navList}>
            <li><Link href="/" className={styles.navLink}>Home</Link></li>
            <li><Link href="/dashboard" className={styles.navLink}>Dashboard</Link></li>
            <li><Link href="/healthHistory" className={styles.navLink}>Health History</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}


