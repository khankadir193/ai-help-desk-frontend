import { useRef, useState } from 'react';
import Avatar from '../../../components/Avatar/Avatar';
import { validateAvatarFile } from '../utils/settingsValidators';
import './ProfilePhotoRow.css';

export default function ProfilePhotoRow({
  avatarUrl,
  initials = 'MC',
  onUpload,
  isUploading = false,
}) {
  const fileInputRef = useRef(null);
  const [fileError, setFileError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateAvatarFile(file);
    if (error) {
      setFileError(error);
      return;
    }
    setFileError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await onUpload(reader.result);
      } catch (err) {
        setFileError(err?.response?.data?.message || err?.message || 'Failed to upload photo.');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="profile-photo-row">
      <div className="profile-photo-row__left">
        <Avatar
          src={avatarUrl}
          initials={initials}
          size="lg"
          className="profile-photo-row__avatar"
        />
        <div className="profile-photo-row__info">
          <span className="profile-photo-row__title">Profile photo</span>
          <span className="profile-photo-row__subtext">JPG or PNG · up to 2 MB</span>
          {fileError && <span className="profile-photo-row__error">{fileError}</span>}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        aria-label="Upload profile photo"
      />

      <button
        type="button"
        className="settings-btn-outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? 'Uploading...' : 'Change photo'}
      </button>
    </div>
  );
}

