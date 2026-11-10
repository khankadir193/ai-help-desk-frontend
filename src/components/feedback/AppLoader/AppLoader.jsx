import styles from './AppLoader.module.css';

/**
 * AppLoader
 *
 * Polished, modern global application loader that matches HelpDesk AI's
 * indigo branding system. Used during initial app boot, full-page refresh,
 * authentication checks, and session restoration.
 *
 * Props:
 *  - message: string (default: 'Loading HelpDesk AI...')
 *  - subtext?: string
 *  - fullScreen?: boolean (default: true)
 */
export default function AppLoader({
  message = 'Loading HelpDesk AI...',
  subtext,
  fullScreen = true,
}) {
  return (
    <div
      className={fullScreen ? styles.fullScreen : styles.inlineContainer}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className={styles.card}>
        <div className={styles.logoTile} aria-hidden="true">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={styles.sparkleIcon}
          >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" />
            <path d="M19 17v4" />
            <path d="M3 5h4" />
            <path d="M17 19h4" />
          </svg>
        </div>

        <div className={styles.textGroup}>
          <span className={styles.brandName}>HelpDesk AI</span>
          <span className={styles.message}>{message}</span>
          {subtext && <span className={styles.subtext}>{subtext}</span>}
        </div>

        <div className={styles.progressTrack} aria-hidden="true">
          <div className={styles.progressBar} />
        </div>
      </div>
    </div>
  );
}

