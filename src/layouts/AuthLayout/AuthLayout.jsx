import { Outlet, Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import styles from './AuthLayout.module.css';

export default function AuthLayout() {
  return (
    <div className={styles.layoutContainer}>
      {/* Visual / Feature Showcase Panel (Visible on Desktop / Laptop >= 1024px) */}
      <aside className={styles.visualPanel} aria-label="Product Showcase">
        <div className={styles.visualGlowTop} aria-hidden="true" />
        <div className={styles.visualGlowBottom} aria-hidden="true" />

        <div className={styles.visualInner}>
          <div className={styles.brandRow}>
            <Link to={ROUTES.HOME} className={styles.brandLink}>
              <div className={styles.logoIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              </div>
              <span className={styles.brandName}>HelpDesk AI</span>
            </Link>
            <span className={styles.versionTag}>Enterprise Suite</span>
          </div>

          <div className={styles.heroContent}>
            <div className={styles.heroTagline}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>Intelligent Ticket Resolution</span>
            </div>

            <h2 className={styles.heroHeading}>
              Supercharge your support with{' '}
              <span className={styles.heroHighlight}>context-aware AI</span>.
            </h2>

            <p className={styles.heroDescription}>
              Empower support agents with automated triage, sentiment classification, and instantaneous response suggestions to delight customers around the clock.
            </p>
          </div>

          <div className={styles.featureCards}>
            <div className={styles.glassCard}>
              <div className={styles.glassCardIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <div className={styles.glassCardBody}>
                <div className={styles.glassCardTop}>
                  <span className={styles.glassCardTitle}>Instant Priority Triage</span>
                  <span className={styles.cardBadgeSuccess}>99.4% Accuracy</span>
                </div>
                <p className={styles.glassCardText}>
                  Automatically scores sentiment and escalates high-impact blockers to senior technicians.
                </p>
              </div>
            </div>

            <div className={styles.glassCard}>
              <div className={styles.glassCardIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div className={styles.glassCardBody}>
                <div className={styles.glassCardTop}>
                  <span className={styles.glassCardTitle}>Copilot Resolution Drafts</span>
                  <span className={styles.cardBadgeAi}>Real-time</span>
                </div>
                <p className={styles.glassCardText}>
                  Suggests brand-aligned solutions rooted in verified knowledge bases and past ticket history.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>3.2x</span>
              <span className={styles.statLabel}>Faster resolution</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNumber}>65%</span>
              <span className={styles.statLabel}>Deflected routine queries</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNumber}>99.9%</span>
              <span className={styles.statLabel}>SLA Compliance</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Form Section */}
      <main className={styles.formSection}>
        <div className={styles.formTopBar}>
          <Link to={ROUTES.HOME} className={styles.backLink}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Back to Home</span>
          </Link>

          {/* Mobile / Tablet Brand Logo */}
          <Link to={ROUTES.HOME} className={styles.mobileBrand}>
            <div className={styles.mobileBrandIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            </div>
            <span>HelpDesk AI</span>
          </Link>
        </div>

        <div className={styles.formContainer}>
          <Outlet />
        </div>

        <footer className={styles.formFooter}>
          <span>&copy; {new Date().getFullYear()} HelpDesk AI Systems Inc.</span>
          <div className={styles.footerLinks}>
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#security">Security</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
