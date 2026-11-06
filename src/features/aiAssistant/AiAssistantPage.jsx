import { useEffect, useRef, useState } from 'react';
import {
  useClassifyTicket,
  useSuggestTicketPriority,
  useGenerateReplyDraft,
  useGenerateSummary,
  useAiClassification,
  useAiPrioritySuggestion,
  useAiReplyDraft,
  useAiSummary,
  useTicket,
} from '../tickets/hooks/useTickets';
import { AI_FEATURES, AI_FEATURE_BY_ID } from './aiFeaturesConfig';
import { useAuth } from '../auth/hooks/useAuth';
import AiFeatureCard from './components/AiFeatureCard';
import TicketPicker from './components/TicketPicker';
import AiResultsPanel from './components/AiResultsPanel';
import Icon from '../../components/Icon/Icon';
import styles from './AiAssistantPage.module.css';

/**
 * AI Assistant — dedicated workspace for the four existing AI integrations
 * (classification, priority, reply draft, summary). Every generation goes
 * through the mutations in features/tickets/hooks/useTickets.js, which call
 * the existing backend endpoints; nothing here adds or duplicates an API.
 *
 * Safety model (same as the Ticket Details AI cards):
 *  - suggestions are advisory and stored PENDING; nothing on the ticket is
 *    ever updated automatically and no comment is ever posted,
 *  - only staff reach the card actions (backend is the source of truth for
 *    assigned-AGENT/ADMIN permission),
 *  - one generation at a time, so no duplicate submissions can be fired.
 */
