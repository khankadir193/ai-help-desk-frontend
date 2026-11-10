import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs';
import KbHeader from '../components/KbHeader/KbHeader';
import ArticleEditorForm from '../components/ArticleEditorForm/ArticleEditorForm';
import PublishingPanel from '../components/PublishingPanel/PublishingPanel';
import AiWritingHelp from '../components/AiWritingHelp/AiWritingHelp';
import Modal from '../../../components/ui/Modal/Modal';
import { useArticle } from '../hooks/useArticle';
import { useArticleEditor } from '../hooks/useArticleEditor';
import { useKbCategories } from '../hooks/useCategories';
import kbService from '../services/kbService';
import './KbArticleEditorPage.css';

export default function KbArticleEditorPage({ mode: propMode }) {
  const { id } = useParams();
  const mode = propMode || (id ? 'edit' : 'create');

  // Fetch article if in edit mode
  const { article: initialArticle, isLoading: isLoadingArticle } = useArticle(id);
  const { categories = [], authors = [] } = useKbCategories();

  const [aiSuggestion, setAiSuggestion] = useState(
    'Clarify that pending authorizations are not duplicate payments and provide expected bank clearance timelines.'
  );
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const {
    formData,
    errors,
    isSaving,
    isPublishing,
    lastSavedAt,
    handleChange,
    saveDraft,
    publishArticle,
    handleCancel,
  } = useArticleEditor({
    mode,
    initialArticle: mode === 'edit' ? initialArticle : null,
    defaultAuthorId: authors[0]?.id,
  });

  // Fetch AI suggestion when title or content changes (debounced)
  useEffect(() => {
    if (formData.title && formData.title.length > 5) {
      const timer = setTimeout(async () => {
        try {
          setIsLoadingAi(true);
          const res = await kbService.generateAiSuggestion({
            title: formData.title,
            summary: formData.summary,
            content: formData.content,
          });
          if (res?.suggestion) {
            setAiSuggestion(res.suggestion);
          }
        } catch {
          // Keep default
        } finally {
          setIsLoadingAi(false);
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [formData.title, formData.summary, formData.content]);

  const handleInsertSuggestion = (suggestionText) => {
    const tipHtml = `
<div class="kb-info-callout">
  <div class="kb-info-callout__title">Important Note</div>
  <p>${suggestionText}</p>
</div>`;
    handleChange('content', (formData.content || '') + tipHtml);
  };

  const isEdit = mode === 'edit';
  const articleIdDisplay = initialArticle?.article_id || 'KB-104';

  const breadcrumbItems = isEdit
    ? [
        { label: 'Knowledge Base', path: '/knowledge-base' },
        { label: articleIdDisplay, path: `/knowledge-base/articles/${articleIdDisplay}` },
        { label: 'Edit article' },
      ]
    : [
        { label: 'Knowledge Base', path: '/knowledge-base' },
        { label: 'All articles', path: '/knowledge-base/articles' },
        { label: 'Create article' },
      ];

  const headerTitle = isEdit ? 'Edit article' : 'Create article';
  const headerSubtitle = isEdit
    ? `${initialArticle?.title || 'Article'} · Draft revision of a published article.`
    : `${articleIdDisplay} · New draft · Your changes are not public.`;

  if (isEdit && isLoadingArticle) {
    return (
      <main className="kb-page kb-editor-page" aria-label="Loading Editor">
        <div className="kb-detail-loading">Loading article editor...</div>
      </main>
    );
  }

  return (
    <main className="kb-page kb-editor-page" aria-label={headerTitle}>
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Header */}
      <KbHeader
        title={headerTitle}
        subtitle={headerSubtitle}
        actions={
          <>
            <button
              type="button"
              className="kb-secondary-btn"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className="kb-secondary-btn"
              onClick={() => saveDraft(true)}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save draft'}
            </button>
            <button
              type="button"
              className="kb-primary-btn"
              onClick={publishArticle}
              disabled={isPublishing}
            >
              {isPublishing
                ? 'Publishing...'
                : isEdit
                ? 'Publish changes'
                : 'Publish article'}
            </button>
          </>
        }
      />

      {/* 2-Column Grid (2fr / 1fr) */}
      <div className="kb-editor-grid">
        {/* Left Column: Editor Form */}
        <div className="kb-editor-grid__left">
          <ArticleEditorForm
            mode={mode}
            initialArticle={initialArticle}
            formData={formData}
            errors={errors}
            onChange={handleChange}
            lastSavedAt={lastSavedAt}
            onOpenPreview={() => setIsPreviewModalOpen(true)}
          />
        </div>

        {/* Right Column: Publishing Panel + AI Writing Help */}
        <div className="kb-editor-grid__right">
          <PublishingPanel
            status={isEdit ? (initialArticle?.status || 'DRAFT') : 'DRAFT'}
            categories={categories}
            selectedCategory={formData.category_id}
            onCategoryChange={(catId) => handleChange('category_id', catId)}
            categoryError={errors.category_id}
            visibility={formData.visibility}
            onVisibilityChange={(vis) => handleChange('visibility', vis)}
            tags={formData.tags}
            onTagsChange={(tagsVal) => handleChange('tags', tagsVal)}
            ownerName={initialArticle?.author_name || 'Maya Chen'}
          />

          <AiWritingHelp
            suggestion={aiSuggestion}
            isLoading={isLoadingAi}
            onInsertSuggestion={handleInsertSuggestion}
          />
        </div>
      </div>

      {/* Preview Modal */}
      {isPreviewModalOpen && (
        <Modal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          title={`Preview: ${formData.title || 'Untitled article'}`}
          maxWidth="760px"
        >
          <div className="kb-preview-modal-body">
            <h1 className="kb-preview-modal-title">{formData.title || 'Untitled article'}</h1>
            {formData.summary && (
              <p className="kb-preview-modal-summary">{formData.summary}</p>
            )}
            <div
              className="kb-article-content"
              dangerouslySetInnerHTML={{ __html: formData.content || '<p>No content provided.</p>' }}
            />
          </div>
        </Modal>
      )}
    </main>
  );
}
