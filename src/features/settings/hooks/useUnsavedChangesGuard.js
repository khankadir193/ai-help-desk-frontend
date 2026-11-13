import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export function useUnsavedChangesGuard(isDirty) {
  const navigate = useNavigate();
  const [pendingPath, setPendingPath] = useState(null);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  // Guard browser reload / close tab
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Request tab navigation
  const requestNavigation = useCallback(
    (targetPath) => {
      if (isDirty) {
        setPendingPath(targetPath);
        setShowDiscardModal(true);
        return false;
      }
      navigate(targetPath);
      return true;
    },
    [isDirty, navigate]
  );

  const confirmDiscard = useCallback(() => {
    setShowDiscardModal(false);
    if (pendingPath) {
      navigate(pendingPath);
      setPendingPath(null);
    }
  }, [navigate, pendingPath]);

  const cancelDiscard = useCallback(() => {
    setShowDiscardModal(false);
    setPendingPath(null);
  }, []);

  return {
    showDiscardModal,
    requestNavigation,
    confirmDiscard,
    cancelDiscard,
  };
}

export default useUnsavedChangesGuard;

