import { useState } from 'react';
import './HelpfulFeedback.css';

export default function HelpfulFeedback({
  helpfulRate = 94,
  ratingsCount = 182,
  userVote = null,
  onVote,
  isVoting = false,
}) {
  const [voted, setVoted] = useState(userVote);

  const handleVote = (isHelpful) => {
    if (isVoting) return;
    const voteKey = isHelpful ? 'yes' : 'no';
    setVoted(voteKey);
    onVote?.(isHelpful);
  };

  return (
    <div className="kb-feedback-section">
      <div className="kb-feedback-section__left">
        <h3 className="kb-feedback-section__title">Was this article helpful?</h3>
        <p className="kb-feedback-section__meta">
          {helpfulRate}% found this helpful · {ratingsCount} ratings
        </p>
      </div>

      <div className="kb-feedback-section__actions">
        {voted ? (
          <div className="kb-feedback-section__thanks" role="status">
            <span>Thank you for your feedback!</span>
          </div>
        ) : (
          <>
            <button
              type="button"
              className="kb-feedback-btn"
              onClick={() => handleVote(true)}
              disabled={isVoting}
              aria-label="Yes, this article was helpful"
            >
              Yes
            </button>
            <button
              type="button"
              className="kb-feedback-btn"
              onClick={() => handleVote(false)}
              disabled={isVoting}
              aria-label="No, this article was not helpful"
            >
              No
            </button>
          </>
        )}
      </div>
    </div>
  );
}

