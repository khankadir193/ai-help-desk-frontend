/**
 * IMPORTANT — DATA SOURCE DISCLOSURE (do not remove):
 * The backend (backend/src/app.js) currently exposes NO Knowledge Base API
 * (only auth, categories, tickets, comments, ai and dashboard exist).
 *
 * The content below is client-side SEED content that powers the Knowledge
 * Base UI in the meantime. It is NOT fetched from any backend endpoint and
 * no KB endpoint is being faked in `knowledgeBaseService.js`.
 *
 * When the backend ships real KB routes (e.g. GET /kb/articles,
 * GET /kb/articles/:slug), only `knowledgeBaseService.js` needs to change —
 * the shape of the data here was deliberately made API-like.
 */

export const KB_CATEGORIES = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Core concepts and setup guides for new users.',
    icon: 'sparkle',
    tint: 'primary',
  },
  {
    id: 'tickets',
    name: 'Tickets & Requests',
    description: 'Create, track, and resolve support tickets.',
    icon: 'ticket',
    tint: 'blue',
  },
  {
    id: 'account',
    name: 'Account & Profile',
    description: 'Manage your profile, password, and preferences.',
    icon: 'users',
    tint: 'success',
  },
  {
    id: 'ai-assistant',
    name: 'AI Assistant',
    description: 'AI-powered classification, summaries, and replies.',
    icon: 'target',
    tint: 'primary',
  },
  {
    id: 'troubleshooting',
    name: 'Troubleshooting',
    description: 'Fix common errors, sign-in problems, and access issues.',
    icon: 'alert-circle',
    tint: 'amber',
  },
];

