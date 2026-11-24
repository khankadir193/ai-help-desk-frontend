import { useRef } from 'react';
import Icon from '../../../components/Icon/Icon';
import { validateAttachment, formatFileSize } from '../utils/ticketValidators';
import styles from './AttachmentDropzone.module.css';

export default function AttachmentDropzone({ attachments = [], onChange, isEditMode = false }) {
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    const newAttachments = [...attachments];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateAttachment(file);
      if (validation.valid) {
        newAttachments.push({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
        });
      } else {
        alert(validation.error);
      }
    }
    onChange(newAttachments);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleRemove = (index) => {
    const updated = attachments.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  return (
    <div className={styles.container}>
      <label className={styles.fieldLabel}>Attachments (optional)</label>

      {/* Dropzone */}
      <div
        className={styles.dropzone}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className={styles.dropzoneContent}>
          <div className={styles.paperclipCircle}>
            <Icon name="paperclip" size={16} />
          </div>
          <div className={styles.textGroup}>
            <span className={styles.mainPrompt}>Choose files or drag them here</span>
            <span className={styles.subPrompt}>PDF, JPG or PNG · up to 10 MB each</span>
          </div>
        </div>

        <button
          type="button"
          className={styles.browseBtn}
          onClick={() => fileInputRef.current?.click()}
        >
          Browse
        </button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className={styles.hiddenInput}
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Existing / uploaded file chips */}
      {attachments.length > 0 && (
        <div className={styles.filesList}>
          {attachments.map((file, idx) => (
            <div key={idx} className={styles.fileItem}>
              <div className={styles.fileMeta}>
                <Icon name="paperclip" size={15} className={styles.fileIcon} />
                <div className={styles.fileText}>
                  <span className={styles.fileName}>
                    {file.name} · {formatFileSize(file.size)}
                  </span>
                  <span className={styles.fileStatus}>
                    {isEditMode ? 'Customer attachment · retained on save' : 'Ready to upload on submit'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => handleRemove(idx)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
