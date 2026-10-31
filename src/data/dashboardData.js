export const userProfile = {
  name: 'Maya Chen',
  role: 'Support Manager',
  initials: 'MC',
  greeting: 'Good morning, Maya',
  subtext: "Here's what's happening across support today.",
  dateRange: 'Oct 23 – Oct 29, 2026',
};

export const kpiData = [
  {
    id: 'kpi-open',
    label: 'Open tickets',
    value: '128',
    trend: '+4.2%',
    trendDirection: 'neutral',
    comparison: 'vs last 7 days',
  },
  {
    id: 'kpi-unassigned',
    label: 'Unassigned',
    value: '17',
    trend: '+6',
    trendDirection: 'down',
    comparison: 'vs last 7 days',
  },
  {
    id: 'kpi-in-progress',
    label: 'In progress',
    value: '54',
    trend: '−2.0%',
    trendDirection: 'neutral',
    comparison: 'vs last 7 days',
  },
  {
    id: 'kpi-resolved',
    label: 'Resolved',
    value: '312',
    trend: '+12.4%',
    trendDirection: 'up',
    comparison: 'vs last 7 days',
  },
  {
    id: 'kpi-first-response',
    label: 'Avg. first response',
    value: '12m 40s',
    trend: '−8.1%',
    trendDirection: 'up', // Positive for customer satisfaction/efficiency
    comparison: 'vs last 7 days',
  },
  {
    id: 'kpi-resolution',
    label: 'Avg. resolution',
    value: '4h 05m',
    trend: '−5.6%',
    trendDirection: 'up', // Positive for customer satisfaction/efficiency
    comparison: 'vs last 7 days',
  },
];

export const ticketVolumeData = [
  { day: 'Mon', created: 62, resolved: 55 },
  { day: 'Tue', created: 72, resolved: 64 },
  { day: 'Wed', created: 58, resolved: 60 },
  { day: 'Thu', created: 80, resolved: 72 },
  { day: 'Fri', created: 66, resolved: 70 },
  { day: 'Sat', created: 34, resolved: 38 },
  { day: 'Sun', created: 29, resolved: 31 },
];

export const priorityData = [
  {
    id: 'urgent',
    label: 'Urgent',
    count: 12,
    percentage: '9%',
    color: '#DC2626', // Red
  },
  {
    id: 'high',
    label: 'High',
    count: 28,
    percentage: '22%',
    color: '#F59E0B', // Amber
  },
  {
    id: 'medium',
    label: 'Medium',
    count: 46,
    percentage: '36%',
    color: '#3B82F6', // Blue
  },
  {
    id: 'low',
    label: 'Low',
    count: 42,
    percentage: '33%',
    color: '#94A3B8', // Slate
  },
];

export const recentActivityData = [
  {
    id: 'act-1',
    actor: 'Liam Park',
    action: 'replied to',
    ticketId: 'TCK-2047',
    subtitle: 'Cannot reset password — email never arrives',
    status: 'in-progress',
    statusLabel: 'In Progress',
    time: '2m ago',
    avatar: 'LP',
    avatarType: 'text',
  },
  {
    id: 'act-2',
    actor: 'Sarah Johnson',
    action: 'opened',
    ticketId: 'TCK-2048',
    subtitle: 'Duplicate charge on Pro subscription',
    status: 'open',
    statusLabel: 'Open',
    time: '10m ago',
    avatar: 'SJ',
    avatarType: 'text',
  },
  {
    id: 'act-3',
    actor: 'Priya Nair',
    action: 'resolved',
    ticketId: 'TCK-2041',
    subtitle: 'Invoice needs VAT number updated',
    status: 'resolved',
    statusLabel: 'Resolved',
    time: '1h ago',
    avatar: 'PN',
    avatarType: 'text',
  },
  {
    id: 'act-4',
    actor: 'AI Assistant',
    action: 'flagged',
    ticketId: 'TCK-2044 as Urgent',
    subtitle: 'API returns 502 on /v1/tickets',
    status: 'open',
    statusLabel: 'Open',
    time: '2h ago',
    avatar: 'sparkle',
    avatarType: 'icon',
  },
];

export const teamPerformanceData = [
  {
    id: 'team-1',
    name: 'Maya Chen',
    avatar: 'MC',
    solved: 42,
    resp: '11m',
    csat: 4.8,
  },
  {
    id: 'team-2',
    name: 'Priya Nair',
    avatar: 'PN',
    solved: 35,
    resp: '9m',
    csat: 4.9,
  },
  {
    id: 'team-3',
    name: 'Liam Park',
    avatar: 'LP',
    solved: 38,
    resp: '14m',
    csat: 4.6,
  },
  {
    id: 'team-4',
    name: 'Jonas Weber',
    avatar: 'JW',
    solved: 29,
    resp: '18m',
    csat: 4.5,
  },
];

