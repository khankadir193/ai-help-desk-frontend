import Checkbox from './Checkbox';
import './NotificationMatrix.css';

export default function NotificationMatrix({
  matrix = [],
  inAppChannelEnabled = true,
  emailChannelEnabled = true,
  onChangeRow,
  disabled = false,
}) {
  return (
    <div className="notif-matrix">
      <div className="notif-matrix__header">
        <div className="notif-matrix__col notif-matrix__col--event">Event</div>
        <div className="notif-matrix__col notif-matrix__col--center">In-app</div>
        <div className="notif-matrix__col notif-matrix__col--center">Email</div>
      </div>

      <div className="notif-matrix__body">
        {matrix.map((row) => {
          const inAppDisabled = disabled || !inAppChannelEnabled;
          const emailDisabled = disabled || !emailChannelEnabled;

          return (
            <div key={row.id} className="notif-matrix__row">
              <div className="notif-matrix__event-cell">
                <span className="notif-matrix__event-title">{row.label}</span>
                <span className="notif-matrix__event-desc">{row.description}</span>
              </div>

              <div
                className="notif-matrix__cell notif-matrix__cell--center"
                title={
                  !inAppChannelEnabled
                    ? 'Turn on In-app notifications to choose events'
                    : undefined
                }
              >
                <Checkbox
                  checked={inAppChannelEnabled && Boolean(row.in_app)}
                  onChange={(checked) => onChangeRow(row.id, 'in_app', checked)}
                  disabled={inAppDisabled}
                  ariaLabel={`${row.label}, In-app`}
                />
              </div>

              <div
                className="notif-matrix__cell notif-matrix__cell--center"
                title={
                  !emailChannelEnabled
                    ? 'Turn on Email notifications to choose events'
                    : undefined
                }
              >
                <Checkbox
                  checked={emailChannelEnabled && Boolean(row.email)}
                  onChange={(checked) => onChangeRow(row.id, 'email', checked)}
                  disabled={emailDisabled}
                  ariaLabel={`${row.label}, Email`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

