import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button/Button';
import Icon from '../../../../components/Icon/Icon';
import { ROUTES } from '../../../../constants/routes';
import './ReportsRestricted.css';

/**
 * ReportsRestricted
 *
 * Customer-facing "access restricted" screen rendered in place of the
 * Reports & Analytics dashboard when the signed-in role is CUSTOMER.
 *
 * It is purely presentational — no Reports API calls are made and no
 * analytics data (real or dummy) is displayed. Authorization itself
 * remains enforced end-to-end by the backend.
 */
export default function ReportsRestricted() {
  const navigate = useNavigate();

  const goToTickets = () => navigate(ROUTES.TICKETS);

  return (
    <section
      className="reports-restricted"
      aria-labelledby="reports-restricted-heading"
    >
      <div className="reports-restricted__card">
        <span className="reports-restricted__badge">
          <Icon
            name="users"
            size={14}
            className="reports-restricted__badge-icon"
          />
          Customer Access
        </span>

        <div className="reports-restricted__illustration" aria-hidden="true">
          <svg
            className="reports-restricted__ill"
            viewBox="0 0 240 168"
            width="228"
            height="159"
            focusable="false"
          >
            {/* Soft halos behind the whole composition */}
            <circle className="reports-restricted__ill-halo" cx="120" cy="86" r="76" />
            <circle
              className="reports-restricted__ill-halo reports-restricted__ill-halo--inner"
              cx="120"
              cy="88"
              r="56"
            />

            {/* Sparkle accents */}
            <path className="reports-restricted__ill-sparkle" d="M32 48v12M26 54h12" />
            <path className="reports-restricted__ill-sparkle" d="M208 30v12M202 36h12" />
            <circle className="reports-restricted__ill-dot" cx="44" cy="120" r="2.5" />
            <circle className="reports-restricted__ill-dot" cx="212" cy="92" r="3" />

            {/* Analytics card */}
            <rect
              className="reports-restricted__ill-card"
              x="57"
              y="20"
              width="112"
              height="90"
              rx="10"
            />
            <circle className="reports-restricted__ill-window-dot" cx="69" cy="36" r="2.4" />
            <circle className="reports-restricted__ill-window-dot" cx="77" cy="36" r="2.4" />
            <rect
              className="reports-restricted__ill-titlebar"
              x="86"
              y="32"
              width="44"
              height="8"
              rx="4"
            />

            {/* Bar chart */}
            <rect
              className="reports-restricted__ill-bar reports-restricted__ill-bar--low"
              x="70"
              y="76"
              width="11"
              height="22"
              rx="3"
            />
            <rect
              className="reports-restricted__ill-bar reports-restricted__ill-bar--mid"
              x="88"
              y="66"
              width="11"
              height="32"
              rx="3"
            />
            <rect
              className="reports-restricted__ill-bar reports-restricted__ill-bar--high"
              x="106"
              y="56"
              width="11"
              height="42"
              rx="3"
            />
            <rect
              className="reports-restricted__ill-bar"
              x="124"
              y="46"
              width="11"
              height="52"
              rx="3"
            />

            {/* Trend line following the bars */}
            <path className="reports-restricted__ill-trend" d="M69 82l23-14 23 6 25-26" />
            <circle className="reports-restricted__ill-trend-dot" cx="140" cy="48" r="3.2" />

            {/* Lock overlapping the reports card */}
            <circle className="reports-restricted__ill-lock-halo" cx="184" cy="106" r="32" />
            <circle className="reports-restricted__ill-lock" cx="184" cy="106" r="24" />
            <path
              className="reports-restricted__ill-lock-shackle"
              d="M178.5 103v-4.5a5.5 5.5 0 0 1 11 0V103"
            />
            <rect
              className="reports-restricted__ill-lock-body"
              x="176"
              y="103"
              width="16"
              height="13"
              rx="3"
            />
            <circle className="reports-restricted__ill-lock-keyhole" cx="184" cy="108.5" r="1.8" />
            <path className="reports-restricted__ill-lock-keyhole" d="M184 109.8v2.6" />
          </svg>
        </div>

        <h2 id="reports-restricted-heading" className="reports-restricted__title">
          Reports are for our support team
        </h2>
        <p className="reports-restricted__description">
          Detailed analytics and performance reports are available to authorized
          Agents and Administrators. You can continue managing your support
          tickets and tracking their progress.
        </p>

        <Button variant="primary" onClick={goToTickets}>
          <Icon name="ticket" size={16} className="reports-restricted__cta-icon" />
          Go to My Tickets
        </Button>
      </div>
    </section>
  );
}
