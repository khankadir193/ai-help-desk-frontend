import { Link } from 'react-router-dom';
import styles from './AiKbRecommendations.module.css';

export default function AiKbRecommendations({ ticket }) {
  // Derive relevant recommendations from category / subject
  const categoryName = (ticket?.category_name || '').toLowerCase();
  
  const recommendations = [
    {
      id: 1,
      title: categoryName.includes('billing')
        ? 'Duplicate subscription charges'
        : 'Common troubleshooting steps',
      path: '/knowledge-base/articles',
    },
    {
      id: 2,
      title: categoryName.includes('billing')
        ? 'Refund eligibility & timelines'
        : 'Service availability & SLA policies',
      path: '/knowledge-base/articles',
    },
  ];

  return (
    <div className={styles.container} aria-label="AI-recommended KB articles">
      <h4 className={styles.heading}>AI-recommended KB articles</h4>
      <div className={styles.linksList}>
        {recommendations.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={styles.articleLink}
          >
            <span className={styles.arrowIcon}>↗</span>
            <span className={styles.linkText}>{item.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
