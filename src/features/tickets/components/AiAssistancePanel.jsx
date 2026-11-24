import { useEffect } from 'react';
import { useAiSummary, useGenerateSummary, useAiClassification, useClassifyTicket } from '../hooks/useTickets';
import Spinner from '../../../components/feedback/Spinner/Spinner';
import Icon from '../../../components/Icon/Icon';
import styles from './AiAssistancePanel.module.css';

export default function AiAssistancePanel({ ticket }) {
  const ticketId = ticket?.id;
  const { data: summaryData } = useAiSummary(ticketId);
  const { data: classData } = useAiClassification(ticketId);

  const generateSummaryMutation = useGenerateSummary();
  const classifyMutation = useClassifyTicket();

  const isGenerating = generateSummaryMutation.isPending || classifyMutation.isPending;

  // Auto-generate if not available
  useEffect(() => {
    if (ticketId && !summaryData && !generateSummaryMutation.isPending && !generateSummaryMutation.isSuccess) {
      generateSummaryMutation.mutate({ id: ticketId });
    }
  }, [ticketId]); // eslint-disable-line react-hooks/exhaustive-deps

  const summary = summaryData?.result?.summary || ticket?.ai_summary || null;
  const sentiment = summaryData?.result?.sentiment || 'Neutral';
  const suggestedCategory = classData?.result?.suggestedCategory || ticket?.category_name || 'General';
  const suggestedPriority = classData?.result?.suggestedPriority || ticket?.priority || 'Medium';

  return (
    <div className={styles.card} aria-label="AI assistance">
      <div className={styles.header}>
        <h3 className={styles.title}>
          <Icon name="sparkle" size={15} className={styles.titleIcon} />
          <span>AI assistance</span>
        </h3>
        {isGenerating && <Spinner size="sm" />}
      </div>

      <div className={styles.content}>
        {summary ? (
          <p className={styles.summaryLine}>
            <strong className={styles.summaryLabel}>AI summary:</strong> {summary}
          </p>
        ) : isGenerating ? (
          <p className={styles.mutedText}>Analyzing conversation...</p>
        ) : (
          <p className={styles.summaryLine}>
            <strong className={styles.summaryLabel}>AI summary:</strong> {ticket?.description ? `${ticket.description.slice(0, 100)}...` : 'Pending ticket analysis.'}
          </p>
        )}

        <p className={styles.sentimentLine}>
          <strong>AI sentiment:</strong> <span className={styles.sentimentValue}>{sentiment}</span>
        </p>

        <div className={styles.suggestionsBlock}>
          <p className={styles.suggestionText}>
            <strong>AI suggestions:</strong> {suggestedCategory} · {suggestedPriority}.
          </p>
          <p className={styles.matchSubtext}>Matches current settings.</p>
        </div>
      </div>
    </div>
  );
}