export default function AiAssistantPage() {
  const { role } = useAuth();
  const isStaff = role === 'AGENT' || role === 'ADMIN';

  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [activeFeatureId, setActiveFeatureId] = useState(null);

  // Existing AI mutations (features/tickets) — reused as-is.
  const classifyMutation = useClassifyTicket();
  const priorityMutation = useSuggestTicketPriority();
  const replyMutation = useGenerateReplyDraft();
  const summaryMutation = useGenerateSummary();
  const { reset: resetClassify } = classifyMutation;
  const { reset: resetPriority } = priorityMutation;
  const { reset: resetReply } = replyMutation;
  const { reset: resetSummary } = summaryMutation;

  // Latest cached suggestion per ticket (written by those mutations; there
  // is no GET endpoint for suggestions, so the in-session cache is the read
  // model). enabled: false readers — they never fetch anything.
  const { data: classificationData } = useAiClassification(selectedTicketId);
  const { data: priorityData } = useAiPrioritySuggestion(selectedTicketId);
  const { data: replyData } = useAiReplyDraft(selectedTicketId);
  const { data: summaryData } = useAiSummary(selectedTicketId);

  const mutationsById = {
    classification: classifyMutation,
    priority: priorityMutation,
    reply: replyMutation,
    summary: summaryMutation,
  };

  const resultsById = {
    classification: classificationData ?? null,
    priority: priorityData ?? null,
    reply: replyData ?? null,
    summary: summaryData ?? null,
  };

  // Selected ticket snapshot (same cache key the TicketPicker observes, so
  // both views share the existing detail request — no extra call).
  const { data: selectedTicket } = useTicket(selectedTicketId);

  const isAnyPending =
    classifyMutation.isPending ||
    priorityMutation.isPending ||
    replyMutation.isPending ||
    summaryMutation.isPending;

  const activeFeature = activeFeatureId ? AI_FEATURE_BY_ID[activeFeatureId] : null;
  const activeMutation = activeFeature ? mutationsById[activeFeatureId] : null;
  const activeSuggestion = activeFeature ? resultsById[activeFeatureId] : null;

  const resultsRef = useRef(null);

  // A stale mutation state (e.g. the error banner) must not follow the
  // selection to a different ticket.
  useEffect(() => {
    resetClassify();
    resetPriority();
    resetReply();
    resetSummary();
  }, [selectedTicketId, resetClassify, resetPriority, resetReply, resetSummary]);

  // Keep the freshly activated result in view without a full-page jump.
  useEffect(() => {
    if (!activeFeatureId) return;
    const prefersReducedMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    resultsRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'nearest',
    });
  }, [activeFeatureId]);

  /** Activate a feature and immediately run it via its existing mutation. */
  const runFeature = (featureId) => {
    if (!selectedTicketId || isAnyPending) return;
    setActiveFeatureId(featureId);
    mutationsById[featureId].mutate({ id: selectedTicketId });
  };

  /** Retry for the active panel (same mutation, current ticket). */
  const runActiveFeature = () => {
    if (!activeFeatureId || !selectedTicketId || isAnyPending) return;
    mutationsById[activeFeatureId].mutate({ id: selectedTicketId });
  };

  const status = !isStaff
    ? { label: 'Staff only', tone: 'locked' }
    : isAnyPending
    ? { label: 'Generating…', tone: 'busy' }
    : { label: 'Ready', tone: 'live' };

  return (
    <main className="dashboard-content" aria-label="AI Assistant">
      {/* A. Hero header */}
      <header className={styles.hero}>
        <div className={styles.heroMain}>
          <span className={styles.heroIconBadge} aria-hidden="true">
            <Icon name="sparkle" size={22} strokeWidth={1.9} />
          </span>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>AI Assistant</h1>
            <p className={styles.heroSubtitle}>
              Intelligent assistance for faster ticket resolution.
            </p>
          </div>
        </div>
        <div className={styles.heroStatusWrap}>
          <span
            className={`${styles.statusBadge} ${
              status.tone === 'live'
                ? styles.statusLive
                : status.tone === 'busy'
                ? styles.statusBusy
                : styles.statusLocked
            }`}
          >
            <span
              className={`${styles.statusDot} ${
                status.tone === 'live'
                  ? styles.dotLive
                  : status.tone === 'busy'
                  ? styles.dotBusy
                  : styles.dotLocked
              }`}
              aria-hidden="true"
            />
            {status.label}
          </span>
        </div>
      </header>

      {!isStaff && (
        <div className={styles.customerNotice} role="note">
          <Icon name="alert-circle" size={16} />
          <span>
            AI assistance is available to support staff — assigned agents and
            admins. You can review your tickets below; suggestions are part of
            the support workflow only.
          </span>
        </div>
      )}

      {/* B–D workspace: feature cards + results in the main column, ticket
          selection in the aside (reordered below the cards on narrow screens). */}
      <div className={styles.layout}>
        <section className={styles.areaFeatures} aria-label="AI features">
          <div className={styles.areaHead}>
            <h2 className={styles.sectionTitle}>AI capabilities</h2>
            <p className={styles.sectionSub}>
              Activate a capability to run it against the selected ticket.
              Suggestions are advisory — nothing is applied automatically.
            </p>
          </div>
          <div className={styles.cardsGrid}>
            {AI_FEATURES.map((feature) => (
              <AiFeatureCard
                key={feature.id}
                feature={feature}
                isActive={activeFeatureId === feature.id}
                isStaff={isStaff}
                hasTicket={Boolean(selectedTicketId)}
                isAnyPending={isAnyPending}
                isOwnPending={mutationsById[feature.id].isPending}
                hasResult={Boolean(resultsById[feature.id])}
                onActivate={() => runFeature(feature.id)}
              />
            ))}
          </div>
        </section>

        <section className={styles.areaResults} aria-label="AI results" ref={resultsRef}>
          <AiResultsPanel
            feature={activeFeature}
            ticket={selectedTicket ?? null}
            ticketId={selectedTicketId}
            suggestion={activeSuggestion}
            mutation={activeMutation}
            onRun={runActiveFeature}
          />
        </section>

        {/* C. Ticket selection (aside) */}
        <aside className={styles.areaPicker} aria-label="Ticket selection">
          <TicketPicker
            selectedTicketId={selectedTicketId}
            onSelectTicket={setSelectedTicketId}
          />
        </aside>
      </div>
    </main>
  );
}
