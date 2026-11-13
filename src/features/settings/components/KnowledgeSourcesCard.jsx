import { Link } from 'react-router-dom';
import SettingsCard from './SettingsCard';
import { formatSyncTime } from '../utils/settingsFormatters';
import './KnowledgeSourcesCard.css';

export default function KnowledgeSourcesCard({ knowledgeSources }) {
  const articleCount = knowledgeSources?.article_count ?? 48;
  const lastSynced = formatSyncTime(knowledgeSources?.last_synced_at);

  return (
    <SettingsCard title="Knowledge sources">
      <div className="knowledge-sources__row">
        <div className="knowledge-sources__info">
          <span className="knowledge-sources__title">Published knowledge base</span>
          <span className="knowledge-sources__subtext">
            {articleCount} articles · Last synced {lastSynced}
          </span>
        </div>
        <span className="knowledge-sources__status">✓ Connected</span>
      </div>

      <div className="settings-divider" />

      <div className="knowledge-sources__footer">
        <span className="settings-muted-note">
          Draft articles and private notes are excluded.
        </span>
        <Link to="/knowledge-base" className="settings-link">
          Manage sources
        </Link>
      </div>
    </SettingsCard>
  );
}

