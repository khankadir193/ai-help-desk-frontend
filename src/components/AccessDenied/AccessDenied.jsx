import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../Icon/Icon';
import Button from '../ui/Button/Button';
import { canAccess, getFeatureLabel, getHomeRoute, getRoleLabel } from '../../lib/accessControl';
import './AccessDenied.css';

/**
 * AccessDenied — shared "No access" screen for permission errors.
 *
 * Rendered in place of a page (full variant) or inline inside a card
 * (compact variant) whenever the signed-in role lacks permission for the
 * feature. Purely presentational: the backend remains the source of truth.
 *
 * Props:
 *   - title          heading text (default "You don't have access to this page")
 *   - message        body text; defaults to the generic role/feature template
 *   - featureName    display name of the denied feature (e.g. "team members")
 *   - role           the user's role string (CUSTOMER/AGENT/ADMIN)
 *   - primaryAction  { label, to } for the solid button; null hides it.
 *                    Defaults to "Go to Dashboard" (or the role's allowed
 *                    home route).
 *   - secondaryAction true (default "Go back"), false to hide, or { label }
 *   - compact        smaller inline variant for use inside cards
 */
export default function AccessDenied({
  title = "You don't have access to this page",
  message,
  featureName,
  role = null,
  primaryAction,
  secondaryAction = true,
  compact = false,
  className = '',
}) {
  const navigate = useNavigate();
  const headingRef = useRef(null);
  const featureLabel = featureName || getFeatureLabel('unknown');
  const roleLabel = getRoleLabel(role);

  // Move focus to the heading on mount so screen readers announce the state
  // (full variant only — the compact variant must not steal focus inside cards).
  useEffect(() => {
    if (!compact && headingRef.current) {
      headingRef.current.focus();
    }
  }, [compact]);

  const resolvedMessage =
    message ||
    (roleLabel
      ? `Your role (${roleLabel}) doesn't include permission to view ${featureLabel}. If you think this is a mistake, contact your workspace admin.`
      : `Your account doesn't include permission to view ${featureLabel}. If you think this is a mistake, contact your workspace admin.`);

  // Primary action: caller-provided, or "Go to Dashboard" / allowed home route.
  const primary =
    primaryAction === undefined
      ? {
          label: canAccess(role, 'dashboard') ? 'Go to Dashboard' : 'Go to tickets',
          to: getHomeRoute(role),
        }
      : primaryAction;

  const secondaryLabel =
    typeof secondaryAction === 'object' && secondaryAction !== null
      ? secondaryAction.label
      : 'Go back';
  const showSecondary = secondaryAction !== false;

  // "Go back" only when there is history to go back to (direct URL visits
  // start at idx 0) — otherwise land on the role's allowed home route.
  const handleGoBack = () => {
    const idx = window.history?.state?.idx;
    if (typeof idx === 'number' && idx > 0) {
      navigate(-1);
    } else {
      navigate(getHomeRoute(role), { replace: true });
    }
  };

  return (
    <div
      className={`access-denied${compact ? ' access-denied--compact' : ''}${
        className ? ` ${className}` : ''
      }`.trim()}
      role={compact ? 'status' : 'alert'}
    >
      <div className="access-denied__card">
        <div className="access-denied__icon-tile" aria-hidden="true">
          <Icon name="lock" size={compact ? 20 : 24} strokeWidth={2} />
        </div>

        <h2
          ref={headingRef}
          tabIndex={compact ? undefined : -1}
          className="access-denied__title"
        >
          {title}
        </h2>

        <p className="access-denied__message">{resolvedMessage}</p>

        {!compact && roleLabel && (
          <p className="access-denied__role">
            Current role: <strong>{roleLabel}</strong>
          </p>
        )}

        <div className="access-denied__actions">
          {primary && (
            <Button
              variant="primary"
              size={compact ? 'sm' : 'md'}
              onClick={() => navigate(primary.to)}
            >
              {primary.label}
            </Button>
          )}
          {showSecondary && (
            <Button
              variant="outline"
              size={compact ? 'sm' : 'md'}
              onClick={handleGoBack}
            >
              {secondaryLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
