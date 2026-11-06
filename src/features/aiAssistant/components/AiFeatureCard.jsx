import Icon from '../../../components/Icon/Icon';
import Spinner from '../../../components/feedback/Spinner/Spinner';
import styles from '../AiAssistantPage.module.css';

/**
 * One AI capability card of the Assistant page. The whole card is a single
 * button (no nested interactive elements): clicking it activates the feature
 * and — when a ticket is already selected — immediately triggers the
 * matching AI action through the existing useTickets mutations.
 *
 * Disabled (never interactive for) CUSTOMER accounts and whenever no ticket
 * is selected or any AI action is already running — one generation at a
 * time prevents duplicate backend submissions.
 */
export default function AiFeatureCard({
  feature,
  isActive,
  isStaff,
  hasTicket,
  isAnyPending,
  isOwnPending,
  hasResult,
  onActivate,
}) {
  const isLocked = !isStaff;
  // Locked for customers, until a ticket is picked, and while any AI
  // generation is in flight (prevents duplicate/parallel submissions).
  const isDisabled = isLocked || !hasTicket || isAnyPending;

  const cardClasses = [
    styles.featureCard,
    isActive ? styles.featureCardActive : '',
    isLocked ? styles.featureCardLocked : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={cardClasses}
      aria-pressed={isActive}
      disabled={isDisabled}
      onClick={() => {
        if (!isDisabled) onActivate();
      }}
    >
      <span
        className={`${styles.iconChip} ${styles[`chip--${feature.accent}`]}`}
        aria-hidden="true"
      >
        <Icon name={feature.icon} size={18} />
      </span>

      <span className={styles.featureTitle}>{feature.title}</span>
      <span className={styles.featureDesc}>{feature.description}</span>

      <span className={styles.featureFoot}>
        <span className={styles.footLabel}>
          {isOwnPending ? (
            <>
              <Spinner size="sm" label="" />
              {feature.pendingLabel}
            </>
          ) : isLocked ? (
            'Agents & admins only'
          ) : !hasTicket ? (
            'Select a ticket first'
          ) : hasResult ? (
            'Run again'
          ) : (
            feature.actionLabel
          )}
        </span>
        {hasResult && !isOwnPending && (
          <span className={styles.footCheck}>
            <Icon name="check-circle" size={13} />
            <span>Result below</span>
          </span>
        )}
      </span>
    </button>
  );
}
