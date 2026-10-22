import React from "react";

export default function WelcomeModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="notion-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="notion-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-badge-title">
            <span className="modal-emoji">👋</span>
            <h3>Welcome to your Todo Workspace</h3>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-intro">
            Organize your tasks with clear separation between personal to-dos and team-shared objectives:
          </p>

          <div className="visibility-guide-grid">
            <div className="guide-card private-card">
              <div className="guide-card-header">
                <span className="guide-icon">🔒</span>
                <h4>Private Tasks</h4>
              </div>
              <p className="guide-desc">
                <strong>Only you can see these tasks.</strong>
              </p>
              <ul className="guide-list">
                <li>Personal errands, draft notes, and private deliverables</li>
                <li>Other standard users cannot view, search, or edit them</li>
                <li>Marked with the <span className="pill-sample private">🔒 Private</span> badge</li>
              </ul>
            </div>

            <div className="guide-card public-card">
              <div className="guide-card-header">
                <span className="guide-icon">🌐</span>
                <h4>Public Tasks</h4>
              </div>
              <p className="guide-desc">
                <strong>All users can see and collaborate on these tasks.</strong>
              </p>
              <ul className="guide-list">
                <li>Team roadmaps, shared milestones, and collaborative projects</li>
                <li>Visible in the "Public Workspace" tab for every user</li>
                <li>Displays author badge (<span className="pill-sample author">Reshmaa</span>)</li>
                <li>Marked with the <span className="pill-sample public">🌐 Public</span> badge</li>
              </ul>
            </div>
          </div>

          <div className="pro-tip-box">
            <span className="tip-star">💡</span>
            <div className="tip-content">
              <strong>Quick Tip:</strong> You can click on the <strong>🔒 Private</strong> or <strong>🌐 Public</strong> badge on any of your tasks at any time to switch its visibility instantly!
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="notion-primary-btn" onClick={onClose}>
            Got it, let's get started
          </button>
        </div>
      </div>
    </div>
  );
}
