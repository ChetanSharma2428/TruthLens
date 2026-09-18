import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../common/Button/Button';
import RiskFlags from '../RiskFlags/RiskFlags';
import StatusBadge from '../StatusBadge/StatusBadge';
import { submitClaim } from '../../../services/claimService';
import './ClaimForm.css';

export default function ClaimForm() {
  const [formData, setFormData] = useState({
    text: '',
    platform: 'WHATSAPP',
    category: 'POLITICS',
    sourceUrl: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [createdClaim, setCreatedClaim] = useState(null);

  const validate = () => {
    const errs = {};
    if (!formData.text || formData.text.trim().length < 5) {
      errs.text = 'Claim text must be at least 5 characters long.';
    } else if (formData.text.trim().length > 1000) {
      errs.text = 'Claim text cannot exceed 1000 characters.';
    }

    if (formData.sourceUrl && formData.sourceUrl.trim()) {
      try {
        const url = new URL(formData.sourceUrl.trim());
        if (!['http:', 'https:'].includes(url.protocol)) {
          errs.sourceUrl = 'Source URL must begin with http:// or https://';
        }
      } catch {
        errs.sourceUrl = 'Please provide a valid URL format (e.g. https://example.com/post)';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    try {
      setSubmitting(true);
      const claim = await submitClaim({
        text: formData.text.trim(),
        platform: formData.platform,
        category: formData.category,
        sourceUrl: formData.sourceUrl.trim() || null
      });
      setCreatedClaim(claim);
    } catch (err) {
      setApiError(err.message || 'Failed to submit claim. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      text: '',
      platform: 'WHATSAPP',
      category: 'POLITICS',
      sourceUrl: ''
    });
    setErrors({});
    setApiError(null);
    setCreatedClaim(null);
  };

  if (createdClaim) {
    return (
      <div className="tl-submission-success" role="status" aria-live="polite">
        <div className="tl-success-header">
          <div className="tl-success-icon" aria-hidden="true">✓</div>
          <h2 className="tl-success-title">Claim Submitted for Verification</h2>
          <p className="tl-success-subtitle">
            Your claim has been triaged through the deterministic risk engine and queued for human review.
          </p>
        </div>

        <div className="tl-success-triage-card">
          <div className="tl-success-card-top">
            <RiskFlags flags={createdClaim.flags} riskLevel={createdClaim.riskLevel} />
            <StatusBadge status={createdClaim.status} size="sm" />
          </div>

          <p className="tl-success-text">{createdClaim.text}</p>

          <div className="tl-success-meta">
            <span>Category: <strong>{createdClaim.category}</strong></span>
            <span>Platform: <strong>{createdClaim.platform}</strong></span>
            <span>Source URL: {createdClaim.sourceUrl ? <a href={createdClaim.sourceUrl} target="_blank" rel="noopener noreferrer">{createdClaim.sourceUrl}</a> : 'None provided (Unsourced)'}</span>
          </div>
        </div>

        <div className="tl-success-actions">
          <Button variant="primary" size="md" to={`/claims/${createdClaim.id}`}>
            View Claim Record
          </Button>
          <Button variant="outline" size="md" onClick={handleReset}>
            Submit Another Claim
          </Button>
          <Button variant="secondary" size="md" to="/feed">
            Go to Claims Feed
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form className="tl-claim-form" onSubmit={handleSubmit} noValidate>
      {apiError && (
        <div className="tl-form-alert" role="alert">
          {apiError}
        </div>
      )}

      {/* Claim Text */}
      <div className="tl-form-group">
        <div className="tl-label-row">
          <label htmlFor="claim-text" className="tl-form-label">
            Claim Text <span className="tl-required">*</span>
          </label>
          <span className="tl-char-counter">
            {formData.text.length}/1000
          </span>
        </div>
        <textarea
          id="claim-text"
          className={`tl-form-textarea ${errors.text ? 'tl-input-error' : ''}`}
          rows={4}
          placeholder="Paste or write the exact text of the claim circulating on social platforms..."
          value={formData.text}
          onChange={(e) => setFormData({ ...formData, text: e.target.value })}
          disabled={submitting}
          required
        />
        {errors.text && <p className="tl-error-text">{errors.text}</p>}
        <p className="tl-form-hint">
          Please include the core assertion. Try to paste the original text without edits.
        </p>
      </div>

      <div className="tl-form-row">
        {/* Source Platform */}
        <div className="tl-form-group">
          <label htmlFor="claim-platform" className="tl-form-label">
            Circulating Platform <span className="tl-required">*</span>
          </label>
          <select
            id="claim-platform"
            className="tl-form-select"
            value={formData.platform}
            onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
            disabled={submitting}
          >
            <option value="WHATSAPP">WhatsApp</option>
            <option value="X">X (Twitter)</option>
            <option value="INSTAGRAM">Instagram</option>
            <option value="OTHER">Other / Web</option>
          </select>
        </div>

        {/* Category */}
        <div className="tl-form-group">
          <label htmlFor="claim-category" className="tl-form-label">
            Category <span className="tl-required">*</span>
          </label>
          <select
            id="claim-category"
            className="tl-form-select"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            disabled={submitting}
          >
            <option value="POLITICS">Politics</option>
            <option value="HEALTH">Health</option>
            <option value="FINANCE">Finance</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* Source URL (optional) */}
      <div className="tl-form-group">
        <label htmlFor="claim-source" className="tl-form-label">
          Source Link <span className="tl-optional">(Optional)</span>
        </label>
        <input
          id="claim-source"
          type="url"
          className={`tl-form-input ${errors.sourceUrl ? 'tl-input-error' : ''}`}
          placeholder="https://example.com/post-or-source"
          value={formData.sourceUrl}
          onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
          disabled={submitting}
        />
        {errors.sourceUrl && <p className="tl-error-text">{errors.sourceUrl}</p>}
        <p className="tl-form-hint">
          If omitted, the automated triage engine will flag the claim as Unsourced.
        </p>
      </div>

      <div className="tl-form-actions">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={submitting}
        >
          {submitting ? 'Analyzing & Submitting...' : 'Submit Claim'}
        </Button>
      </div>
    </form>
  );
}
