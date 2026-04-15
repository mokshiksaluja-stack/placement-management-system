import { useEffect, useState } from "react";
import coordinatorApi from "../../services/coordinatorApi";

const initialResult = {
  studentName: "",
  result: "",
  round: "",
};

function Results() {
  const [formData, setFormData] = useState(initialResult);
  const [message, setMessage] = useState("");
  const [savedResults, setSavedResults] = useState([]);

  const fetchResults = async () => {
    try {
      const response = await coordinatorApi.get("/results");
      setSavedResults(response.data);
    } catch (error) {
      console.error("Error loading results:", error.message);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await coordinatorApi.post("/results", formData);
      setMessage("Result saved successfully.");
      fetchResults();
      setFormData(initialResult);
    } catch (error) {
      setMessage("Failed to save result.");
      console.error("Error saving result:", error.message);
    }
  };

  return (
    <section>
      <div className="section-header">
        <h2>Results Update</h2>
        <p>Upload outcomes quickly and maintain a verified record of each round.</p>
      </div>
      <form className="panel simple-form" onSubmit={handleSubmit}>
        <input
          name="studentName"
          placeholder="Student Name"
          value={formData.studentName}
          onChange={handleChange}
          required
        />
        <input name="result" placeholder="Result (Selected/Rejected)" value={formData.result} onChange={handleChange} required />
        <input name="round" placeholder="Round (Technical/HR)" value={formData.round} onChange={handleChange} required />
        <button type="submit" className="btn-primary">Save Result</button>
      </form>

      {message ? <p className="status-message">{message}</p> : null}
      <div className="panel">
        <h3>Recently Saved Results</h3>
        {savedResults.length === 0 ? (
          <p className="muted">No local records yet. Submit a result to see it here.</p>
        ) : (
          <ul className="result-list">
            {savedResults.map((resultItem) => (
              <li key={resultItem._id}>
                <strong>{resultItem.studentName}</strong> - {resultItem.round} - {resultItem.result}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default Results;
