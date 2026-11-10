import React from 'react';
import PropTypes from 'prop-types';
import './IconButton.scss';

const IconButton = ({ title, onClick, children }) => (
  <button className="icon-button" onClick={onClick} title={title} aria-label={title}>
    {children}
  </button>
);

IconButton.propTypes = {
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default IconButton;
