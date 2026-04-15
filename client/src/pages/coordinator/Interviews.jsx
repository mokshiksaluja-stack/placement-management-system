import { useEffect, useState } from "react";
import Table from "../../components/Table";
import coordinatorApi from "../../services/coordinatorApi";

const initialForm = {
  company: "",
  role: "",
  roundType: "",
  date: "",
  time: "",
  room: "",
};

function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [selectedInterviewId, setSelectedInterviewId] = useState("");
  const [message, setMessage] = useState("");

  const fetchInterviews = async () => {
    try {
      const response = await coordinatorApi.get("/interviews");
      const formattedData = response.data.map((interview) => {
        const isoDate = new Date(interview.date).toISOString().split("T")[0];
        return {
          ...interview,
          dateRaw: isoDate,
          date: new Date(interview.date).toLocaleDateString(),
        };
      });
      setInterviews(formattedData);
    } catch (error) {
      console.error("Error loading interviews:", error.message);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await coordinatorApi.post("/interviews", formData);
      setFormData(initialForm);
      setMessage("Interview scheduled successfully.");
      fetchInterviews();
    } catch (error) {
      setMessage("Failed to schedule interview.");
      console.error("Error creating interview:", error.message);
    }
  };

  const handleMarkUpdated = async () => {
    const selectedInterview = interviews.find((interview) => interview._id === selectedInterviewId);
    if (!selectedInterview) {
      setMessage("Select an interview to update room.");
      return;
    }

    const nextRoom = prompt("Enter updated room:", selectedInterview.room);
    if (!nextRoom) {
      return;
    }

    try {
      await coordinatorApi.patch(`/interviews/${selectedInterview._id}`, {
        company: selectedInterview.company,
        role: selectedInterview.role,
        roundType: selectedInterview.roundType,
        date: selectedInterview.dateRaw,
        time: selectedInterview.time,
        room: nextRoom,
      });
      setMessage("Interview room updated.");
      fetchInterviews();
    } catch (error) {
      setMessage("Failed to update interview.");
      console.error("Error updating interview:", error.message);
    }
  };

  const columns = [
    { key: "company", label: "Company" },
    { key: "role", label: "Role" },
    { key: "roundType", label: "Round Type" },
    { key: "date", label: "Date" },
    { key: "time", label: "Time" },
    { key: "room", label: "Room" },
  ];

  return (
    <section>
      <div className="section-header">
        <h2>Interview Management</h2>
        <p>Schedule rounds and keep venue planning updated for all drives.</p>
      </div>

      <form className="panel simple-form" onSubmit={handleSubmit}>
        <input name="company" placeholder="Company" value={formData.company} onChange={handleChange} required />
        <input name="role" placeholder="Role" value={formData.role} onChange={handleChange} required />
        <input
          name="roundType"
          placeholder="Round Type"
          value={formData.roundType}
          onChange={handleChange}
          required
        />
        <input name="date" type="date" value={formData.date} onChange={handleChange} required />
        <input name="time" placeholder="Time (e.g. 11:00 AM)" value={formData.time} onChange={handleChange} required />
        <input name="room" placeholder="Room" value={formData.room} onChange={handleChange} required />
        <button type="submit" className="btn-primary">Schedule Interview</button>
      </form>

      <div className="panel toolbar split">
        <select value={selectedInterviewId} onChange={(event) => setSelectedInterviewId(event.target.value)}>
          <option value="">Select interview to update room</option>
          {interviews.map((interview) => (
            <option key={interview._id} value={interview._id}>
              {interview.company} - {interview.roundType} ({interview.date})
            </option>
          ))}
        </select>
        <button type="button" className="btn-secondary" onClick={handleMarkUpdated}>
          Update Selected Room
        </button>
      </div>

      <Table
        columns={columns}
        data={interviews}
        emptyMessage="No interviews found in database. Schedule your first interview."
      />
      {message ? <p className="status-message">{message}</p> : null}
    </section>
  );
}

export default Interviews;
