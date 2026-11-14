import RoleOptionCard from '../RoleOptionCard/RoleOptionCard';
import './InviteForm.css';

export default function InviteForm({
  email,
  role,
  team,
  rolesConfig = [],
  teamsList = [],
  assignableRoles = ['AGENT'],
  errors = {},
  touched = {},
  statusLabel = 'Draft · Not sent',
  onEmailChange,
  onEmailBlur,
  onRoleChange,
  onTeamChange,
  onCancel,
  onSubmit,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit();
    }
  };

  return (
    <section className="inv-details-card" aria-label="Invitation details">
      <div className="inv-details-card__header">
        <h2 className="inv-details-card__title">Invitation details</h2>
        <p className="inv-details-card__subtext">
          Send one invitation at a time. Access starts only after acceptance.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="inv-details-form" noValidate>
        {/* Work email field */}
        <div className="inv-field">
          <label htmlFor="inv-email" className="inv-field__label">
            Work email <span className="inv-field__required">*</span>
          </label>
          <input
            id="inv-email"
            type="email"
            className={`inv-field__input ${errors.email && touched.email ? 'inv-field__input--error' : ''}`}
            placeholder="olivia.brooks@example.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            onBlur={onEmailBlur}
            aria-describedby={errors.email ? 'inv-email-error' : 'inv-email-helper'}
            aria-invalid={Boolean(errors.email && touched.email)}
            required
          />
          {errors.email && touched.email ? (
            <span id="inv-email-error" className="inv-field__error" role="alert">
              {errors.email}
            </span>
          ) : (
            <span id="inv-email-helper" className="inv-field__helper">
              Use your teammate's work email address.
            </span>
          )}
        </div>

        {/* Role selection radiogroup */}
        <div className="inv-field">
          <label className="inv-field__label" id="role-radiogroup-label">
            Role <span className="inv-field__required">*</span>
          </label>
          <div
            className="inv-role-group"
            role="radiogroup"
            aria-labelledby="role-radiogroup-label"
          >
            {rolesConfig.map((roleOpt) => {
              const isAssignable = assignableRoles.includes(roleOpt.id);
              const isSelected = role === roleOpt.id;
              return (
                <RoleOptionCard
                  key={roleOpt.id}
                  role={roleOpt}
                  selected={isSelected}
                  disabled={!isAssignable}
                  onSelect={(id) => onRoleChange(id)}
                />
              );
            })}
          </div>
          {errors.role && touched.role && (
            <span className="inv-field__error" role="alert">
              {errors.role}
            </span>
          )}
        </div>

        {/* Team field */}
        <div className="inv-field">
          <label htmlFor="inv-team" className="inv-field__label">
            Team
          </label>
          <div className="inv-select-wrapper">
            <select
              id="inv-team"
              className="inv-field__select"
              value={team}
              onChange={(e) => onTeamChange(e.target.value)}
              aria-describedby="inv-team-helper"
            >
              {teamsList.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <span id="inv-team-helper" className="inv-field__helper">
            Managers can invite Support Agents. Ask an Admin for elevated access.
          </span>
        </div>

        {/* Footer actions */}
        <div className="inv-details-card__footer">
          <span className="inv-footer-status" aria-live="polite">
            {statusLabel}
          </span>

          <div className="inv-footer-actions">
            <button
              type="button"
              className="inv-btn-cancel"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inv-btn-review"
            >
              Review invitation
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
