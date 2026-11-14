import { getRoleLabel } from '../../utils/teamPermissions';
import './InvitationReviewCard.css';

export default function InvitationReviewCard({ email, role, team }) {
  const displayEmail = email?.trim() || 'No email entered yet';
  const displayRole = getRoleLabel(role);
  const displayTeam = team || 'General support';

  return (
    <section className="inv-review-card" aria-label="Review before sending">
      <h2 className="inv-review-card__title">Review before sending</h2>

      <div className="inv-review-card__summary">
        <p className={`inv-review-card__email ${!email?.trim() ? 'inv-review-card__email--empty' : ''}`}>
          {displayEmail}
        </p>
        <p className="inv-review-card__meta">
          <span className="inv-review-card__meta-label">Role: </span>
          <span className="inv-review-card__meta-val">{displayRole}</span>
        </p>
        <p className="inv-review-card__meta">
          <span className="inv-review-card__meta-label">Team: </span>
          <span className="inv-review-card__meta-val">{displayTeam}</span>
        </p>
      </div>

      <div className="inv-review-callout">
        <h3 className="inv-review-callout__title">You're in control</h3>
        <p className="inv-review-callout__text">
          Review the email and role, then confirm "Send invitation" in the next step. Nothing has been sent yet.
        </p>
      </div>
    </section>
  );
}
