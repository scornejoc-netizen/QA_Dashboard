import styles from './KpiCard.module.css';

const KpiCard = ({ title, value, subtext, color = 'white' }) => {
  return (
    <div className={styles.card} style={{ borderLeft: `4px solid ${color}` }}>
      <span className={styles.title}>{title}</span>
      <span className={styles.value}>{value}</span>
      {subtext && <span className={styles.subtext} style={{ color }}>{subtext}</span>}
    </div>
  );
};

export default KpiCard;