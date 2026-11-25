/**
 * Demo accounts for recruiter testing and visitor preview.
 * Display and auto-fill only; never hardcoded into auth logic.
 */

export const DEMO_ACCOUNTS = [
  {
    role: 'CUSTOMER',
    roleLabel: 'Customer',
    email: 'customer@example.com',
    password: 'khanCustomer@543',
    description: 'Create and track your own tickets',
  },
  {
    role: 'AGENT',
    roleLabel: 'Agent',
    email: 'agent@example.com',
    password: 'khanAgent@543',
    description: 'Handle assigned tickets and replies',
  },
  {
    role: 'ADMIN',
    roleLabel: 'Admin',
    email: 'admin@example.com',
    password: 'khanAdmin@543',
    description: 'Full access, team and settings',
  },
];

export const DEMO_DISCLAIMER = 'Demo accounts for testing only';

/**
 * Gate check for displaying demo accounts.
 * Defaults to true for portfolio/demo builds; disable by setting VITE_SHOW_DEMO_ACCOUNTS=false.
 */
export const isDemoAccountsEnabled = () => {
  return import.meta.env.VITE_SHOW_DEMO_ACCOUNTS !== 'false';
};
