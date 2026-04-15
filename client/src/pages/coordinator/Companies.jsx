import { useEffect, useState } from "react";
import Table from "../../components/Table";
import coordinatorApi from "../../services/coordinatorApi";

function Companies() {
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    companyName: "",
    role: "",
    interviewDate: "",
    status: "Scheduled",
  });

  const fetchCompanies = async () => {
    try {
      const response = await coordinatorApi.get("/opportunities");
      const formattedData = response.data.map((company) => ({
        ...company,
        interviewDate: new Date(company.interviewDate).toLocaleDateString(),
      }));
      setCompanies(formattedData);
    } catch (error) {
      console.error("Error loading companies:", error.message);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleChange = (event) => {
    setFormData((previousData) => ({
      ...previousData,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await coordinatorApi.post("/opportunities", formData);
      setMessage("Company opportunity added.");
      setFormData({
        companyName: "",
        role: "",
        interviewDate: "",
        status: "Scheduled",
      });
      fetchCompanies();
    } catch (error) {
      setMessage("Failed to add company opportunity.");
    }
  };

  const columns = [
    { key: "companyName", label: "Company" },
    { key: "role", label: "Role" },
    { key: "interviewDate", label: "Interview Date" },
    { key: "status", label: "Status" },
  ];

  const filteredCompanies = companies.filter((company) =>
    `${company.companyName} ${company.role} ${company.status}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section>
      <div className="section-header">
        <h2>Assigned Companies</h2>
        <p>Track companies, roles, and interview timelines in one place.</p>
      </div>
      <div className="panel toolbar">
        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search by company, role, status..."
        />
      </div>
      <form className="panel simple-form" onSubmit={handleSubmit}>
        <input name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Company Name" required />
        <input name="role" value={formData.role} onChange={handleChange} placeholder="Role" required />
        <input name="interviewDate" type="date" value={formData.interviewDate} onChange={handleChange} required />
        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="Scheduled">Scheduled</option>
          <option value="Open">Open</option>
          <option value="Closed">Closed</option>
        </select>
        <button className="btn-primary" type="submit">
          Add Opportunity
        </button>
      </form>
      <Table
        columns={columns}
        data={filteredCompanies}
        emptyMessage="No companies found in database. Add your first opportunity using the form above."
      />
      {message ? <p className="status-message">{message}</p> : null}
    </section>
  );
}

export default Companies;
