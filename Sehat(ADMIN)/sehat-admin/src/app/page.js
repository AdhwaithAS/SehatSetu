import s from "./dashboard.module.css";
import SideBar from "./components/sidebar";

export default function Home() {
  return (
    <div className={s.dashboardRoot}>
      <main className={s.mainArea}>
        <SideBar />
        <section className={s.content}>
          <div className="container">
            <div className={s.cardsGrid}>
              <div className={`appCard ${s.kpiCard}`}>
                <div className={s.kpiLabel}>Total Citizens</div>
                <div className={s.kpiValue}>1,234,567</div>
              </div>
              <div className={`appCard ${s.kpiCard}`}>
                <div className={s.kpiLabel}>Active Programs</div>
                <div className={s.kpiValue}>128</div>
              </div>
              <div className={`appCard ${s.kpiCard}`}>
                <div className={s.kpiLabel}>Monthly Budget</div>
                <div className={s.kpiValue}>₹ 24.8 Cr</div>
              </div>
              <div className={`appCard ${s.kpiCard}`}>
                <div className={s.kpiLabel}>Open Tickets</div>
                <div className={s.kpiValue}>342</div>
              </div>
            </div>

            <div className={s.panelRow}>
              <div className={`appCard ${s.panel}`}>
                Analytics Chart (placeholder)
              </div>
              <div className={`appCard ${s.panel}`}>
                Recent Activity (placeholder)
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
