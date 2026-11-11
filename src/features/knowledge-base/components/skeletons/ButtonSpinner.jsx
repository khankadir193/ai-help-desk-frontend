export default function ButtonSpinner({ label = 'Working' }) {
  return (
    <>
      <span className="kb-btn-spinner" aria-hidden="true" />
      <span className="kb-sr-only">{label}</span>
    </>
  );
}
