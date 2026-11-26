import { useState } from 'react';
import { DEMO_ACCOUNTS, DEMO_DISCLAIMER, isDemoAccountsEnabled } from '../../../data/demoAccounts';
import styles from './DemoAccountsPanel.module.css';

export default function DemoAccountsPanel({ onSelectAccount, id = 'demo-accounts-panel' }) {
  const [copiedKey, setCopiedKey] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});

  if (!isDemoAccountsEnabled()) {
    return null;
  }

  const handleCopy = async (e, text, key) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 1500);
    } catch {
      // Graceful fallback if clipboard API is not available
    }
  };

  const togglePasswordVisibility = (e, role) => {
    e.stopPropagation();
    setVisiblePasswords((prev) => ({
      ...prev,
      [role]: !prev[role],
    }));
  };

  const handleRowClick = (account) => {
    if (onSelectAccount) {
      onSelectAccount(account);
    }
  };

  const handleKeyDown = (e, account) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (e.target === e.currentTarget) {
        e.preventDefault();
        handleRowClick(account);
      }
    }
  };

  return (
    <div
      id={id}
      className={styles.panelCard}
      role="dialog"
      aria-modal="false"
      aria-label="Demo accounts"
    >
      <div className={styles.header}>
        <h2 className={styles.title}>Demo accounts</h2>
        <p className={styles.subtitle}>Choose a role to fill the sign-in form.</p>
      </div>

      <div className={styles.rowsContainer}>
        {DEMO_ACCOUNTS.map((acc) => {
          const isPassVisible = Boolean(visiblePasswords[acc.role]);
          const isEmailCopied = copiedKey === `${acc.role}-email`;
          const isPassCopied = copiedKey === `${acc.role}-password`;

          return (
            <div
              key={acc.role}
              className={styles.accountRow}
              onClick={() => handleRowClick(acc)}
              onKeyDown={(e) => handleKeyDown(e, acc)}
              role="button"
              tabIndex={0}
              aria-label={`Fill ${acc.roleLabel} demo credentials`}
            >
              <div className={styles.rowMain}>
                <div className={styles.rowTop}>
                  <span className={`${styles.roleBadge} ${styles[`roleBadge_${acc.role.toLowerCase()}`]}`}>
                    {acc.roleLabel}
                  </span>
                  <span className={styles.roleDesc}>{acc.description}</span>
                </div>

                <div className={styles.credentialsRow}>
                  <div className={styles.credentialItem}>
                    <span className={styles.credLabel}>Email:</span>
                    <span className={styles.credValue} title={acc.email}>{acc.email}</span>
                    <button
                      type="button"
                      className={styles.iconButton}
                      onClick={(e) => handleCopy(e, acc.email, `${acc.role}-email`)}
                      aria-label={`Copy ${acc.roleLabel} email`}
                      title={isEmailCopied ? 'Copied' : `Copy ${acc.email}`}
                    >
                      {isEmailCopied ? (
                        <span className={styles.copiedFeedback}>Copied</span>
                      ) : (
                        <svg className={styles.iconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                        </svg>
                      )}
                    </button>
                  </div>

                  <div className={styles.credentialDivider} aria-hidden="true">&bull;</div>

                  <div className={styles.credentialItem}>
                    <span className={styles.credLabel}>Pass:</span>
                    <span className={styles.credValue}>
                      {isPassVisible ? acc.password : '••••••••'}
                    </span>
                    <button
                      type="button"
                      className={styles.iconButton}
                      onClick={(e) => togglePasswordVisibility(e, acc.role)}
                      aria-label={isPassVisible ? `Hide ${acc.roleLabel} password` : `Show ${acc.roleLabel} password`}
                      title={isPassVisible ? 'Hide password' : 'Show password'}
                    >
                      {isPassVisible ? (
                        <svg className={styles.iconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                          <line x1="2" x2="22" y1="2" y2="22" />
                        </svg>
                      ) : (
                        <svg className={styles.iconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                    <button
                      type="button"
                      className={styles.iconButton}
                      onClick={(e) => handleCopy(e, acc.password, `${acc.role}-password`)}
                      aria-label={`Copy ${acc.roleLabel} password`}
                      title={isPassCopied ? 'Copied' : `Copy ${acc.roleLabel} password`}
                    >
                      {isPassCopied ? (
                        <span className={styles.copiedFeedback}>Copied</span>
                      ) : (
                        <svg className={styles.iconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.rowAction}>
                <button
                  type="button"
                  className={styles.useButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRowClick(acc);
                  }}
                  aria-label={`Fill ${acc.roleLabel} demo credentials`}
                >
                  Use
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.footerNote}>
        <svg className={styles.footerIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" x2="12" y1="8" y2="12" />
          <line x1="12" x2="12.01" y1="16" y2="16" />
        </svg>
        <span>{DEMO_DISCLAIMER}</span>
      </div>
    </div>
  );
}
