import { useState, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SettingsTabs from '../components/SettingsTabs';
import SettingsSaveBar from '../components/SettingsSaveBar';
import DiscardChangesModal from '../components/DiscardChangesModal';
import useUnsavedChangesGuard from '../hooks/useUnsavedChangesGuard';
import './SettingsLayout.css';

const TAB_HEADERS = {
  general: {
    title: 'General settings',
    subtitle: 'Manage your workspace details and regional defaults.',
  },
  profile: {
    title: 'Profile settings',
    subtitle: 'Update your personal information and keep your account secure.',
  },
  team: {
    title: 'Team settings',
    subtitle: 'Set team defaults and decide how new tickets reach your agents.',
  },
  notifications: {
    title: 'Notifications settings',
    subtitle: 'Choose how and when you hear about activity that matters to you.',
  },
  ai: {
    title: 'AI settings',
    subtitle: 'Configure AI assistance while keeping your team in control of every reply.',
  },
};

export default function SettingsLayout() {
  const location = useLocation();
  const [saveBarProps, setSaveBarProps] = useState(null);

  // Extract active tab from pathname (/settings/general -> general)
  const currentTab = useMemo(() => {
    const parts = location.pathname.split('/');
    const tab = parts[2];
    return TAB_HEADERS[tab] ? tab : 'general';
  }, [location.pathname]);

  const headerInfo = TAB_HEADERS[currentTab];

  const isDirty = Boolean(saveBarProps?.isDirty);

  const {
    showDiscardModal,
    requestNavigation,
    confirmDiscard,
    cancelDiscard,
  } = useUnsavedChangesGuard(isDirty);

  const outletContext = useMemo(
    () => ({
      setSaveBarProps,
    }),
    []
  );

  return (
    <div className="settings-page">
      <div className="settings-container">
        {/* Page Header */}
        <header className="settings-header">
          <h1 className="settings-header__title">{headerInfo.title}</h1>
          <p className="settings-header__subtitle">{headerInfo.subtitle}</p>
        </header>

        {/* Tab Bar */}
        <SettingsTabs onTabClick={requestNavigation} />

        {/* Tab Content / Active View */}
        <main className="settings-content">
          <Outlet context={outletContext} />
        </main>

        {/* Sticky Save Bar */}
        {saveBarProps && (
          <SettingsSaveBar
            isDirty={saveBarProps.isDirty}
            isSaving={saveBarProps.isSaving}
            isSuccess={saveBarProps.isSuccess}
            saveError={saveBarProps.saveError}
            onSave={saveBarProps.onSave}
            onCancel={saveBarProps.onCancel}
            disabled={saveBarProps.disabled}
          />
        )}

        {/* Unsaved Changes Confirmation Modal */}
        <DiscardChangesModal
          isOpen={showDiscardModal}
          onStay={cancelDiscard}
          onDiscard={confirmDiscard}
        />
      </div>
    </div>
  );
}

