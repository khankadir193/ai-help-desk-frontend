import { useState } from 'react';
import SettingsCard from './SettingsCard';
import Toggle from './Toggle';
import './ChannelsCard.css';

export default function ChannelsCard({
  channels = {},
  onChangeChannel,
  disabled = false,
}) {
  const [desktopPermission, setDesktopPermission] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'denied';
  });

  const handleDesktopToggle = async (nextVal) => {
    if (disabled) return;
    if (nextVal) {
      if ('Notification' in window) {
        try {
          const perm = await Notification.requestPermission();
          setDesktopPermission(perm);
          if (perm === 'granted') {
            onChangeChannel('desktop', true);
          } else {
            onChangeChannel('desktop', false);
          }
        } catch {
          onChangeChannel('desktop', false);
        }
      }
    } else {
      onChangeChannel('desktop', false);
    }
  };

  const isDesktopGranted = desktopPermission === 'granted';
  const desktopSubtext = isDesktopGranted
    ? channels.desktop
      ? 'Enabled · Browser permission active'
      : 'Paused'
    : 'Off · Browser permission not granted.';

  return (
    <SettingsCard title="Notification channels">
      {/* In-app */}
      <div className="channels-card__row">
        <div className="channels-card__info">
          <span className="channels-card__title">In-app notifications</span>
          <span className="channels-card__desc">
            Show updates in the notification center.
          </span>
        </div>
        <Toggle
          checked={Boolean(channels.in_app)}
          onChange={(v) => onChangeChannel('in_app', v)}
          disabled={disabled}
          ariaLabel="In-app notifications"
        />
      </div>

      <div className="settings-divider" />

      {/* Email */}
      <div className="channels-card__row">
        <div className="channels-card__info">
          <span className="channels-card__title">Email notifications</span>
          <span className="channels-card__desc">
            Deliver selected events to your inbox.
          </span>
        </div>
        <Toggle
          checked={Boolean(channels.email)}
          onChange={(v) => onChangeChannel('email', v)}
          disabled={disabled}
          ariaLabel="Email notifications"
        />
      </div>

      <div className="settings-divider" />

      {/* Desktop */}
      <div className="channels-card__row">
        <div className="channels-card__info">
          <span className="channels-card__title">Desktop notifications</span>
          <span className="channels-card__desc">{desktopSubtext}</span>
        </div>
        <Toggle
          checked={isDesktopGranted && Boolean(channels.desktop)}
          onChange={handleDesktopToggle}
          disabled={disabled}
          ariaLabel="Desktop notifications"
        />
      </div>
    </SettingsCard>
  );
}
