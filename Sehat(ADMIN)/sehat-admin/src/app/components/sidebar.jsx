"use client";
import React from "react";
import {
  IoIosPersonAdd,
  IoIosSettings,
  IoMdSearch,
  IoIosStats,
} from "react-icons/io";
import { FaUserDoctor } from "react-icons/fa6";
import { MdReportProblem } from "react-icons/md";
import s from "../dashboard.module.css";
import { useRouter } from "next/navigation";
export default function sidebar() {
  const router = useRouter();

  function handleSideButtonClick(e) {
    router.push("/dashboard/" + e);
  }

  return (
    <>
      <input id="toggleSidebar" type="checkbox" className={s.toggleInput} defaultChecked />
      <label htmlFor="toggleSidebar" className={s.toggleHandle}>
        <span className={s.handleIcon}>≡</span>
      </label>

      <div className={s.sidebarContainer}>
        <aside className={s.sidebarBody}>
          <div className="row">
            <div className={`${s.sidebarButton} col-lg-12`}>
              <button
                onClick={() => {
                  handleSideButtonClick("add-doc");
                }}
              >
                <IoIosPersonAdd className={s.icons} />
                Add new Doctor
              </button>
            </div>
            <div className={`${s.sidebarButton} col-lg-12`}>
              <button
                onClick={() => {
                  handleSideButtonClick("stats");
                }}
              >
                <IoIosStats className={s.icons} />
                View Stats
              </button>
            </div>
            <div className={`${s.sidebarButton} col-lg-12`}>
              <button
                onClick={() => {
                  handleSideButtonClick("issues");
                }}
              >
                <MdReportProblem className={s.icons} />
                Issues
              </button>
            </div>
            <div className={`${s.sidebarButton} col-lg-12`}>
              <button
                onClick={() => {
                  handleSideButtonClick("search");
                }}
              >
                <IoMdSearch className={s.icons} />
                Search a Patient
              </button>
            </div>
            <div className={`${s.sidebarButton} col-lg-12`}>
              <button
                onClick={() => {
                  handleSideButtonClick("view-docs");
                }}
              >
                <FaUserDoctor className={s.icons} />
                View Doctors
              </button>
            </div>
            <div className={`${s.sidebarButton} ${s.logout} col-lg-12`}>
              <button
                onClick={() => {
                  handleSideButtonClick("logout");
                }}
              >
                <IoIosSettings className={s.icons} />
                Settings
              </button>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
