import { useEffect, useState } from "react";
import coordinatorApi from "../../services/coordinatorApi";

function Settings() {
  const [settings, setSettings] = useState({
    sessionName: "",
    notificationEmail: "",
    timezone: "",
    darkSidebar: false,
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await coordinatorApi.get("/settings");
        if (response.data) {
          setSettings(response.data);
        }
      } catch (error) {
        console.error("Error loading settings:", error.message);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (event) => {
    const { name, type, checked, value } = event.target;
    setSettings((previousSettings) => ({
      ...previousSettings,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await coordinatorApi.put("/settings", settings);
      setMessage("Settings saved successfully.");
    } catch (error) {
      setMessage("Failed to save settings.");
    }
  };

  const handleReset = async () => {
    const resetValue = {
      sessionName: "",
      notificationEmail: "",
      timezone: "",
      darkSidebar: false,
    };
    setSettings(resetValue);
    try {
      await coordinatorApi.put("/settings", resetValue);
      setMessage("Settings reset successfully.");
    } catch (error) {
      setMessage("Failed to reset settings.");
    }
  };

  return (
    <section>
      <div className="section-header">
        <h2>Settings</h2>
        <p>Configure session preferences and communication options.</p>
      </div>

      <form className="panel form-panel" onSubmit={handleSubmit}>
        <div className="simple-form two-column">
          <input
            name="sessionName"
            placeholder="Placement Session Name"
            value={settings.sessionName}
            onChange={handleChange}
            required
          />
          <input
            name="notificationEmail"
            type="email"
            placeholder="Notification Email"
            value={settings.notificationEmail}
            onChange={handleChange}
            required
          />
          <input name="timezone" placeholder="Timezone" value={settings.timezone} onChange={handleChange} required />
          <label className="checkbox-field">
            <input type="checkbox" name="darkSidebar" checked={settings.darkSidebar} onChange={handleChange} />
            Use dark sidebar theme
          </label>
        </div>
        <div className="action-row">
          <button type="submit" className="btn-primary">
            Save Settings
          </button>
          <button type="button" className="btn-secondary" onClick={handleReset}>
            Reset
          </button>
        </div>
      </form>

      {message ? <p className="status-message">{message}</p> : null}
    </section>
  );
}

export default Settings;
