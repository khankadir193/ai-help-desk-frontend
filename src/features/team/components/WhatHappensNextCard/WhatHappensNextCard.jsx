import { Link } from 'react-router-dom';
import './WhatHappensNextCard.css';

export default function WhatHappensNextCard({ expiryDays = 7 }) {
  return (
    <section className="wh-next-card" aria-label="What happens next">
      <h2 className="wh-next-card__title">What happens next?</h2>

      <ol className="wh-next-card__list">
        <li className="wh-next-card__item">
          Your teammate receives a secure email invitation.
        </li>
        <li className="wh-next-card__item">
          They create an account and accept within {expiryDays} days.
        </li>
        <li className="wh-next-card__item">
          You can resend or revoke a pending invitation from Members.
        </li>
      </ol>

      <div className="wh-next-card__footer">
        <Link to="/team/roles" className="wh-next-card__link">
          Compare role permissions &rarr;
        </Link>
      </div>
    </section>
  );
}
