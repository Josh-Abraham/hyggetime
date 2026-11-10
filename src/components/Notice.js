import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import './Notice.scss';

// Short-lived message at the top of the screen
const Notice = ({ message, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 6000);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  return (
    <div className="notice" role="status">
      <span>{message}</span>
      <button onClick={onDismiss} aria-label="Dismiss">×</button>
    </div>
  );
};

Notice.propTypes = {
  message: PropTypes.string.isRequired,
  onDismiss: PropTypes.func.isRequired,
};

export default Notice;
