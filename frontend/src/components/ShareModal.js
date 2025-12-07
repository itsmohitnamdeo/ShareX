import React, { useEffect, useState } from 'react';
import API from '../utils/api';
import '../styles/shareModal.css';

export default function ShareModal({ file, onClose, onShared }) {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [restrictedUsers, setRestrictedUsers] = useState(new Set());
  const [expires, setExpires] = useState(3600);
  const [shareLink, setShareLink] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    try {
      const { data } = await API.get('/users');
      setUsers(data);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  }

  const toggleSet = (set, id) => {
    const s = new Set(set);
    s.has(id) ? s.delete(id) : s.add(id);
    return s;
  };

  const handleSelectUser = (id) => setSelectedUsers(toggleSet(selectedUsers, id));
  const handleRestrictUser = (id) => setRestrictedUsers(toggleSet(restrictedUsers, id));

  const shareWithUsers = async () => {
    if (selectedUsers.size === 0) return alert('Select at least one user');
    try {
      await API.post(`/files/${file._id}/share`, { userIds: Array.from(selectedUsers) });
      alert('File shared successfully!');
      onShared();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const createLink = async () => {
    try {
      const { data } = await API.post(`/files/${file._id}/link`, {
        expiresInSeconds: Number(expires),
        allowedUsers: [],
        restrictedUsers: Array.from(restrictedUsers)
      });
      setShareLink(`${window.location.origin}${data.url}`);
      onShared();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal-content" onClick={e => e.stopPropagation()}>
        <h3>Share "{file.originalName}"</h3>

        <div className="share-section">
          <h4>Share With Users</h4>
          <input
            type="text"
            className="user-search"
            placeholder="Search users..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <div className="user-list">
            {filteredUsers.length === 0 && <p className="no-users">No users found</p>}
            {filteredUsers.map(u => (
              <label key={u._id} className="user-item">
                <input
                  type="checkbox"
                  checked={selectedUsers.has(u._id)}
                  onChange={() => handleSelectUser(u._id)}
                />
                {u.name} ({u.email})
              </label>
            ))}
          </div>
          <button className="btn btn-primary" onClick={shareWithUsers}>Share File</button>
        </div>

        <div className="share-section">
          <h4>Create Share Link</h4>
          <label>
            Expires in (seconds): 
            <input type="number" min="60" value={expires} 
                   onChange={e => setExpires(e.target.value)} className="input-expires"/>
          </label>

          <input
            type="text"
            className="user-search"
            placeholder="Search users to restrict..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />

          <div className="user-list">
            {filteredUsers.length === 0 && <p className="no-users">No users found</p>}
            {filteredUsers.map(u => (
              <label key={u._id} className="user-item">
                <input
                  type="checkbox"
                  checked={restrictedUsers.has(u._id)}
                  onChange={() => handleRestrictUser(u._id)}
                />
                {u.name} ({u.email})
              </label>
            ))}
          </div>
          <button className="btn btn-secondary" onClick={createLink}>Create Link</button>

          {shareLink && (
            <div className="share-link-box" onClick={copyToClipboard}>
              {shareLink} <span className="copy-text">(click to copy)</span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-close" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
