export const TIMEZONES = [
  { value: '(UTC-08:00) Pacific Time', label: '(UTC-08:00) Pacific Time' },
  { value: '(UTC-07:00) Mountain Time', label: '(UTC-07:00) Mountain Time' },
  { value: '(UTC-06:00) Central Time', label: '(UTC-06:00) Central Time' },
  { value: '(UTC-05:00) Eastern Time', label: '(UTC-05:00) Eastern Time' },
  { value: '(UTC+00:00) UTC', label: '(UTC+00:00) UTC' },
  { value: '(UTC+01:00) Central European Time', label: '(UTC+01:00) Central European Time' },
  { value: '(UTC+05:30) India Standard Time', label: '(UTC+05:30) India Standard Time' },
  { value: '(UTC+08:00) Singapore Time', label: '(UTC+08:00) Singapore Time' },
  { value: '(UTC+09:00) Japan Standard Time', label: '(UTC+09:00) Japan Standard Time' },
  { value: '(UTC+10:00) Australian Eastern Time', label: '(UTC+10:00) Australian Eastern Time' },
];

export const LANGUAGES = [
  { value: 'English (United States)', label: 'English (United States)' },
  { value: 'English (United Kingdom)', label: 'English (United Kingdom)' },
  { value: 'Spanish (Español)', label: 'Spanish (Español)' },
  { value: 'French (Français)', label: 'French (Français)' },
  { value: 'German (Deutsch)', label: 'German (Deutsch)' },
  { value: 'Japanese (日本語)', label: 'Japanese (日本語)' },
  { value: 'Portuguese (Português)', label: 'Portuguese (Português)' },
];

export const TICKET_PRIORITIES = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

export const ASSIGNMENT_METHODS = [
  { value: 'ROUND_ROBIN', label: 'Round robin' },
  { value: 'LEAST_BUSY', label: 'Least busy agent' },
  { value: 'MANUAL_TRIAGE', label: 'Manual triage' },
];

export const FALLBACK_ACTIONS = [
  { value: 'UNASSIGNED_QUEUE', label: 'Keep in unassigned queue' },
  { value: 'TEAM_LEAD', label: 'Assign to team lead' },
  { value: 'AUTO_RESOLVE_WARN', label: 'Queue with high priority' },
];

export const EMAIL_DIGEST_OPTIONS = [
  { value: 'OFF', label: 'Off' },
  { value: 'DAILY_8AM', label: 'Daily at 8:00 AM' },
  { value: 'WEEKLY', label: 'Weekly on Monday' },
];

export const AI_REPLY_TONES = [
  { value: 'FRIENDLY_PROFESSIONAL', label: 'Friendly & professional' },
  { value: 'DIRECT_CONCISE', label: 'Direct & concise' },
  { value: 'EMPATHETIC_SUPPORTIVE', label: 'Empathetic & supportive' },
  { value: 'FORMAL_TECHNICAL', label: 'Formal & technical' },
];

export const AI_DRAFT_MODES = [
  { value: 'ON_REQUEST', label: 'When an agent requests them' },
  { value: 'AUTOMATIC', label: 'Automatically on new tickets' },
  { value: 'OFF', label: 'Off' },
];

export const DEFAULT_NOTIFICATION_EVENTS = [
  {
    id: 'ticket_assigned',
    label: 'Ticket assigned to me',
    description: 'New assignments and reassignments',
    in_app: true,
    email: true,
  },
  {
    id: 'customer_replies',
    label: 'Customer replies',
    description: 'Replies on tickets assigned to me',
    in_app: true,
    email: true,
  },
  {
    id: 'mentions_notes',
    label: 'Mentions & internal notes',
    description: 'When a teammate mentions me',
    in_app: true,
    email: true,
  },
  {
    id: 'urgent_sla',
    label: 'Urgent tickets & SLA risk',
    description: 'Time-sensitive alerts for my team',
    in_app: true,
    email: false,
  },
  {
    id: 'ai_draft',
    label: 'AI draft ready for review',
    description: 'AI-labeled suggestions on my tickets',
    in_app: true,
    email: false,
  },
];

