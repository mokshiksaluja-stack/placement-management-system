import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/coordinator/Dashboard";
import Companies from "./pages/coordinator/Companies";
import Tasks from "./pages/coordinator/Tasks";
import Interviews from "./pages/coordinator/Interviews";
import Results from "./pages/coordinator/Results";
import Profile from "./pages/coordinator/Profile";
import StudentHub from "./pages/coordinator/StudentHub";
import coordinatorApi from "./services/coordinatorApi";
import authApi from "./services/authApi";
import "./App.css";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authMessage, setAuthMessage] = useState("");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
    designation: "",
    phone: "",
    department: "",
  });
  const [searchText, setSearchText] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const dateLabel = currentTime.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [majorTab, setMajorTab] = useState("coordination");

  useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timerId);
  }, []);

  useEffect(() => {
    if (location.pathname === "/coordinator/student") {
      setMajorTab("student");
    } else if (location.pathname.startsWith("/coordinator")) {
      setMajorTab("coordination");
    }
  }, [location.pathname]);

  useEffect(() => {
    const bootstrapSession = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const response = await authApi.get("/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem("authToken");
      } finally {
        setAuthLoading(false);
      }
    };

    bootstrapSession();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setNotificationCount(0);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const response = await coordinatorApi.get("/notifications");
        setNotifications(response.data.notifications || []);
        setNotificationCount(response.data.unreadCount || 0);
      } catch (error) {
        setNotificationCount(0);
      }
    };

    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 15000);
    return () => clearInterval(intervalId);
  }, [isAuthenticated]);

  const refreshNotifications = async () => {
    try {
      const response = await coordinatorApi.get("/notifications");
      setNotifications(response.data.notifications || []);
      setNotificationCount(response.data.unreadCount || 0);
    } catch (error) {
      setNotificationCount(0);
    }
  };

  const markOneAsRead = async (notificationId) => {
    try {
      await coordinatorApi.patch(`/notifications/${notificationId}/read`);
      refreshNotifications();
    } catch (error) {
      console.error("Failed to mark notification:", error.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      await coordinatorApi.patch("/notifications/read-all");
      refreshNotifications();
    } catch (error) {
      console.error("Failed to mark all notifications:", error.message);
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const value = searchText.trim().toLowerCase();

    const routeMap = {
      dashboard: "/coordinator/dashboard",
      companies: "/coordinator/companies",
      opportunities: "/coordinator/companies",
      tasks: "/coordinator/tasks",
      interviews: "/coordinator/interviews",
      results: "/coordinator/results",
      profile: "/coordinator/profile",
      student: "/coordinator/student",
    };

    if (routeMap[value]) {
      navigate(routeMap[value]);
    }
  };

  const handleAuthInput = (event) => {
    setAuthForm((previousData) => ({
      ...previousData,
      [event.target.name]: event.target.value,
    }));
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthMessage("");
    try {
      const endpoint = authMode === "login" ? "/login" : "/register";
      const payload =
        authMode === "login"
          ? { email: authForm.email, password: authForm.password }
          : authForm;

      const response = await authApi.post(endpoint, payload);
      localStorage.setItem("authToken", response.data.token);
      setUser(response.data.user);
      setIsAuthenticated(true);
      setAuthForm({
        name: "",
        email: "",
        password: "",
        designation: "",
        phone: "",
        department: "",
      });
      navigate("/coordinator/dashboard");
      setMajorTab("coordination");
    } catch (error) {
      setAuthMessage(error.response?.data?.message || "Authentication failed.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    setUser(null);
    setShowNotifications(false);
    setAuthMode("login");
    setMajorTab("coordination");
    navigate("/");
  };

  if (authLoading) {
    return <div className="auth-page"><div className="auth-card"><p>Checking session...</p></div></div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h2>{authMode === "login" ? "Login" : "Register"}</h2>
          <p>Sign in to access your coordinator dashboard.</p>
          <form className="simple-form" onSubmit={handleAuthSubmit}>
            {authMode === "register" ? (
              <>
                <input name="name" placeholder="Full Name" value={authForm.name} onChange={handleAuthInput} required />
                <input
                  name="designation"
                  placeholder="Designation"
                  value={authForm.designation}
                  onChange={handleAuthInput}
                  required
                />
                <input name="phone" placeholder="Phone" value={authForm.phone} onChange={handleAuthInput} required />
                <input
                  name="department"
                  placeholder="Department"
                  value={authForm.department}
                  onChange={handleAuthInput}
                  required
                />
              </>
            ) : null}
            <input name="email" type="email" placeholder="Email" value={authForm.email} onChange={handleAuthInput} required />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={authForm.password}
              onChange={handleAuthInput}
              required
            />
            <button type="submit" className="btn-primary">
              {authMode === "login" ? "Login" : "Create Account"}
            </button>
          </form>
          <button
            type="button"
            className="btn-secondary auth-toggle-btn"
            onClick={() => setAuthMode((previousMode) => (previousMode === "login" ? "register" : "login"))}
          >
            {authMode === "login" ? "Need an account? Register" : "Already have an account? Login"}
          </button>
          {authMessage ? <p className="status-message">{authMessage}</p> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar majorTab={majorTab} setMajorTab={setMajorTab} />
      <main className="main-content">
        <header className="top-navbar">
          <div className="topbar-left">
            <form className="top-search" onSubmit={handleSearchSubmit}>
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search module (dashboard, tasks, profile...)"
              />
            </form>
            <div>
              <h1>Campus Placement Management System</h1>
              <p>Placement Coordinator Control Panel</p>
            </div>
          </div>
          <div className="topbar-right">
            <div className="notification-wrapper">
              <button
                type="button"
                className="bell-button"
                onClick={() => setShowNotifications((previousValue) => !previousValue)}
                title="Notifications"
              >
                <span aria-hidden="true">🔔</span>
                <span className="notification-badge">{notificationCount}</span>
              </button>
              {showNotifications ? (
                <div className="notification-panel">
                  <div className="notification-header">
                    <h4>Notifications</h4>
                    <button type="button" className="link-btn" onClick={markAllAsRead}>
                      Mark all read
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="muted">No notifications in database yet.</p>
                  ) : (
                    <ul>
                      {notifications.slice(0, 8).map((notification) => (
                        <li key={notification._id} className={notification.isRead ? "read" : "unread"}>
                          <div>
                            <strong>{notification.title}</strong>
                            <p>{notification.message}</p>
                          </div>
                          {!notification.isRead ? (
                            <button type="button" className="link-btn" onClick={() => markOneAsRead(notification._id)}>
                              Read
                            </button>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}
            </div>
            <span className="date-chip">{dateLabel}</span>
            <button
              type="button"
              className="user-chip user-chip-btn"
              onClick={() => {
                setMajorTab("coordination");
                navigate("/coordinator/profile");
              }}
              title="Open profile"
            >
              {user?.name || "Coordinator Panel"}
            </button>
            <button type="button" className="btn-secondary logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>
        <Routes>
          <Route path="/" element={<Navigate to="/coordinator/dashboard" replace />} />
          <Route path="/coordinator/dashboard" element={<Dashboard />} />
          <Route path="/coordinator/companies" element={<Companies />} />
          <Route path="/coordinator/tasks" element={<Tasks />} />
          <Route path="/coordinator/interviews" element={<Interviews />} />
          <Route path="/coordinator/results" element={<Results />} />
          <Route path="/coordinator/profile" element={<Profile />} />
          <Route path="/coordinator/student" element={<StudentHub />} />
          <Route path="*" element={<Navigate to="/coordinator/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
