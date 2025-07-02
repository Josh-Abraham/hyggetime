import React from 'react';
import { InputLabel, FormControl, Select, Input } from '@mui/material';
import DropdownSelect from '../DropdownSelect';
import PropTypes from 'prop-types';
import { ThemeProvider } from '@mui/material/styles';
import './LayeredSelect.scss';
import { theme } from '../constants';
import { v4 as uuidv4 } from 'uuid';

const LayeredSelect = ({ 
  dropdownOptions = [], 
  dropdownName = '', 
  handleChange, 
  currentSelection 
}) => {
  const createMenuItems = () => {
    const options = dropdownOptions.map((obj) => {
      const currentSelectionExists = currentSelection in obj.children ? currentSelection : '';
      const menuItem = (
        <DropdownSelect
          id='innerDD'
          key={uuidv4()}
          dropdownOptions={obj.children}
          dropdownName={obj.value}
          handleChange={handleChange}
          currentSelection={currentSelectionExists}
        />
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
            value={currentSelection || ''}
            input={<Input />}
            onChange={handleSelectChange}
          >
            {menuOptions}
          </Select>
        </FormControl>
      </ThemeProvider>
    </div>
  );
};

LayeredSelect.propTypes = {
  dropdownOptions: PropTypes.array,
  dropdownName: PropTypes.string,
  handleChange: PropTypes.func.isRequired,
  currentSelection: PropTypes.string.isRequired
};

export default LayeredSelect;