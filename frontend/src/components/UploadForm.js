import React, { useState } from "react";
import API from "../utils/api";
import "../styles/uploadForm.css";

export default function UploadForm({ onUploaded }) {
  const [files, setFiles] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFiles(e.target.files);
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files || files.length === 0) return setMessage("Select files to upload");
    setUploading(true);
    const fd = new FormData();
    for (const f of files) fd.append("files", f);
    try {
      await API.post("/files/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setMessage("Uploaded successfully!");
      setFiles(null);
      onUploaded();
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    }
    setUploading(false);
  };

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <label className="file-choose-box">
        {files && files.length > 0
          ? `${files.length} file(s) selected`
          : "Choose files"}
        <input type="file" multiple onChange={handleChange} />
      </label>

      {files && files.length > 0 && (
        <button className="upload-btn" type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
      )}

      {message && <div className="upload-message">{message}</div>}
    </form>
  );
}
