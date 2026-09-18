import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../common/Button/Button';
import RiskFlags from '../RiskFlags/RiskFlags';
import StatusBadge from '../StatusBadge/StatusBadge';
import {
  submitClaim,
  suggestClaimCategory,
  checkDuplicateClaim,
  extractClaimFromImage
} from '../../../services/claimService';
import './ClaimForm.css';

export default function ClaimForm() {
  const [formData, setFormData] = useState({
    text: '',
    platform: 'WHATSAPP',
    category: 'POLITICS',
    sourceUrl: '',
    imageUrl: null
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [createdClaim, setCreatedClaim] = useState(null);

  // AI & Feature 1 Enhancement States
  const [suggestingCategory, setSuggestingCategory] = useState(false);
  const [categorySuggestion, setCategorySuggestion] = useState(null);

  // OCR Screenshot State
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [ocrStatus, setOcrStatus] = useState(null);
  const fileInputRef = useRef(null);

  // Duplicate Detection State
  const [duplicateCheck, setDuplicateCheck] = useState(null);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);

  // Debounced duplicate check when text changes
  useEffect(() => {
    const trimmed = formData.text.trim();
    if (trimmed.length < 15) {
      setDuplicateCheck(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setCheckingDuplicate(true);
        const res = await checkDuplicateClaim(trimmed);
        if (res?.isDuplicate) {
          setDuplicateCheck(res);
        } else {
          setDuplicateCheck(null);
        }
      } catch {
        // Non-blocking
      } finally {
        setCheckingDuplicate(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [formData.text]);

  // Client-Side Live Triage Calculation
  const computeLiveTriage = () => {
    const text = formData.text || '';
    const flags = [];

    // 1. Sensational
    if (/\b(breaking|shocking)\b/i.test(text) || /share\s+before\s+deleted/i.test(text)) {
      flags.push('SENSATIONAL');
    }

    // 2. Shouting
    const alphaChars = text.match(/[a-zA-Z]/g);
    if (alphaChars && alphaChars.length > 0) {
      const upperChars = text.match(/[A-Z]/g) || [];
      if (upperChars.length / alphaChars.length > 0.5) {
        flags.push('SHOUTING');
      }
    }

    // 3. Unsourced
    if (!formData.sourceUrl || !formData.sourceUrl.trim()) {
      flags.push('UNSOURCED');
    }

    const isHigh = flags.length >= 2;
    return { flags, isHigh };
  };

  const liveTriage = computeLiveTriage();

  // Screenshot Upload & OCR Extraction Handler
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
    setUploadingImage(true);
    setOcrStatus('Extracting claim with Gemini Vision...');

    try {
      const data = await extractClaimFromImage(file);
      if (data.text) {
        setFormData((prev) => ({
          ...prev,
          text: data.text,
          platform: data.platform || prev.platform,
          category: data.category || prev.category,
          imageUrl: data.imageUrl || null
        }));
        setOcrStatus(
          data.isAiPowered
            ? '✓ Text & Platform extracted via Gemini Vision.'
            : '✓ Image uploaded. (Configure GEMINI_API_KEY for automatic multimodal OCR)'
        );
      }
    } catch (err) {
      setOcrStatus('Image upload failed: ' + (err.message || 'Please try again.'));
    } finally {
      setUploadingImage(false);
    }
  };

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
        sourceUrl: formData.sourceUrl.trim() || null,
        imageUrl: formData.imageUrl || null
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
      sourceUrl: '',
      imageUrl: null
    });
    setErrors({});
    setApiError(null);
    setCreatedClaim(null);
    setImagePreview(null);
    setOcrStatus(null);
    setDuplicateCheck(null);
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

          {createdClaim.imageUrl && (
            <div className="tl-success-image-wrap">
              <img src={createdClaim.imageUrl} alt="Uploaded source screenshot" className="tl-success-screenshot" />
            </div>
          )}

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

      {/* FEATURE 1 ENHANCEMENT: Screenshot OCR Intake Zone */}
      <div className="tl-ocr-intake-zone">
        <div className="tl-ocr-header">
          <span className="tl-ocr-title">✦ Screenshot Intake (Gemini Vision OCR & Cloudinary)</span>
          <button
            type="button"
            className="tl-ocr-upload-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
          >
            {uploadingImage ? 'Processing Image...' : '📷 Upload Screenshot'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="sr-only"
            onChange={handleImageFileChange}
          />
        </div>

        {imagePreview && (
          <div className="tl-ocr-preview-bar">
            <img src={imagePreview} alt="Screenshot thumbnail" className="tl-ocr-thumb" />
            <div className="tl-ocr-status-wrap">
              <span className="tl-ocr-status-text">{ocrStatus}</span>
              <button
                type="button"
                className="tl-ocr-remove-btn"
                onClick={() => {
                  setImagePreview(null);
                  setOcrStatus(null);
                  setFormData((prev) => ({ ...prev, imageUrl: null }));
                }}
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FEATURE 1 ENHANCEMENT: Near-Duplicate Warning Banner */}
      {duplicateCheck && duplicateCheck.matchedClaim && (
        <div className="tl-duplicate-alert" role="alert">
          <div className="tl-duplicate-header">
            <span className="tl-duplicate-badge">⚠️ POTENTIAL DUPLICATE DETECTED ({duplicateCheck.similarity}% MATCH)</span>
            <StatusBadge status={duplicateCheck.matchedClaim.status} size="sm" />
          </div>
          <p className="tl-duplicate-snippet">
            "{duplicateCheck.matchedClaim.text}"
          </p>
          <div className="tl-duplicate-footer">
            <span>Already submitted in <strong>{duplicateCheck.matchedClaim.category}</strong></span>
            <Link
              to={`/claims/${duplicateCheck.matchedClaim.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="tl-duplicate-link"
            >
              View Existing Verification Record ↗
            </Link>
          </div>
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

        {/* FEATURE 1 ENHANCEMENT: Live Real-Time Triage Indicators */}
        {formData.text.trim().length > 0 && (
          <div className="tl-live-triage-bar" aria-live="polite">
            <span className="tl-live-kicker">Live Triage Signals:</span>
            <div className="tl-live-chips">
              <span className={`tl-live-chip ${liveTriage.flags.includes('SENSATIONAL') ? 'tl-chip-active' : ''}`}>
                Sensational
              </span>
              <span className={`tl-live-chip ${liveTriage.flags.includes('SHOUTING') ? 'tl-chip-active' : ''}`}>
                Shouting (&gt;50% CAPS)
              </span>
              <span className={`tl-live-chip ${liveTriage.flags.includes('UNSOURCED') ? 'tl-chip-active' : ''}`}>
                Unsourced
              </span>
              <span className={`tl-live-risk-level ${liveTriage.isHigh ? 'tl-risk-pill-high' : 'tl-risk-pill-normal'}`}>
                {liveTriage.isHigh ? 'Estimated: HIGH RISK' : 'Estimated: NORMAL'}
              </span>
            </div>
          </div>
        )}

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
          <div className="tl-label-row">
            <label htmlFor="claim-category" className="tl-form-label">
              Category <span className="tl-required">*</span>
            </label>
            {formData.text.trim().length >= 5 && (
              <button
                type="button"
                className="tl-suggest-category-btn"
                onClick={async () => {
                  try {
                    setSuggestingCategory(true);
                    const res = await suggestClaimCategory(formData.text);
                    setCategorySuggestion(res);
                  } catch {
                    // Ignore suggestion failure, optional feature
                  } finally {
                    setSuggestingCategory(false);
                  }
                }}
                disabled={suggestingCategory}
              >
                {suggestingCategory ? 'Analyzing...' : '✦ Suggest Category'}
              </button>
            )}
          </div>
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

          {categorySuggestion && (
            <div className="tl-category-suggestion-pill">
              <span className="tl-suggestion-kicker">ADVISORY SUGGESTION:</span>
              <span className="tl-suggestion-value">{categorySuggestion.suggestedCategory}</span>
              <button
                type="button"
                className="tl-apply-suggestion-btn"
                onClick={() => {
                  setFormData({ ...formData, category: categorySuggestion.suggestedCategory });
                  setCategorySuggestion(null);
                }}
              >
                Apply
              </button>
            </div>
          )}
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
