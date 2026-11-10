import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import kbService from '../services/kbService';
import { formatTime } from '../utils/kbUtils';
import { KB_KEYS } from './useKbOverview';

export function useArticleEditor({ mode = 'create', initialArticle = null, defaultAuthorId = null }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: initialArticle?.title || '',
    summary: initialArticle?.summary || '',
    content: initialArticle?.content || '',
    category_id: initialArticle?.category_id || '',
    visibility: initialArticle?.visibility || 'PUBLIC',
    tags: Array.isArray(initialArticle?.tags) ? initialArticle.tags.join(', ') : (initialArticle?.tags || ''),
    author_id: initialArticle?.author_id || defaultAuthorId || '',
  });

  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(
    initialArticle?.draft_saved_at ? formatTime(initialArticle.draft_saved_at) : null
  );

  // Sync when initialArticle loads
  useEffect(() => {
    if (initialArticle) {
      const activeTitle = initialArticle.has_draft_revision
        ? initialArticle.draft_title
        : initialArticle.title;
      const activeSummary = initialArticle.has_draft_revision
        ? initialArticle.draft_summary
        : initialArticle.summary;
      const activeContent = initialArticle.has_draft_revision
        ? initialArticle.draft_content
        : initialArticle.content;

      setFormData({
        title: activeTitle || '',
        summary: activeSummary || '',
        content: activeContent || '',
        category_id: initialArticle.category_id || '',
        visibility: initialArticle.visibility || 'PUBLIC',
        tags: Array.isArray(initialArticle.tags) ? initialArticle.tags.join(', ') : '',
        author_id: initialArticle.author_id || defaultAuthorId || '',
      });

      if (initialArticle.draft_saved_at) {
        setLastSavedAt(formatTime(initialArticle.draft_saved_at));
      }
      setIsDirty(false);
    }
  }, [initialArticle, defaultAuthorId]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Browser beforeunload dirty guard
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Save Draft function
  const saveDraft = useCallback(async (explicit = true) => {
    if (!formData.title?.trim()) {
      if (explicit) {
        setErrors((prev) => ({ ...prev, title: 'Article title is required to save a draft.' }));
      }
      return null;
    }

    try {
      setIsSaving(true);
      let saved;
      if (mode === 'edit' && initialArticle?.id) {
        saved = await kbService.updateArticle(initialArticle.id, {
          title: formData.title,
          summary: formData.summary,
          content: formData.content,
          category_id: formData.category_id ? Number(formData.category_id) : undefined,
          visibility: formData.visibility,
          tags: formData.tags,
          author_id: formData.author_id ? Number(formData.author_id) : undefined,
        });
      } else {
        // Create draft
        saved = await kbService.createArticle({
          title: formData.title,
          summary: formData.summary,
          content: formData.content,
          category_id: formData.category_id ? Number(formData.category_id) : 1,
          visibility: formData.visibility,
          tags: formData.tags,
          status: 'DRAFT',
          author_id: formData.author_id ? Number(formData.author_id) : undefined,
        });
      }

      setLastSavedAt(formatTime(new Date()));
      setIsDirty(false);
      queryClient.invalidateQueries({ queryKey: KB_KEYS.all });
      return saved;
    } catch (err) {
      console.error('Save draft failed:', err);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [formData, initialArticle, mode, queryClient]);

  // Debounced Autosave (2 seconds after last change when dirty and has title)
  const autosaveTimerRef = useRef(null);
  useEffect(() => {
    if (isDirty && formData.title?.trim()) {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = setTimeout(() => {
        saveDraft(false);
      }, 2000);
    }
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [isDirty, formData, saveDraft]);

  // Publish function
  const publishArticle = async () => {
    const newErrors = {};
    if (!formData.title?.trim()) {
      newErrors.title = 'Article title is required';
    }
    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsPublishing(true);
      let targetId = initialArticle?.id;

      if (mode === 'create' || !targetId) {
        // Save first as draft
        const created = await kbService.createArticle({
          title: formData.title,
          summary: formData.summary,
          content: formData.content,
          category_id: Number(formData.category_id),
          visibility: formData.visibility,
          tags: formData.tags,
          status: 'DRAFT',
          author_id: formData.author_id ? Number(formData.author_id) : undefined,
        });
        targetId = created.id;
      } else {
        // Update draft revision first
        await kbService.updateArticle(targetId, {
          title: formData.title,
          summary: formData.summary,
          content: formData.content,
          category_id: Number(formData.category_id),
          visibility: formData.visibility,
          tags: formData.tags,
          author_id: formData.author_id ? Number(formData.author_id) : undefined,
        });
      }

      // Then publish
      const published = await kbService.publishArticle(targetId);
      setIsDirty(false);
      queryClient.invalidateQueries({ queryKey: KB_KEYS.all });
      navigate(`/knowledge-base/articles/${published.article_id || targetId}`);
    } catch (err) {
      console.error('Publish failed:', err);
      setErrors((prev) => ({ ...prev, submit: err.message || 'Failed to publish article.' }));
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirmDiscard = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmDiscard) return;
    }
    navigate(initialArticle?.article_id ? `/knowledge-base/articles/${initialArticle.article_id}` : '/knowledge-base/articles');
  };

  return {
    formData,
    errors,
    isDirty,
    isSaving,
    isPublishing,
    lastSavedAt,
    handleChange,
    saveDraft,
    publishArticle,
    handleCancel,
  };
}

export default useArticleEditor;

