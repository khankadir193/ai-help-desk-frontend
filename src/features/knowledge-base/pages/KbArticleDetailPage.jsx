import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs';
import KbHeader from '../components/KbHeader/KbHeader';
import ArticleBody from '../components/ArticleBody/ArticleBody';
import HelpfulFeedback from '../components/HelpfulFeedback/HelpfulFeedback';
import ArticleInfoCard from '../components/ArticleInfoCard/ArticleInfoCard';
import TableOfContents from '../components/TableOfContents/TableOfContents';
import RelatedArticles from '../components/RelatedArticles/RelatedArticles';
import { useArticle } from '../hooks/useArticle';
import './KbArticleDetailPage.css';

export default function KbArticleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [copySuccess, setCopySuccess] = useState(false);

  const {
    article,
    isLoading,
    isError,
    error,
    relatedArticles,
    voteHelpful,
    isVoting,
  } = useArticle(id);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // Fallback
    }
  };

  const breadcrumbItems = [
    { label: 'Knowledge Base', path: '/knowledge-base' },
    { label: 'All articles', path: '/knowledge-base/articles' },
    { label: article?.article_id || id || 'Article' },
  ];

  if (isLoading) {
    return (
      <main className="kb-page kb-detail-page" aria-label="Article Details">
        <div className="kb-detail-loading">Loading article...</div>
      </main>
    );
  }

  if (isError || !article) {
    return (
      <main className="kb-page kb-detail-page" aria-label="Article Details">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="kb-error-box" role="alert">
          <div className="kb-error-text">
            <strong>Article not found:</strong> {error?.message || 'Could not locate this article.'}
          </div>
          <button
            type="button"
            className="kb-primary-btn"
            onClick={() => navigate('/knowledge-base/articles')}
          >
            Back to articles
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="kb-page kb-detail-page" aria-label={`Article: ${article.title}`}>
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Header */}
      <KbHeader
        title={article.title}
        subtitle={article.summary}
        actions={
          <>
            <button
              type="button"
              className="kb-secondary-btn"
              onClick={handleCopyLink}
              aria-label="Copy article link"
            >
              {copySuccess ? 'Copied!' : 'Copy link'}
            </button>
            <button
              type="button"
              className="kb-primary-btn"
              onClick={() => navigate(`/knowledge-base/articles/${article.article_id || article.id}/edit`)}
            >
              Edit article
            </button>
          </>
        }
      />

      {/* 2-Column Grid (2fr / 1fr) */}
      <div className="kb-detail-grid">
        {/* Left Column: Body + Feedback */}
        <div className="kb-detail-grid__left">
          <div className="kb-detail-main-card">
            <ArticleBody article={article} />
            <HelpfulFeedback
              helpfulRate={article.helpful_rate}
              ratingsCount={article.ratings_count}
              userVote={article.user_vote}
              onVote={voteHelpful}
              isVoting={isVoting}
            />
          </div>
        </div>

        {/* Right Column: Info + TOC + Related */}
        <div className="kb-detail-grid__right">
          <ArticleInfoCard article={article} />
          <TableOfContents content={article.content} />
          <RelatedArticles articles={relatedArticles} />
        </div>
      </div>
    </main>
  );
}

