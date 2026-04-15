import { useEffect, useState } from "react";
import coordinatorApi from "../../services/coordinatorApi";

function Profile() {
  const [profile, setProfile] = useState({
    fullName: "",
    designation: "",
    email: "",
    phone: "",
    department: "",
    profileImageUrl: "",
  });
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const userInitial = (profile.fullName || "U").trim().charAt(0).toUpperCase();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await coordinatorApi.get("/profile");
        if (response.data) {
          setProfile(response.data);
        }
      } catch (error) {
        console.error("Error loading profile:", error.message);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (event) => {
    setProfile((previousProfile) => ({
      ...previousProfile,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await coordinatorApi.put("/profile", profile);
      setMessage("Profile updated successfully.");
      setIsEditing(false);
    } catch (error) {
      setMessage("Failed to update profile.");
    }
  };

  const handleImageSelection = (event) => {
    setSelectedImage(event.target.files?.[0] || null);
  };

  const handleImageUpload = async () => {
    if (!selectedImage) {
      setMessage("Please select an image first.");
      return;
    }

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedImage);

      const uploadResponse = await coordinatorApi.post("/profile/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProfile((previousProfile) => ({
        ...previousProfile,
        profileImageUrl: uploadResponse.data.url,
      }));
      setSelectedImage(null);
      setMessage("Profile image uploaded. Click Save Profile to persist.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to upload profile image.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <section>
      <div className="section-header">
        <h2>Profile</h2>
        <p>View your account details and update them when needed.</p>
      </div>

      {!isEditing ? (
        <div className="panel profile-view">
          {profile.profileImageUrl ? (
            <img src={profile.profileImageUrl} alt="Profile" className="profile-image" />
          ) : (
            <div className="profile-image profile-image-placeholder">{userInitial}</div>
          )}
          <p><strong>Full Name:</strong> {profile.fullName || "-"}</p>
          <p><strong>Designation:</strong> {profile.designation || "-"}</p>
          <p><strong>Email:</strong> {profile.email || "-"}</p>
          <p><strong>Phone:</strong> {profile.phone || "-"}</p>
          <p><strong>Department:</strong> {profile.department || "-"}</p>
          <button type="button" className="btn-primary" onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        </div>
      ) : (
        <form className="panel form-panel" onSubmit={handleSubmit}>
          {profile.profileImageUrl ? (
            <img src={profile.profileImageUrl} alt="Profile" className="profile-image" />
          ) : (
            <div className="profile-image profile-image-placeholder">{userInitial}</div>
          )}
          <div className="action-row">
            <input type="file" accept="image/*" onChange={handleImageSelection} />
            <button type="button" className="btn-secondary" onClick={handleImageUpload} disabled={isUploadingImage}>
              {isUploadingImage ? "Uploading..." : "Upload Image"}
            </button>
          </div>
          <div className="simple-form two-column">
            <input name="fullName" placeholder="Full Name" value={profile.fullName} onChange={handleChange} required />
            <input name="designation" placeholder="Designation" value={profile.designation} onChange={handleChange} required />
            <input name="email" type="email" placeholder="Email" value={profile.email} onChange={handleChange} required />
            <input name="phone" placeholder="Phone" value={profile.phone} onChange={handleChange} required />
            <input name="department" placeholder="Department" value={profile.department} onChange={handleChange} required />
          </div>
          <div className="action-row">
            <button type="submit" className="btn-primary">
              Save Profile
            </button>
            <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {message ? <p className="status-message">{message}</p> : null}
    </section>
  );
}

export default Profile;
