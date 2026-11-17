export const navigationSections = [
  {
    title: 'SUPPORT',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'dashboard',
        path: '/',
        // Feature keys drive role-based access (see src/lib/accessControl.js).
        // Items the role cannot use render muted with a lock in the Sidebar.
        feature: 'dashboard',
      },
      {
        id: 'tickets',
        label: 'Tickets',
        icon: 'ticket',
        path: '/tickets',
        badge: 24,
        feature: 'tickets',
      },
      {
        id: 'ai-assistant',
        label: 'AI Assistant',
        icon: 'sparkle',
        path: '/ai-assistant',
        feature: 'ai-assistant',
      },
      {
        id: 'knowledge-base',
        label: 'Knowledge Base',
        icon: 'book-open',
        path: '/knowledge-base',
        feature: 'knowledge-base',
      },
    ],
  },
  {
    title: 'MANAGE',
    items: [
      {
        id: 'reports',
        label: 'Reports',
        icon: 'trending-up',
        path: '/reports',
        feature: 'reports',
      },
      {
        id: 'team',
        label: 'Team',
        icon: 'users',
        path: '/team',
        feature: 'team',
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: 'sliders',
        path: '/settings',
        feature: 'settings',
      },
    ],
  },
];
