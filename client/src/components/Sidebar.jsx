import { NavLink, useNavigate } from "react-router-dom";

const coordinationLinks = [
  { to: "/coordinator/dashboard", label: "Dashboard", icon: "▣" },
  { to: "/coordinator/companies", label: "Companies", icon: "◉" },
  { to: "/coordinator/tasks", label: "Tasks", icon: "☑" },
  { to: "/coordinator/interviews", label: "Interviews", icon: "◌" },
  { to: "/coordinator/results", label: "Results", icon: "◍" },
  { to: "/coordinator/profile", label: "Profile", icon: "◔" },
];

const studentLinks = [{ to: "/coordinator/student", label: "Student Dashboard", icon: "◍" }];

function Sidebar({ majorTab, setMajorTab }) {
  const navigate = useNavigate();
  const links = majorTab === "student" ? studentLinks : coordinationLinks;

  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div className="brand-logo">P</div>
        <div>
          <p className="brand-caption">Placement Cell</p>
          <h2>Coordinator Desk</h2>
        </div>
      </div>
      <div className="major-tab-nav">
        <button
          type="button"
          className={majorTab === "coordination" ? "btn-primary" : "btn-secondary"}
          onClick={() => {
            setMajorTab("coordination");
            navigate("/coordinator/dashboard");
          }}
        >
          Coordination
        </button>
        <button
          type="button"
          className={majorTab === "student" ? "btn-primary" : "btn-secondary"}
          onClick={() => {
            setMajorTab("student");
            navigate("/coordinator/student");
          }}
        >
          Student
        </button>
      </div>
      <nav>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            <span className="nav-icon">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
