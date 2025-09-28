import React from 'react';
import styles from './Popup.module.css';

export default function Popup({ type, message, onClose }) {
  return (
    <div className={styles.popupOverlay}>
      <div className={`${styles.popup} ${styles[type]}`}>
        <div className={styles.popupContent}>
          <div className={styles.popupIcon}>
            {type === 'success' ? '✓' : '✕'}
          </div>
          <h4 className={styles.popupTitle}>
            {type === 'success' ? 'Success!' : 'Error!'}
          </h4>
          <p className={styles.popupMessage}>{message}</p>
          <button 
            className={`btn ${styles.popupButton}`}
            onClick={onClose}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
