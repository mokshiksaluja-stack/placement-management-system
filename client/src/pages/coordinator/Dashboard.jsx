import { useEffect, useState } from "react";
import Card from "../../components/Card";
import coordinatorApi from "../../services/coordinatorApi";

function Dashboard() {
  const [stats, setStats] = useState({
    assignedCompanies: 0,
    pendingTasks: 0,
    interviewsToday: 0,
    completedTasks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await coordinatorApi.get("/dashboard");
        setStats(response.data);
      } catch (error) {
        console.error("Error loading dashboard stats:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const completionRate =
    stats.pendingTasks + stats.completedTasks === 0
      ? 0
      : Math.round((stats.completedTasks / (stats.pendingTasks + stats.completedTasks)) * 100);
  const hasAnyData =
    stats.assignedCompanies > 0 ||
    stats.pendingTasks > 0 ||
    stats.interviewsToday > 0 ||
    stats.completedTasks > 0;

  const activityTotal =
    stats.assignedCompanies + stats.pendingTasks + stats.interviewsToday + stats.completedTasks || 1;
  const tasksPendingPercent = Math.round((stats.pendingTasks / activityTotal) * 100);
  const tasksCompletePercent = Math.round((stats.completedTasks / activityTotal) * 100);

  return (
    <section>
      <div className="section-header">
        <h2>Dashboard</h2>
        <p>Live summary of coordinator activities and placement readiness.</p>
      </div>
      <div className="cards-grid">
        <Card title="Assigned Companies" value={stats.assignedCompanies} />
        <Card title="Pending Tasks" value={stats.pendingTasks} />
        <Card title="Interviews Today" value={stats.interviewsToday} />
        <Card title="Completed Tasks" value={stats.completedTasks} />
      </div>
      {loading ? <div className="panel">Loading analytics...</div> : null}
      {!loading && !hasAnyData ? (
        <div className="panel onboarding-panel">
          <h3>First-Time Setup</h3>
          <p>No coordinator records found in database yet. Start by adding:</p>
          <ol>
            <li>At least one company opportunity</li>
            <li>Coordinator tasks</li>
            <li>Interview schedules and results</li>
          </ol>
        </div>
      ) : null}

      {!loading && hasAnyData ? (
        <div className="analytics-grid">
          <div className="panel">
            <h3>Task Completion Donut</h3>
            <div
              className="donut-chart"
              style={{
                background: `conic-gradient(#22c55e 0% ${completionRate}%, #e2e8f0 ${completionRate}% 100%)`,
              }}
            >
              <span>{completionRate}%</span>
            </div>
          </div>
          <div className="panel">
            <h3>Task Mix (Database)</h3>
            <div className="mini-bars">
              <div>
                <label>Pending Tasks</label>
                <div className="bar-track">
                  <div className="bar-fill amber" style={{ width: `${tasksPendingPercent}%` }} />
                </div>
                <small>{tasksPendingPercent}%</small>
              </div>
              <div>
                <label>Completed Tasks</label>
                <div className="bar-track">
                  <div className="bar-fill green" style={{ width: `${tasksCompletePercent}%` }} />
                </div>
                <small>{tasksCompletePercent}%</small>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default Dashboard;
