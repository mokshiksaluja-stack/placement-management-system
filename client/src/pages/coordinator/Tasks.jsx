import { useEffect, useState } from "react";
import Table from "../../components/Table";
import coordinatorApi from "../../services/coordinatorApi";

const statusOptions = ["Pending", "In Progress", "Completed", "Cancelled"];

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [message, setMessage] = useState("");

  const fetchTasks = async () => {
    try {
      const response = await coordinatorApi.get("/tasks");
      const formattedData = response.data.map((task) => ({
        ...task,
        deadline: new Date(task.deadline).toLocaleDateString(),
      }));
      setTasks(formattedData);
    } catch (error) {
      console.error("Error loading tasks:", error.message);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusUpdate = async (taskId, status) => {
    try {
      await coordinatorApi.patch(`/tasks/${taskId}`, { status });
      setMessage("Task status updated.");
      fetchTasks();
    } catch (error) {
      setMessage("Failed to update task status.");
      console.error("Error updating task:", error.message);
    }
  };

  const columns = [
    { key: "title", label: "Task Title" },
    { key: "company", label: "Company" },
    { key: "deadline", label: "Deadline" },
    { key: "status", label: "Status" },
  ];

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = `${task.title} ${task.company}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" ? true : task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <section>
      <div className="section-header">
        <h2>Task Management</h2>
        <p>View admin-assigned tasks and update your task progress.</p>
      </div>
      <div className="panel toolbar split">
        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search by task title or company..."
        />
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="All">All Statuses</option>
          {statusOptions.map((statusOption) => (
            <option key={statusOption} value={statusOption}>
              {statusOption}
            </option>
          ))}
        </select>
      </div>
      <Table
        columns={columns}
        data={filteredTasks}
        emptyMessage="No tasks assigned yet. Admin-created tasks will appear here."
        rowActions={(task) => (
          <select
            value={task.status}
            onChange={(event) => handleStatusUpdate(task._id, event.target.value)}
          >
            {statusOptions.map((statusOption) => (
              <option key={statusOption} value={statusOption}>
                {statusOption}
              </option>
            ))}
          </select>
        )}
      />
      {message ? <p className="status-message">{message}</p> : null}
    </section>
  );
}

export default Tasks;
