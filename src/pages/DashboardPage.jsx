import KpiCard from '../components/KpiCard/KpiCard';
import TicketVolumeChart from '../components/TicketVolumeChart/TicketVolumeChart';
import PriorityDonut from '../components/PriorityDonut/PriorityDonut';
import ActivityList from '../components/ActivityList/ActivityList';
import TeamTable from '../components/TeamTable/TeamTable';
import Icon from '../components/Icon/Icon';
import { useAuth } from '../context/AuthContext';
import { userProfile, kpiData } from '../data/dashboardData';

export default function DashboardPage() {
  const { user } = useAuth();

  // Dynamic greeting based on current time
  const getGreeting = (name) => {
    const hour = new Date().getHours();
    let timeGreeting = 'Good morning';
    if (hour >= 12 && hour < 17) {
      timeGreeting = 'Good afternoon';
    } else if (hour >= 17) {
      timeGreeting = 'Good evening';
    }

    const firstName = name ? name.split(' ')[0] : 'Maya';
    return `${timeGreeting}, ${firstName}`;
  };

  const greetingTitle = getGreeting(user?.name);

  return (
    <main className="dashboard-content">
      {/* Greeting & Date Filter Row */}
      <section className="greeting-row" aria-label="Overview Header">
        <div className="greeting-row__left">
          <h2 className="greeting-row__title">{greetingTitle}</h2>
          <p className="greeting-row__subtext">{userProfile.subtext}</p>
        </div>

        <div className="greeting-row__actions">
          <button
            type="button"
            className="btn-date-range"
            aria-label="Filter by date range"
          >
            <Icon
              name="calendar"
              size={15}
              className="btn-date-range__icon"
            />
            <span>{userProfile.dateRange}</span>
            <Icon
              name="chevron-down"
              size={14}
              className="btn-date-range__chevron"
            />
          </button>

          <button
            type="button"
            className="btn-export"
            aria-label="Export dashboard data"
          >
            Export
          </button>
        </div>
      </section>

      {/* Row 1: KPI Cards Grid */}
      <section className="kpi-grid" aria-label="Key Performance Indicators">
        {kpiData.map((kpi) => (
          <KpiCard
            key={kpi.id}
            label={kpi.label}
            value={kpi.value}
            trend={kpi.trend}
            trendDirection={kpi.trendDirection}
            comparison={kpi.comparison}
          />
        ))}
      </section>

      {/* Row 2: Ticket Volume Bar Chart & Priority Donut */}
      <section
        className="dashboard-grid-row"
        aria-label="Volume and Priority Distribution"
      >
        <TicketVolumeChart />
        <PriorityDonut />
      </section>

      {/* Row 3: Recent Activity & Team Performance */}
      <section
        className="dashboard-grid-row"
        aria-label="Activity and Team Performance"
      >
        <ActivityList />
        <TeamTable />
      </section>
    </main>
  );
}

