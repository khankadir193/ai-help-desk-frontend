import { useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useCategories, useAgentsWithCounts } from '../hooks/useTickets';
import CustomerFields from './CustomerFields';
import AttachmentDropzone from './AttachmentDropzone';
import TagsInput from './TagsInput';
import WhatHappensNextCard from './WhatHappensNextCard';
import StatusPill from '../../../components/StatusPill/StatusPill';
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
}) {
  const { user, role } = useAuth();
  const isCustomer = role === 'CUSTOMER';
  const isEditMode = mode === 'edit';

  const { data: categories = [] } = useCategories();
  const { data: agents = [] } = useAgentsWithCounts({ enabled: !isCustomer });

  // Form State
  const [customerName, setCustomerName] = useState(
    initialData?.customer_name || (isCustomer ? user?.name : '') || ''
  );
  const [customerEmail, setCustomerEmail] = useState(
    initialData?.customer_email || (isCustomer ? user?.email : '') || ''
  );
  const [customerId, setCustomerId] = useState(
    initialData?.customer_id || (isCustomer ? user?.id : null)
  );

  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [status, setStatus] = useState(initialData?.status || 'OPEN');
  const [priority, setPriority] = useState(initialData?.priority || 'MEDIUM');
  const [categoryId, setCategoryId] = useState(
    initialData?.category_id ? String(initialData.category_id) : ''
  );
  const [assignedAgentId, setAssignedAgentId] = useState(
    initialData?.assigned_agent_id ? String(initialData.assigned_agent_id) : ''
  );
  const [source, setSource] = useState(initialData?.source || 'Email');
  const [tags, setTags] = useState(initialData?.tags || []);
  const [attachments, setAttachments] = useState(initialData?.attachments || []);
  const [errorMessage, setErrorMessage] = useState('');

  // Default to first available category if not explicitly chosen
  const effectiveCategoryId = categoryId || (categories.length > 0 ? String(categories[0].id) : '');

  // Validation
  const isTitleValid = title.trim().length > 0 && title.length <= 150;
  const isDescValid = description.trim().length > 0;
  const isEmailValid = isValidEmail(customerEmail);
  const isNameValid = customerName.trim().length > 0;
  const isCategoryValid = Boolean(effectiveCategoryId);

  const isFormValid = isTitleValid && isDescValid && isEmailValid && isNameValid && isCategoryValid;

  const selectedAgent = agents.find((a) => String(a.id) === String(assignedAgentId));
  const assignedAgentName = selectedAgent ? selectedAgent.name : 'Unassigned';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      setErrorMessage('Please complete all required fields.');
      return;
    }
    setErrorMessage('');

    const payload = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      category_id: effectiveCategoryId,
      assigned_agent_id: assignedAgentId ? assignedAgentId : null,
      source,
      tags,
      attachments,
      customer_id: customerId || undefined,
      customer_name: customerName.trim(),
      customer_email: customerEmail.trim(),
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      setErrorMessage(err?.response?.data?.message || err?.message || 'Failed to save ticket.');
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
              type="text"
              maxLength={150}
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Unable to download October invoice"
              required
            />
            <span className={styles.subtext}>
              {isEditMode
                ? `Use a clear, specific subject. ${title.length} / 150 characters.`
                : 'Use a clear, specific subject. Maximum 150 characters.'}
            </span>
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
          </div>

          {/* Attachments */}
          <AttachmentDropzone
            attachments={attachments}
            isEditMode={isEditMode}
            onChange={(newAtts) => setAttachments(newAtts)}
          />
        </div>

        {/* Right Column: Ticket Settings */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Ticket settings</h3>

          {/* Status & Priority Row */}
          <div className={styles.settingsRow}>
            <div className={styles.fieldCol}>
              <label htmlFor="status-select" className={styles.label}>
                Status <span className={styles.required}>*</span>
              </label>
              <div className={styles.selectWrapper}>
                <select
                  id="status-select"
                  className={styles.select}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={isCustomer}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.charAt(0) + opt.slice(1).toLowerCase().replace('_', ' ')}
                    </option>
                  ))}
                </select>
                <div className={styles.pillPreview}>
                  <StatusPill status={status} />
                </div>
              </div>
            </div>

            <div className={styles.fieldCol}>
              <label htmlFor="priority-select" className={styles.label}>
                Priority <span className={styles.required}>*</span>
              </label>
              <div className={styles.selectWrapper}>
                <select
                  id="priority-select"
                  className={styles.select}
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  {PRIORITY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.charAt(0) + opt.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
                <div className={styles.pillPreview}>
                  <StatusPill priority={priority} />
                </div>
              </div>
            </div>
          </div>

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
          </div>

          {/* Assigned Agent */}
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
                {agents.map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    {ag.name} ({ag.open_tickets_count || 0} open)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Source */}
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
          </div>

          {/* Tags */}
          <TagsInput tags={tags} onChange={(t) => setTags(t)} />

          {/* What happens next */}
          <WhatHappensNextCard
            isEditMode={isEditMode}
            assignedAgentName={assignedAgentName}
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
            : 'Please complete all required fields (*).'}
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
