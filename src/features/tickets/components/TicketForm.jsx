import { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useCategories, useAgentsWithCounts } from '../hooks/useTickets';
import CustomerFields from './CustomerFields';
import TagsInput from './TagsInput';
import WhatHappensNextCard from './WhatHappensNextCard';
import StatusPill from '../../../components/StatusPill/StatusPill';
import Icon from '../../../components/Icon/Icon';
import Spinner from '../../../components/feedback/Spinner/Spinner';
import { isValidEmail } from '../utils/ticketValidators';
import styles from './TicketForm.module.css';

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED'];
const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const SOURCE_OPTIONS = ['Email', 'Phone', 'Chat', 'Web', 'Portal'];

export default function TicketForm({
  mode = 'create',
  initialData = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
  onDirtyChange = null,
}) {
  const { user, role } = useAuth();
  const isCustomer = role === 'CUSTOMER';
  const isAgent = role === 'AGENT';
  const isEditMode = mode === 'edit';

  const firstInputRef = useRef(null);
  const subjectInputRef = useRef(null);

  const { data: categories = [] } = useCategories();
  const { data: agents = [] } = useAgentsWithCounts({ enabled: !isCustomer });

  // Filter agents for agent role: only Unassigned and Self are permitted
  const availableAgents = useMemo(() => {
    if (isCustomer) return [];
    if (isAgent) {
      const selfMatch = agents.filter((a) => String(a.id) === String(user?.id));
      if (selfMatch.length > 0) return selfMatch;
      if (user?.id) {
        return [{ id: String(user.id), name: user.name || 'Me', open_tickets_count: 0 }];
      }
      return [];
    }
    return agents;
  }, [agents, isAgent, isCustomer, user]);

  // Form State
  const initialCustomerName = initialData?.customer_name || (isCustomer ? user?.name : '') || '';
  const initialCustomerEmail = initialData?.customer_email || (isCustomer ? user?.email : '') || '';
  const initialCustomerId = initialData?.customer_id || (isCustomer ? user?.id : null);
  const initialTitle = initialData?.title || '';
  const initialDescription = initialData?.description || '';
  const initialStatus = initialData?.status || 'OPEN';
  const initialPriority = initialData?.priority || 'MEDIUM';
  const initialCategoryId = initialData?.category_id ? String(initialData.category_id) : '';
  const initialAssignedAgentId = initialData?.assigned_agent_id ? String(initialData.assigned_agent_id) : '';
  const initialSource = initialData?.source || (isCustomer ? 'Portal' : 'Email');
  const initialTags = initialData?.tags || [];

  const [customerName, setCustomerName] = useState(initialCustomerName);
  const [customerEmail, setCustomerEmail] = useState(initialCustomerEmail);
  const [customerId, setCustomerId] = useState(initialCustomerId);

  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [status, setStatus] = useState(initialStatus);
  const [priority, setPriority] = useState(initialPriority);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [assignedAgentId, setAssignedAgentId] = useState(initialAssignedAgentId);
  const [source, setSource] = useState(initialSource);
  const [tags, setTags] = useState(initialTags);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Default to first available category if not explicitly chosen
  const effectiveCategoryId = categoryId || (categories.length > 0 ? String(categories[0].id) : '');

  // Validation
  const isTitleValid = title.trim().length > 0 && title.length <= 150;
  const isDescValid = description.trim().length > 0;
  const isEmailValid = isValidEmail(customerEmail);
  const isNameValid = customerName.trim().length > 0;
  const isCategoryValid = Boolean(effectiveCategoryId);

  const isFormValid = isTitleValid && isDescValid && isEmailValid && isNameValid && isCategoryValid;

  // Calculate missing required fields count
  let missingCount = 0;
  if (!isNameValid) missingCount++;
  if (!isEmailValid) missingCount++;
  if (!isTitleValid) missingCount++;
  if (!isDescValid) missingCount++;
  if (!isCategoryValid) missingCount++;

  // Calculate dirty state
  const isDirty = useMemo(() => {
    return (
      title !== initialTitle ||
      description !== initialDescription ||
      customerName !== initialCustomerName ||
      customerEmail !== initialCustomerEmail ||
      effectiveCategoryId !== initialCategoryId ||
      assignedAgentId !== initialAssignedAgentId ||
      status !== initialStatus ||
      priority !== initialPriority ||
      source !== initialSource ||
      tags.length !== initialTags.length
    );
  }, [
    title,
    initialTitle,
    description,
    initialDescription,
    customerName,
    initialCustomerName,
    customerEmail,
    initialCustomerEmail,
    effectiveCategoryId,
    initialCategoryId,
    assignedAgentId,
    initialAssignedAgentId,
    status,
    initialStatus,
    priority,
    initialPriority,
    source,
    initialSource,
    tags.length,
    initialTags.length,
  ]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  // Initial focus on the first relevant input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isCustomer) {
        subjectInputRef.current?.focus();
      } else {
        firstInputRef.current?.focus();
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [isCustomer]);

  const selectedAgent = availableAgents.find((a) => String(a.id) === String(assignedAgentId));
  const assignedAgentName = selectedAgent ? selectedAgent.name : 'Unassigned';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!isFormValid) {
      setErrorMessage('Please complete all required fields.');
      return;
    }
    setErrorMessage('');
    setFieldErrors({});

    let payload;
    if (isCustomer) {
      payload = {
        title: title.trim(),
        description: description.trim(),
        category_id: effectiveCategoryId || null,
        source: 'Portal',
      };
    } else {
      payload = {
        title: title.trim(),
        description: description.trim(),
        category_id: effectiveCategoryId || null,
        priority,
        source: source || 'Email',
      };

      if (customerId) {
        payload.customer_id = customerId;
      } else {
        if (customerName.trim()) payload.customer_name = customerName.trim();
        if (customerEmail.trim()) payload.customer_email = customerEmail.trim();
      }

      if (tags && tags.length > 0) {
        payload.tags = tags;
      }
    }

    try {
      await onSubmit(payload, {
        status,
        assignedAgentId: assignedAgentId || null,
      });
    } catch (err) {
      if (err?.response?.status === 403) {
        setErrorMessage("You don't have permission to do that");
      } else if (err?.response?.status === 422 && Array.isArray(err?.response?.data?.errors)) {
        const errorMap = {};
        for (const item of err.response.data.errors) {
          if (item.field) {
            errorMap[item.field] = item.message;
          }
        }
        setFieldErrors(errorMap);
        setErrorMessage(err?.response?.data?.message || 'Validation failed. Please correct the highlighted errors.');
      } else {
        setErrorMessage(err?.response?.data?.message || err?.message || 'Failed to save ticket.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formLayout}>
      <div className={styles.gridColumns}>
        {/* Left Column: Customer & Request */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Customer & request</h3>

          <CustomerFields
            customerName={customerName}
            customerEmail={customerEmail}
            disabled={isCustomer}
            isEditMode={isEditMode}
            inputRef={firstInputRef}
            fieldErrors={fieldErrors}
            onChange={({ customerName: cName, customerEmail: cEmail, customerId: cId }) => {
              setCustomerName(cName);
              setCustomerEmail(cEmail);
              if (cId !== undefined) setCustomerId(cId);
            }}
          />

          {/* Subject */}
          <div className={styles.fieldCol}>
            <label htmlFor="subject-input" className={styles.label}>
              Subject <span className={styles.required}>*</span>
            </label>
            <input
              id="subject-input"
              ref={subjectInputRef}
              type="text"
              maxLength={150}
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.preventDefault();
              }}
              placeholder="e.g. Unable to download October invoice"
              required
            />
            <span className={styles.subtext}>
              {title.length > 0
                ? `Use a clear, specific subject. ${title.length} / 150 characters.`
                : 'Use a clear, specific subject. Maximum 150 characters.'}
            </span>
            {fieldErrors.title && (
              <span className={styles.fieldErrorText}>{fieldErrors.title}</span>
            )}
          </div>

          {/* Description */}
          <div className={styles.fieldCol}>
            <label htmlFor="description-input" className={styles.label}>
              Description <span className={styles.required}>*</span>
            </label>
            <textarea
              id="description-input"
              rows={5}
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Include what happened and the expected outcome..."
              required
            />
            <span className={styles.subtext}>
              {isEditMode
                ? 'Ticket description only. Existing conversation messages are preserved when you save.'
                : 'Include what happened and the expected outcome. Do not include passwords or card details.'}
            </span>
            {fieldErrors.description && (
              <span className={styles.fieldErrorText}>{fieldErrors.description}</span>
            )}
          </div>
        </div>

        {/* Right Column: Ticket Settings */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Ticket settings</h3>

          {/* Status & Priority Row (Staff only) */}
          {!isCustomer && (
            <div className={styles.settingsRow}>
              <div className={styles.fieldCol}>
                <label htmlFor="status-select" className={styles.label}>
                  Status <span className={styles.required}>*</span>
                </label>
                <div className={styles.pillSelectWrapper}>
                  <StatusPill status={status} />
                  <span className={styles.pillSelectChevron} aria-hidden="true">
                    <Icon name="chevron-down" size={16} />
                  </span>
                  <select
                    id="status-select"
                    className={styles.pillSelectNative}
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    aria-label="Status"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt.charAt(0) + opt.slice(1).toLowerCase().replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.fieldCol}>
                <label htmlFor="priority-select" className={styles.label}>
                  Priority <span className={styles.required}>*</span>
                </label>
                <div className={styles.pillSelectWrapper}>
                  <StatusPill priority={priority} />
                  <span className={styles.pillSelectChevron} aria-hidden="true">
                    <Icon name="chevron-down" size={16} />
                  </span>
                  <select
                    id="priority-select"
                    className={styles.pillSelectNative}
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    aria-label="Priority"
                  >
                    {PRIORITY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt.charAt(0) + opt.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
                {fieldErrors.priority && (
                  <span className={styles.fieldErrorText}>{fieldErrors.priority}</span>
                )}
              </div>
            </div>
          )}

          {/* Category */}
          <div className={styles.fieldCol}>
            <label htmlFor="category-select" className={styles.label}>
              Category <span className={styles.required}>*</span>
            </label>
            <select
              id="category-select"
              className={styles.select}
              value={effectiveCategoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="" disabled>Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {fieldErrors.category_id && (
              <span className={styles.fieldErrorText}>{fieldErrors.category_id}</span>
            )}
          </div>

          {/* Assigned Agent (Staff only) */}
          {!isCustomer && (
            <div className={styles.fieldCol}>
              <label htmlFor="agent-select" className={styles.label}>
                Assigned agent
              </label>
              <select
                id="agent-select"
                className={styles.select}
                value={assignedAgentId}
                onChange={(e) => setAssignedAgentId(e.target.value)}
              >
                <option value="">Unassigned</option>
                {availableAgents.map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    {ag.name} ({ag.open_tickets_count || 0} open)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Source (Staff only) */}
          {!isCustomer && (
            <div className={styles.fieldCol}>
              <label htmlFor="source-select" className={styles.label}>
                Source <span className={styles.required}>*</span>
              </label>
              <select
                id="source-select"
                className={styles.select}
                value={source}
                onChange={(e) => setSource(e.target.value)}
              >
                {SOURCE_OPTIONS.map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>
              {fieldErrors.source && (
                <span className={styles.fieldErrorText}>{fieldErrors.source}</span>
              )}
            </div>
          )}

          {/* Tags (Staff only) */}
          {!isCustomer && (
            <TagsInput tags={tags} onChange={(t) => setTags(t)} />
          )}

          {/* What happens next */}
          <WhatHappensNextCard
            isEditMode={isEditMode}
            assignedAgentName={assignedAgentName}
            isCustomer={isCustomer}
          />
        </div>
      </div>

      {errorMessage && <p className={styles.errorBanner}>{errorMessage}</p>}

      {/* Bottom Sticky Action Bar */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomStatus}>
          {isFormValid
            ? isEditMode
              ? 'All required fields are valid. Changes stay local until saved.'
              : 'All required fields are complete. Ready to create.'
            : `${missingCount} required ${missingCount === 1 ? 'field' : 'fields'} missing.`}
        </div>

        <div className={styles.bottomActions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting && <Spinner size="sm" />}
            <span>{isEditMode ? 'Save changes' : 'Create ticket'}</span>
          </button>
        </div>
      </div>
    </form>
  );
}
