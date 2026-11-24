import { Link } from 'react-router-dom';
import Avatar from '../../../components/Avatar/Avatar';
import { formatInitials } from '../utils/ticketFormatters';
import styles from './CustomerCard.module.css';

export default function CustomerCard({ ticket }) {
  if (!ticket) return null;

  const customerName = ticket.customer_name || 'Customer';
  const customerEmail = ticket.customer_email || 'customer@example.com';
  const initials = formatInitials(customerName);

  return (
    <div className={styles.card} aria-label="Customer details">
      <h3 className={styles.title}>Customer</h3>

      <div className={styles.customerRow}>
        <Avatar initials={initials} size="md" />
        <span className={styles.customerName}>{customerName}</span>
      </div>

      <p className={styles.customerEmail}>{customerEmail}</p>

      <div className={styles.planSection}>
        <span className={styles.planLabel}>Plan</span>
        <span className={styles.planValue}>Pro · Monthly</span>
      </div>

      <Link
        to={`/tickets?q=${encodeURIComponent(customerEmail)}`}
        className={styles.previousTicketsLink}
      >
        View previous tickets →
      </Link>
    </div>
  );
}
