import React from 'react';
import { InputLabel, MenuItem, FormControl, Select } from '@mui/material';
import PropTypes from 'prop-types';
import { ThemeProvider } from '@mui/material/styles';
import './DropdownSelect.scss';
import { theme } from '../constants';

const DropdownSelect = ({ 
  dropdownOptions = [], 
  dropdownName = '', 
  handleChange, 
  currentSelection 
}) => {
  const createMenuItems = () => {
    const options = dropdownOptions.map((obj) => {
      const menuItem = (
        <MenuItem
          id={obj}
          key={obj}
          value={obj}
        >
          {`${obj}`}
        </MenuItem>
      );
      return menuItem;
    });
    return options;
  };

  const handleSelectChange = (e) => {
    const newSelection = e.target.value;
    handleChange(newSelection);
  };

  const menuOptions = createMenuItems();
  
  return (
    <div className='dropdownWrapper'>
      <ThemeProvider theme={theme}>
        <FormControl className='dropdownSelect'>
          <InputLabel 
            id={`Dropdown_${dropdownName}`} 
            color="primary"
            style={{ fontSize: '16px' }}
          >
            {dropdownName}
          </InputLabel>
          <Select
            id={`Dropdown_Select_${dropdownName}`}
            value={currentSelection}
            onChange={handleSelectChange}
          >
            {menuOptions}
          </Select>
        </FormControl>
      </ThemeProvider>
    </div>
  );
};

DropdownSelect.propTypes = {
  dropdownOptions: PropTypes.array,
  dropdownName: PropTypes.string,
  handleChange: PropTypes.func.isRequired,
  currentSelection: PropTypes.string.isRequired
};

export default DropdownSelect;