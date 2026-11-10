import './Icon.css';

export default function Icon({
  name,
  size = 20,
  strokeWidth = 1.75,
  className = '',
  ...props
}) {
  const iconProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: `lucide-icon ${className}`.trim(),
    ...props,
  };

  switch (name) {
    case 'sparkle':
      return (
        <svg {...iconProps}>
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
          <path d="M5 3v4" />
          <path d="M19 17v4" />
          <path d="M3 5h4" />
          <path d="M17 19h4" />
        </svg>
      );

    case 'dashboard':
    case 'home':
      return (
        <svg {...iconProps}>
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );

    case 'ticket':
      return (
        <svg {...iconProps}>
          <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
          <path d="M13 5v2" />
          <path d="M13 17v2" />
          <path d="M13 11v2" />
        </svg>
      );

    case 'book-open':
      return (
        <svg {...iconProps}>
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      );

    case 'trending-up':
      return (
        <svg {...iconProps}>
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline points="16 7 22 7 22 13" />
        </svg>
      );

    case 'users':
      return (
        <svg {...iconProps}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );

    case 'sliders':
      return (
        <svg {...iconProps}>
          <line x1="4" x2="4" y1="21" y2="14" />
          <line x1="4" x2="4" y1="10" y2="3" />
          <line x1="12" x2="12" y1="21" y2="12" />
          <line x1="12" x2="12" y1="8" y2="3" />
          <line x1="20" x2="20" y1="21" y2="16" />
          <line x1="20" x2="20" y1="12" y2="3" />
          <line x1="1" x2="7" y1="14" y2="14" />
          <line x1="9" x2="15" y1="8" y2="8" />
          <line x1="17" x2="23" y1="16" y2="16" />
        </svg>
      );

    case 'search':
      return (
        <svg {...iconProps}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" x2="16.65" y1="21" y2="16.65" />
        </svg>
      );

    case 'bell':
      return (
        <svg {...iconProps}>
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
      );

    case 'chevron-down':
      return (
        <svg {...iconProps}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      );

    case 'chevron-left':
      return (
        <svg {...iconProps}>
          <polyline points="15 18 9 12 15 6" />
        </svg>
      );

    case 'chevron-right':
      return (
        <svg {...iconProps}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      );

    case 'calendar':
      return (
        <svg {...iconProps}>
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
          <line x1="16" x2="16" y1="2" y2="6" />
          <line x1="8" x2="8" y1="2" y2="6" />
          <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
      );

    case 'more-vertical':
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      );

    case 'arrow-up':
      return (
        <svg {...iconProps}>
          <line x1="12" x2="12" y1="19" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
      );

    case 'arrow-down':
      return (
        <svg {...iconProps}>
          <line x1="12" x2="12" y1="5" y2="19" />
          <polyline points="19 12 12 19 5 12" />
        </svg>
      );

    case 'minus':
      return (
        <svg {...iconProps}>
          <line x1="5" x2="19" y1="12" y2="12" />
        </svg>
      );

    case 'play':
      return (
        <svg {...iconProps} fill="currentColor">
          <polygon points="6 4 18 12 6 20 6 4" />
        </svg>
      );

    case 'check':
      return (
        <svg {...iconProps}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );

    case 'menu':
      return (
        <svg {...iconProps}>
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
      );

    case 'x':
      return (
        <svg {...iconProps}>
          <line x1="18" x2="6" y1="6" y2="18" />
          <line x1="6" x2="18" y1="6" y2="18" />
        </svg>
      );

    case 'plus':
      return (
        <svg {...iconProps}>
          <line x1="12" x2="12" y1="5" y2="19" />
          <line x1="5" x2="19" y1="12" y2="12" />
        </svg>
      );

    case 'tag':
      return (
        <svg {...iconProps}>
          <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
          <path d="M7 7h.01" />
        </svg>
      );

    case 'edit':
    case 'pencil':
      return (
        <svg {...iconProps}>
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          <path d="m15 5 4 4" />
        </svg>
      );

    case 'power':
      return (
        <svg {...iconProps}>
          <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
          <line x1="12" x2="12" y1="2" y2="12" />
        </svg>
      );

    case 'alert-circle':
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" x2="12" y1="8" y2="12" />
          <line x1="12" x2="12.01" y1="16" y2="16" />
        </svg>
      );

    case 'rotate-cw':
    case 'refresh':
      return (
        <svg {...iconProps}>
          <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
          <polyline points="21 3 21 8 16 8" />
        </svg>
      );

    case 'filter':
      return (
        <svg {...iconProps}>
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
      );

    case 'check-circle':
      return (
        <svg {...iconProps}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );

    /* Used by the AI Assistant feature (src/features/aiAssistant) */
    case 'target':
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      );

    /* Used by the Knowledge Base feature (src/features/knowledge-base).
       Purely additive cases — no other module behavior is affected. */
    case 'clock':
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );

    case 'arrow-right':
      return (
        <svg {...iconProps}>
          <line x1="5" x2="19" y1="12" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      );

    case 'lightbulb':
      return (
        <svg {...iconProps}>
          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
          <path d="M9 18h6" />
          <path d="M10 22h4" />
        </svg>
      );

    case 'file-text':
      return (
        <svg {...iconProps}>
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
          <path d="M16 13H8" />
          <path d="M16 17H8" />
          <path d="M10 9H8" />
        </svg>
      );

    case 'copy':
      return (
        <svg {...iconProps}>
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </svg>
      );

    case 'credit-card':
      return (
        <svg {...iconProps}>
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
      );

    case 'user':
      return (
        <svg {...iconProps}>
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );

    case 'rocket':
      return (
        <svg {...iconProps}>
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
          <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
      );

    case 'plug':
      return (
        <svg {...iconProps}>
          <path d="M12 22v-5" />
          <path d="M9 8V2" />
          <path d="M15 8V2" />
          <path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z" />
        </svg>
      );

    case 'grip-vertical':
      return (
        <svg {...iconProps}>
          <circle cx="9" cy="12" r="1" fill="currentColor" />
          <circle cx="9" cy="5" r="1" fill="currentColor" />
          <circle cx="9" cy="19" r="1" fill="currentColor" />
          <circle cx="15" cy="12" r="1" fill="currentColor" />
          <circle cx="15" cy="5" r="1" fill="currentColor" />
          <circle cx="15" cy="19" r="1" fill="currentColor" />
        </svg>
      );

    case 'arrow-up-right':
    case 'external-link':
      return (
        <svg {...iconProps}>
          <line x1="7" x2="17" y1="17" y2="7" />
          <polyline points="7 7 17 7 17 17" />
        </svg>
      );

    case 'square':
      return (
        <svg {...iconProps}>
          <rect width="18" height="18" x="3" y="3" rx="2" />
        </svg>
      );

    case 'download':
      return (
        <svg {...iconProps}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" x2="12" y1="15" y2="3" />
        </svg>
      );

    case 'bold':
      return (
        <svg {...iconProps}>
          <path d="M6 12h9a4 4 0 0 1 0 8H6v-8Z" />
          <path d="M6 4h8a4 4 0 0 1 0 8H6V4Z" />
        </svg>
      );

    case 'italic':
      return (
        <svg {...iconProps}>
          <line x1="19" x2="10" y1="4" y2="4" />
          <line x1="14" x2="5" y1="20" y2="20" />
          <line x1="15" x2="9" y1="4" y2="20" />
        </svg>
      );

    case 'underline':
      return (
        <svg {...iconProps}>
          <path d="M6 4v6a6 6 0 0 0 12 0V4" />
          <line x1="4" x2="20" y1="20" y2="20" />
        </svg>
      );

    case 'heading':
    case 'h2':
      return (
        <svg {...iconProps}>
          <path d="M4 12h8" />
          <path d="M4 18V6" />
          <path d="M12 18V6" />
          <path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1" />
        </svg>
      );

    case 'list':
      return (
        <svg {...iconProps}>
          <line x1="8" x2="21" y1="6" y2="6" />
          <line x1="8" x2="21" y1="12" y2="12" />
          <line x1="8" x2="21" y1="18" y2="18" />
          <line x1="3" x2="3.01" y1="6" y2="6" strokeWidth={strokeWidth * 1.5} />
          <line x1="3" x2="3.01" y1="12" y2="12" strokeWidth={strokeWidth * 1.5} />
          <line x1="3" x2="3.01" y1="18" y2="18" strokeWidth={strokeWidth * 1.5} />
        </svg>
      );

    case 'list-ordered':
      return (
        <svg {...iconProps}>
          <line x1="10" x2="21" y1="6" y2="6" />
          <line x1="10" x2="21" y1="12" y2="12" />
          <line x1="10" x2="21" y1="18" y2="18" />
          <path d="M4 6h1v4" />
          <path d="M4 10h2" />
          <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
        </svg>
      );

    case 'link':
      return (
        <svg {...iconProps}>
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      );

    case 'undo':
      return (
        <svg {...iconProps}>
          <path d="M3 7v6h6" />
          <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
        </svg>
      );

    case 'redo':
      return (
        <svg {...iconProps}>
          <path d="M21 7v6h-6" />
          <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
        </svg>
      );

    default:
      return null;
  }
}