export const KB_ARTICLES = [
  {
    slug: 'getting-started-with-ai-help-desk',
    title: 'Getting started with AI Help Desk',
    excerpt:
      'A guided tour of the workspace: dashboard, tickets, AI Assistant, and the Knowledge Base.',
    category: 'getting-started',
    readingTime: 4,
    updatedAt: '2026-10-30T09:00:00Z',
    tags: ['overview', 'workspace', 'onboarding'],
    featured: true,
    content: [
      {
        type: 'paragraph',
        text: 'AI Help Desk brings ticketing and AI assistance together in a single workspace. This quick tour explains what each area does and where to go first.',
      },
      {
        type: 'heading',
        text: 'Your workspace at a glance',
      },
      {
        type: 'list',
        items: [
          'Dashboard — live KPIs, ticket volume trends, and recent activity.',
          'Tickets — the full queue with search, filters, and a detail view for each ticket.',
          'AI Assistant — on-demand classification, summaries, and reply drafts for any ticket.',
          'Knowledge Base — searchable guides like this one.',
        ],
      },
      {
        type: 'heading',
        text: 'Suggested first steps',
      },
      {
        type: 'paragraph',
        text: 'Create or pick a ticket, ask the AI Assistant for a classification, then draft a reply and adjust the wording before sending. When you get stuck, search the Knowledge Base or raise a ticket in the usual way.',
      },
      {
        type: 'tip',
        text: 'Sign out and back in if a page looks stale after a long session — your session cookie may have simply expired.',
      },
    ],
  },
  {
    slug: 'navigating-the-dashboard',
    title: 'Navigating the dashboard and sidebar',
    excerpt:
      'Understand KPI cards, the ticket volume chart, activity feed, and how the sidebar collapse works.',
    category: 'getting-started',
    readingTime: 3,
    updatedAt: '2026-10-27T14:20:00Z',
    tags: ['dashboard', 'ui', 'navigation'],
    content: [
      {
        type: 'paragraph',
        text: 'The dashboard is the landing page after signing in. It summarizes the health of the help desk at a glance so you always know what needs attention.',
      },
      {
        type: 'heading',
        text: 'KPI cards',
      },
      {
        type: 'paragraph',
        text: 'The top row shows live counts such as open, in-progress, and resolved tickets. Each card also breaks the total down by priority so spikes are easy to spot.',
      },
      {
        type: 'heading',
        text: 'Sidebar controls',
      },
      {
        type: 'list',
        items: [
          'Use the collapse button to shrink the sidebar to icons — the choice is remembered on your device.',
          'On tablets (768–1023px) the sidebar auto-collapses; on phones it becomes a drawer behind the menu button.',
        ],
      },
    ],
  },
  {
    slug: 'creating-and-submitting-a-ticket',
    title: 'Creating and submitting a support ticket',
    excerpt:
      'Step-by-step guide to raising a ticket with the right title, description, and priority.',
    category: 'tickets',
    readingTime: 4,
    updatedAt: '2026-11-02T08:45:00Z',
    tags: ['tickets', 'create', 'workflow'],
    content: [
      {
        type: 'paragraph',
        text: 'Tickets are the unit of work in the help desk. A well-written ticket gets solved faster — the title and description are what the AI Assistant and your teammates will read first.',
      },
      {
        type: 'heading',
        text: 'How to create a ticket',
      },
      {
        type: 'list',
        items: [
          'Open the Tickets tab and select "New Ticket".',
          'Pick a category that matches the topic of your request.',
          'Write a short, specific title — "Cannot export dashboard CSV" beats "Export broken".',
          'Describe the issue, expected behavior, and any error message you saw.',
          'Choose a priority that reflects the impact on your work.',
        ],
      },
      {
        type: 'heading',
        text: 'What happens next',
      },
      {
        type: 'paragraph',
        text: 'The ticket lands in the queue with a "to-do" status. Support agents pick it up, may request more details in the comments thread, and move it through the status pipeline until it is resolved.',
      },
      {
        type: 'tip',
        text: 'Keep related issues in separate tickets so each can be tracked and resolved independently.',
      },
    ],
  },
  {
    slug: 'ticket-statuses-and-priorities',
    title: 'Understanding ticket statuses and priorities',
    excerpt:
      'What each status and priority level means, and how tickets move through the pipeline.',
    category: 'tickets',
    readingTime: 5,
    updatedAt: '2026-10-25T11:10:00Z',
    tags: ['statuses', 'priority', 'workflow'],
    featured: true,
    content: [
      {
        type: 'paragraph',
        text: 'Every ticket carries a status (where it is in the pipeline) and a priority (how urgently it needs attention). Knowing both makes the queue much easier to read.',
      },
      {
        type: 'heading',
        text: 'Ticket statuses',
      },
      {
        type: 'list',
        items: [
          'To-do — freshly submitted and waiting for an agent.',
          'In progress — an agent is actively working on the ticket.',
          'Resolved — a fix or answer was provided; the ticket is closed.',
        ],
      },
      {
        type: 'heading',
        text: 'Priority levels',
      },
      {
        type: 'list',
        items: [
          'Low — cosmetic issues or questions that can wait.',
          'Medium — a workaround exists but work is noticeably affected.',
          'High — key functionality is broken with no workaround.',
        ],
      },
      {
        type: 'paragraph',
        text: 'Priorities can be suggested automatically by AI — see the AI Assistant category for how suggestions are generated and how to override them.',
      },
    ],
  },
  {
    slug: 'ticket-comments-and-history',
    title: 'Using comments and history on tickets',
    excerpt:
      'Collaborate on tickets through comments and audit every status change with history.',
    category: 'tickets',
    readingTime: 3,
    updatedAt: '2026-10-22T16:30:00Z',
    tags: ['comments', 'collaboration', 'audit'],
    content: [
      {
        type: 'paragraph',
        text: 'The ticket detail view has two collaboration panels: Comments for conversation, and History for the audit trail of every change to the ticket.',
      },
      {
        type: 'heading',
        text: 'Comments',
      },
      {
        type: 'paragraph',
        text: 'Use comments to ask for details, share screenshots copied from your clipboard, or agree on a resolution before closing a ticket. All participants on the ticket can see and reply to them.',
      },
      {
        type: 'heading',
        text: 'History',
      },
      {
        type: 'paragraph',
        text: 'History records who changed what and when — status moves, priority bumps, and assignments. If a ticket went backwards (“in progress” → “to-do”), History will show why nobody remembers an IT ticket being moved.',
      },
    ],
  },
  {
    slug: 'ai-classification-and-reply-drafts',
    title: 'How AI classification and reply drafts work',
    excerpt:
      'Generate an AI ticket classification, a suggested priority, and a first-pass reply draft.',
    category: 'ai-assistant',
    readingTime: 5,
    updatedAt: '2026-10-29T10:05:00Z',
    tags: ['ai', 'classification', 'replies'],
    featured: true,
    content: [
      {
        type: 'paragraph',
        text: 'The AI Assistant can analyze any ticket and produce three artifacts: a classification, a suggested priority, and a reply draft. Each runs as a one-click action on the ticket you are viewing.',
      },
      {
        type: 'heading',
        text: 'Classification',
      },
      {
        type: 'paragraph',
        text: 'The AI reads the title, description, and comments, then maps the ticket to one of your existing categories with a confidence score. Treat it as a fast first pass — you can always correct the category.',
      },
      {
        type: 'heading',
        text: 'Priority suggestions',
      },
      {
        type: 'paragraph',
        text: 'The suggested priority weighs impact, urgency, and sentiment from the conversation. Accept it as a starting point and adjust for context the AI cannot know (like contractual SLAs).',
      },
      {
        type: 'heading',
        text: 'Reply drafts',
      },
      {
        type: 'paragraph',
        text: 'Reply drafts acknowledge the customer, restate the issue, and propose next steps or questions. Edit before sending — the draft is deliberately generic about company policy.',
      },
      {
        type: 'tip',
        text: 'Run a summary first when you are picking up a long ticket thread — it condenses the whole conversation in seconds.',
      },
    ],
  },
  {
    slug: 'ai-summarizing-tickets',
    title: 'Summarizing tickets automatically',
    excerpt:
      'Turn long ticket threads into a short summary so anyone can catch up instantly.',
    category: 'ai-assistant',
    readingTime: 3,
    updatedAt: '2026-10-20T09:40:00Z',
    tags: ['ai', 'summary', 'handover'],
    content: [
      {
        type: 'paragraph',
        text: 'Long comment threads slow handovers down. The AI summary condenses the entire conversation — description, comments, and status changes — into a few sentences.',
      },
      {
        type: 'heading',
        text: 'When to use it',
      },
      {
        type: 'list',
        items: [
          'Before reassigning a ticket to a new agent.',
          'When returning to your own ticket after days away.',
          'When briefing a manager who only needs the highlights.',
        ],
      },
      {
        type: 'paragraph',
        text: 'The summary is generated fresh each time you request it, so it will include the latest comments. Regenerate after new activity to keep it current.',
      },
    ],
  },
  {
    slug: 'update-profile-and-password',
    title: 'Updating your profile and password',
    excerpt:
      'Change your display name, review your role, and reset your password safely.',
    category: 'account',
    readingTime: 3,
    updatedAt: '2026-10-18T13:15:00Z',
    tags: ['profile', 'password', 'security'],
    content: [
      {
        type: 'paragraph',
        text: 'Your profile controls how your name appears on tickets, comments, and activity entries across the workspace.',
      },
      {
        type: 'heading',
        text: 'Changing your details',
      },
      {
        type: 'list',
        items: [
          'Open the user menu in the top bar to see your account details.',
          'Roles are managed by administrators and cannot be self-assigned.',
        ],
      },
      {
        type: 'heading',
        text: 'Password guidelines',
      },
      {
        type: 'list',
        items: [
          'Use at least 12 characters mixing words, numbers, and symbols.',
          'Never reuse passwords from other services.',
          'If you suspect your account is compromised, sign out (or ask an admin to force sign-termination) and reset your password immediately.',
        ],
      },
      {
        type: 'tip',
        text: 'Sessions are cookie-based (HttpOnly) — signing out invalidates the server-side session, not just your browser.',
      },
    ],
  },
  {
    slug: 'troubleshooting-login-session-expired',
    title: 'Troubleshooting "Session expired" and login issues',
    excerpt:
      'Why you get logged out, how session expiry works, and how to get back in.',
    category: 'troubleshooting',
    readingTime: 4,
    updatedAt: '2026-11-01T07:55:00Z',
    tags: ['auth', 'session', 'login'],
    content: [
      {
        type: 'paragraph',
        text: 'For security, sessions expire after a period of inactivity. When that happens the app notifies you and redirects to the sign-in page instead of failing silently.',
      },
      {
        type: 'heading',
        text: 'Symptoms and fixes',
      },
      {
        type: 'list',
        items: [
          'You were mid-action and got redirected to sign-in — the session expired. Sign in again; nothing you had saved was lost, but unsaved text in forms may be gone.',
          '“Invalid credentials” — check for password manager autofill inserting an old password.',
          'You can sign in but pages say you lack access — your account role has limited permissions; ask an admin what you should have.',
        ],
      },
      {
        type: 'heading',
        text: 'Nothing works?',
      },
      {
        type: 'paragraph',
        text: 'Clear cookies for the help desk domain and try again. If sign-in still fails repeatedly, raise a ticket — this usually indicates a server-side account or environment issue that only support can fix.',
      },
    ],
  },
  {
    slug: 'troubleshooting-missing-tickets-permissions',
    title: "Why can't I see some tickets? A permissions guide",
    excerpt:
      'How roles (customer, agent, admin) filter the ticket list, categories, and actions.',
    category: 'troubleshooting',
    readingTime: 4,
    updatedAt: '2026-10-24T15:25:00Z',
    tags: ['permissions', 'roles', 'visibility'],
    content: [
      {
        type: 'paragraph',
        text: 'Ticket visibility is role-based. If a ticket is missing from your list, it is almost always intentional scoping rather than lost data.',
      },
      {
        type: 'heading',
        text: 'What each role sees',
      },
      {
        type: 'list',
        items: [
          'Customers — only tickets they created.',
          'Agents — the full ticket queue plus assignment and status tools.',
          'Admins — everything, including category management for the whole workspace.',
        ],
      },
      {
        type: 'heading',
        text: 'Still think something is wrong?',
      },
      {
        type: 'paragraph',
        text: 'Double-check that no search text or status filter is active — filters persist until cleared. If a ticket you authored is genuinely missing, raise it with your category name and rough creation time and support will trace it in the audit history.',
      },
    ],
  },
];

export const getKbCategory = (id) => KB_CATEGORIES.find((category) => category.id === id) ?? null;

/** Map a KB category's `tint` to design-token background/text colors. */
export const getKbCategoryColors = (category) => {
  switch (category?.tint) {
    case 'blue':
      return { background: 'var(--color-blue-tint)', text: 'var(--color-blue)' };
    case 'success':
      return {
        background: 'var(--color-success-tint)',
        text: 'var(--color-success-text)',
      };
    case 'amber':
      return {
        background: 'var(--color-amber-tint)',
        text: 'var(--color-amber-text)',
      };
    case 'primary':
    default:
      return {
        background: 'var(--color-primary-tint)',
        text: 'var(--color-primary)',
      };
  }
};

export const KB_CATEGORY_LABELS = Object.fromEntries(
  KB_CATEGORIES.map((category) => [category.id, category.name])
);
