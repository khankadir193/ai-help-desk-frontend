import styles from './WhatHappensNextCard.module.css';

export default function WhatHappensNextCard({ isEditMode = false, assignedAgentName = '' }) {
  const agentDisplay = assignedAgentName && assignedAgentName !== 'Unassigned'
    ? assignedAgentName.split(' ')[0]
    : 'support queue';

  return (
    <div className={styles.card} aria-label="What happens next info">
      <h4 className={styles.title}>
        {isEditMode ? 'Save ticket details only' : 'What happens next'}
      </h4>
      <p className={styles.bodyText}>
        {isEditMode
          ? 'Changes are recorded in ticket activity. Saving does not send a reply or approve a refund. Your conversation and draft are preserved.'
          : `Creates an Open ticket assigned to ${agentDisplay}. No customer message is sent; review and send a reply from the conversation.`}
      </p>
    </div>
  );
}
