import SkeletonRegion from './SkeletonRegion';
import SkeletonBlock from './SkeletonBlock';
import SkeletonText from './SkeletonText';

const TOOLBAR_WIDTHS = [64, 30, 30, 30, 56];

export default function KbEditorSkeleton() {
  return (
    <SkeletonRegion label="Loading article editor...">
      <div className="kb-editor-grid">
        <div className="kb-editor-grid__left">
          <div className="kb-editor-form-card">
            <div className="kb-revision-banner">
              <SkeletonBlock height={16} width="80%" />
            </div>

            <div className="kb-form-field">
              <SkeletonBlock width={90} height={13} style={{ marginBottom: 6 }} />
              <SkeletonBlock height={40} radius={8} />
            </div>

            <div className="kb-form-field">
              <SkeletonBlock width={60} height={13} style={{ marginBottom: 6 }} />
              <SkeletonBlock height={40} radius={8} />
            </div>

            <div className="kb-rich-editor">
              <div className="kb-editor-toolbar" aria-hidden="true">
                {TOOLBAR_WIDTHS.map((width, i) => (
                  <SkeletonBlock key={i} width={width} height={30} radius={4} />
                ))}
              </div>
              <div className="kb-rich-editor__content">
                <SkeletonText lines={8} lineWidths={['100%', '100%', '96%', '100%', '78%', '100%', '64%', '88%']} height={25} gap={14} />
              </div>
              <div className="kb-rich-editor__footer">
                <SkeletonBlock width={90} height={12} />
                <SkeletonBlock width={70} height={12} />
              </div>
            </div>

            <div className="kb-editor-subfooter">
              <SkeletonBlock width={160} height={13} />
              <SkeletonBlock width={88} height={36} radius={8} />
            </div>
          </div>
        </div>

        <div className="kb-editor-grid__right">
          <div className="kb-publishing-panel">
            <SkeletonBlock width={140} height={15} style={{ marginBottom: 14 }} />
            <div className="kb-publishing-panel__badge-row">
              <SkeletonBlock width={90} height={22} radius={999} />
            </div>
            <div className="kb-publishing-panel__field">
              <SkeletonBlock width={64} height={13} style={{ marginBottom: 6 }} />
              <SkeletonBlock height={40} radius={8} />
            </div>
            <div className="kb-publishing-panel__field">
              <SkeletonBlock width={70} height={13} style={{ marginBottom: 6 }} />
              <SkeletonBlock height={40} radius={8} />
            </div>
            <div className="kb-publishing-panel__field">
              <SkeletonBlock width={40} height={13} style={{ marginBottom: 6 }} />
              <SkeletonBlock height={40} radius={8} />
            </div>
            <div className="kb-publishing-panel__owner">
              <SkeletonBlock width={80} height={12} style={{ marginBottom: 4 }} />
              <SkeletonBlock width={90} height={14} />
            </div>
          </div>

          <div className="kb-ai-card">
            <div className="kb-ai-card__header">
              <SkeletonBlock width={120} height={14} />
              <SkeletonBlock width={60} height={20} radius={999} />
            </div>
            <div className="kb-ai-bubble">
              <SkeletonText lines={3} lineWidths={['100%', '100%', '70%']} height={13} gap={8} />
            </div>
            <SkeletonBlock height={16} style={{ marginBottom: 16 }} />
            <div className="kb-ai-card__actions">
              <SkeletonBlock width={96} height={36} radius={8} />
              <SkeletonBlock width={66} height={36} radius={8} />
            </div>
          </div>
        </div>
      </div>
    </SkeletonRegion>
  );
}
