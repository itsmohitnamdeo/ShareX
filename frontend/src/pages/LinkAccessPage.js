import React, { useEffect, useState, useCallback } from "react";
import API from "../utils/api";
import { useParams } from "react-router-dom";
import "../styles/LinkAccessPage.css";

export default function LinkAccessPage() {
  const { token } = useParams();
  const [fileData, setFileData] = useState(null);
  const [error, setError] = useState(null);

  const loadFile = useCallback(async () => {
    try {
      const res = await API.get(`/files/link/${token}`);
      setFileData(res.data.file);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Access denied or invalid link");
    }
  }, [token]);

  useEffect(() => {
    loadFile();
  }, [loadFile]);

  const downloadFile = async () => {
    try {
      const url = `/files/${fileData.id}/download?token=${token}`;
      const resp = await API.get(url, { responseType: "blob" });
      const blobUrl = window.URL.createObjectURL(new Blob([resp.data]));
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileData.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  if (error)
    return (
      <div className="page-container">
        <div className="error-box">{error}</div>
      </div>
    );

  if (!fileData)
    return (
      <div className="page-container">
        <div className="loading">Loading...</div>
      </div>
    );

  return (
    <div className="page-container">
      <div className="file-card">
        <h2 className="title">Shared File</h2>

        <div className="file-info">
          <p><span>Name:</span> {fileData.name}</p>
          <p><span>Size:</span> {(fileData.size / 1024).toFixed(1)} KB</p>
          <p><span>MIME:</span> {fileData.mimeType}</p>
        </div>

        <button className="download-btn" onClick={downloadFile}>
          Download File
        </button>

      </div>
    </div>
  );
}
