/**
 * AI Assistant feature registry — pure presentational metadata that drives
 * the feature cards and the results panel. The AI calls themselves stay in
 * the existing integration (features/tickets/hooks/useTickets.js and
 * services/ticketService.js); nothing here touches the network.
 */
export const AI_FEATURES = [
  {
    id: 'classification',
    title: 'Ticket Classification',
    description:
      'Suggest the most appropriate category for this ticket, backed by a confidence score and a short reason.',
    icon: 'tag',
    accent: 'indigo',
    actionLabel: 'Classify ticket',
    pendingLabel: 'Classifying…',
  },
  {
    id: 'priority',
    title: 'Priority Suggestion',
    description:
      'Recommend a ticket priority from Low to Urgent based on the reported issue and its impact.',
    icon: 'target',
    accent: 'amber',
    actionLabel: 'Suggest priority',
    pendingLabel: 'Analyzing priority…',
  },
  {
    id: 'reply',
    title: 'Reply Draft',
    description:
      'Generate an editable customer-facing reply that you can review, refine and post yourself.',
    icon: 'pencil',
    accent: 'success',
    actionLabel: 'Draft customer reply',
    pendingLabel: 'Drafting reply…',
  },
  {
    id: 'summary',
    title: 'Conversation Summary',
    description:
      'Summarize the conversation at a glance: main issue, work done, current status and next steps.',
    icon: 'file-text',
    accent: 'blue',
    actionLabel: 'Summarize conversation',
    pendingLabel: 'Summarizing…',
  },
];

export const AI_FEATURE_BY_ID = Object.fromEntries(
  AI_FEATURES.map((feature) => [feature.id, feature])
);
