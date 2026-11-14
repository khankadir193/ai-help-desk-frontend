/**
 * Module-level navigation guard for the Team feature.
 *
 * Lets TeamTabs consult the active page (e.g. the Invite form's
 * unsaved-changes dialog) before in-app navigation, without prop drilling
 * through TeamLayout. Non-Team routes are unaffected.
 */

let guardFn = null;

/**
 * Register the guard callback. Returns an unregister cleanup function
 * (suitable as a useEffect cleanup).
 */
export function setTeamNavGuard(fn) {
  guardFn = typeof fn === 'function' ? fn : null;
  return () => {
    if (guardFn === fn) guardFn = null;
  };
}

/**
 * Ask the active Team page whether navigation may proceed.
 * Returns true when no guard is registered or the guard allows it.
 */
export function confirmTeamNav() {
  return guardFn ? guardFn() : true;
}
