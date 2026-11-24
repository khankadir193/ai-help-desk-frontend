import styles from './TagsInput.module.css';

export default function TagsInput({ tags = [], onChange }) {
  const tagsString = Array.isArray(tags) ? tags.join(', ') : (tags || '');

  const handleChange = (e) => {
    const raw = e.target.value;
    const parsed = raw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    onChange(parsed);
  };

  return (
    <div className={styles.container}>
      <label htmlFor="tags-input-field" className={styles.label}>
        Tags (optional)
      </label>
      <input
        id="tags-input-field"
        type="text"
        className={styles.input}
        value={tagsString}
        onChange={handleChange}
        placeholder="invoice, pro-subscription"
      />
      <span className={styles.subtext}>Separate tags with commas.</span>
    </div>
  );
}
