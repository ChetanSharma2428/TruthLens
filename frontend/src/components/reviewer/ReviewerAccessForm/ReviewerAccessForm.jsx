import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../common/Button/Button';
import { submitReviewerCode } from '../../../services/reviewerService';
import './ReviewerAccessForm.css';

export default function ReviewerAccessForm() {
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setError('Please enter the reviewer access code.');
      return;
    }

    try {
      setSubmitting(true);
      await submitReviewerCode(trimmedCode);
      navigate('/reviewer/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid access code. Please verify and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUseDemoCode = () => {
    setCode('TRUTHLENS-DEMO-2026');
    setError(null);
  };

  return (
    <div className="tl-access-form-card">
      <div className="tl-access-header">
        <span className="tl-access-badge">RESTRICTED WORKSPACE</span>
        <h2 className="tl-access-title">Reviewer Access</h2>
        <p className="tl-access-subtitle">
          Authorized newsroom and fact-checking workspace. Enter the reviewer key to access the verification queue.
        </p>
      </div>

      {error && (
        <div className="tl-access-alert" role="alert">
          {error}
        </div>
      )}

      <form className="tl-access-form" onSubmit={handleSubmit} noValidate>
        <div className="tl-form-group">
          <label htmlFor="reviewer-code" className="tl-form-label">
            Reviewer Access Code
          </label>
          <input
            id="reviewer-code"
            type="password"
            className={`tl-form-input ${error ? 'tl-input-error' : ''}`}
            placeholder="Enter access code..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={submitting}
            autoFocus
            required
          />
        </div>

        <div className="tl-access-actions">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={submitting}
            className="tl-access-submit-btn"
          >
            {submitting ? 'Verifying Access...' : 'Continue to Workspace'}
          </Button>
        </div>
      </form>

      <div className="tl-access-demo-hint">
        <span className="tl-hint-label">Reviewer Passkey:</span>
        <div className="tl-hint-code-row">
          <code>TRUTHLENS-DEMO-2026</code>
          <button
            type="button"
            className="tl-hint-apply-btn"
            onClick={handleUseDemoCode}
          >
            Auto-fill
          </button>
        </div>
      </div>
    </div>
  );
}
