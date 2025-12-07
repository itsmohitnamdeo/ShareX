import React, { useEffect, useState, useCallback } from "react";
import API, { setToken } from "../utils/api";
import UploadForm from "../components/UploadForm";
import ShareModal from "../components/ShareModal";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

export default function Dashboard({ onLogout }) {
  const [files, setFiles] = useState([]);
  const [shared, setShared] = useState([]);
  const [showShare, setShowShare] = useState(null);
  const [viewFile, setViewFile] = useState(null);
  const [viewContent, setViewContent] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [user, setUser] = useState({ name: "", email: "" });
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem("token");
    setToken(null);
    onLogout();
    navigate("/login", { replace: true });
  }, [navigate, onLogout]);

  const fetchFiles = useCallback(async () => {
    try {
      const { data } = await API.get("/files");
      setFiles(data.ownerFiles);
      setShared(data.sharedFiles);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      else console.error(err);
    }
  }, [handleLogout]);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) return handleLogout();
    setToken(token);
    fetchFiles();

    API.get("/auth/me")
      .then(res => setUser(res.data))
      .catch(() => setUser({ name: "User", email: "user@example.com" }));
  }, [fetchFiles, handleLogout]);

  const download = async (fileId, token = null, name = "file") => {
    try {
      const url = token
        ? `/files/${fileId}/download?token=${token}`
        : `/files/${fileId}/download`;
      const resp = await API.get(url, { responseType: "blob" });
      const blobUrl = window.URL.createObjectURL(new Blob([resp.data]));
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleAudit = async (fileId) => {
    try {
      const { data } = await API.get(`/files/${fileId}/audit`);
      setAuditLogs(data);
      setShowAudit(true);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      await API.delete(`/files/${fileId}`);
      alert("File deleted successfully!");
      fetchFiles();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleView = async (file) => {
    setViewFile(file);
    setViewContent(null);
    setLoadingPreview(true);
    try {
      const ext = file.originalName.split(".").pop().toLowerCase();
      if (["txt","csv","json","log"].includes(ext)) {
        const resp = await API.get(`/files/${file._id}/download`, { responseType: "text" });
        setViewContent(resp.data);
      } else {
        const resp = await API.get(`/files/${file._id}/download`, { responseType: "blob" });
        const blobUrl = URL.createObjectURL(resp.data);
        setViewContent(blobUrl);
      }
    } catch (err) {
      setViewContent("Unable to preview this file.");
    }
    setLoadingPreview(false);
  };

  const renderPreview = () => {
    if (!viewFile || !viewContent) return null;
    const ext = viewFile.originalName.split(".").pop().toLowerCase();
    if (["png","jpg","jpeg","gif"].includes(ext)) return <img src={viewContent} alt={viewFile.originalName} style={{maxWidth:"100%"}} />;
    if (ext === "pdf") return <iframe src={viewContent} width="100%" height="500px" title={viewFile.originalName}></iframe>;
    if (["txt","csv","json","log"].includes(ext)) return <pre className="text-preview">{viewContent}</pre>;
    return <p>Preview not available for this file type</p>;
  };

  return (
    <div className="dashboard-container">
    <header className="dashboard-header">
      <div className="header-left">
        <div className="user-card">
          <img src="https://api.dicebear.com/6.x/bottts/svg?seed=ShareX" 
              alt="Avatar" className="user-avatar"/>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-email">{user.email}</div>
          </div>
        </div>
      </div>
      <h1 className="header-title">ShareX</h1>
      <button className="logout-btn" onClick={handleLogout}>Logout</button>
    </header>

      <UploadForm onUploaded={fetchFiles} />

      <section className="files-section">
        <h2>Your Files</h2>
        <div className="table-wrapper">
          <table className="file-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Size (KB)</th>
                <th>Uploaded</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.length === 0 && (
                <tr><td colSpan="5" style={{textAlign:"center"}}>No files uploaded yet</td></tr>
              )}
              {files.map(f => (
                <tr key={f._id}>
                  <td>{f.originalName}</td>
                  <td>{f.mimeType}</td>
                  <td>{(f.size/1024).toFixed(1)}</td>
                  <td>{new Date(f.createdAt).toLocaleString()}</td>
                  <td className="actions-cell">
                    <button className="action-btn share" onClick={() => setShowShare(f)}>Share</button>
                    <button className="action-btn download" onClick={() => download(f._id,null,f.originalName)}>Download</button>
                    <button className="action-btn audit" onClick={() => handleAudit(f._id)}>Audit</button>
                    <button className="action-btn view" onClick={() => handleView(f)}>View</button>
                    <button className="action-btn delete" onClick={() => handleDelete(f._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="files-section">
        <h2>Shared With You</h2>
        <div className="table-wrapper">
          <table className="file-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Size (KB)</th>
                <th>Uploaded</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shared.length === 0 && (
                <tr><td colSpan="5" style={{textAlign:"center"}}>No files shared with you</td></tr>
              )}
              {shared.map(f => (
                <tr key={f._id}>
                  <td>{f.originalName}</td>
                  <td>{f.mimeType}</td>
                  <td>{(f.size/1024).toFixed(1)}</td>
                  <td>{new Date(f.createdAt).toLocaleString()}</td>
                  <td className="actions-cell">
                    <button className="action-btn download" onClick={() => download(f._id,null,f.originalName)}>Download</button>
                    <button className="action-btn view" onClick={() => handleView(f)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {showShare && <ShareModal file={showShare} onClose={() => setShowShare(null)} onShared={fetchFiles} />}

      {viewFile && (
        <div className="modal-overlay" onClick={() => setViewFile(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{viewFile.originalName}</h3>
            {loadingPreview ? <p>Loading preview...</p> : renderPreview()}
            <button className="close-btn" onClick={() => setViewFile(null)}>Close</button>
          </div>
        </div>
      )}

      {showAudit && (
        <div className="modal-overlay" onClick={() => setShowAudit(false)}>
          <div className="modal-content audit-modal" onClick={e => e.stopPropagation()}>
            <h3>Audit Logs</h3>
            <div className="audit-table-wrapper">
              <table className="audit-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Action</th>
                    <th>Meta</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length === 0 && (
                    <tr><td colSpan="4" style={{textAlign:"center"}}>No audit logs found</td></tr>
                  )}
                  {auditLogs.map(log => (
                    <tr key={log._id}>
                      <td>{log.user?.name || "Unknown"} ({log.user?.email || ""})</td>
                      <td>{log.action}</td>
                      <td><pre className="audit-meta">{JSON.stringify(log.meta,null,2)}</pre></td>
                      <td>{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="close-btn" onClick={() => setShowAudit(false)}>Close</button>
          </div>
        </div>
      )}

    </div>
  );
}
