import React, { useState, useCallback, useMemo } from 'react';
import { InputLabel, FormControl, Select, Input } from '@mui/material';
import DropdownSelect from '../DropdownSelect';
import PropTypes from 'prop-types';
import { ThemeProvider } from '@mui/material/styles';
import './LayeredSelect.scss';
import { theme } from '../constants';
import { v4 as uuidv4 } from 'uuid';

// Fixed DropdownSelect wrapper to prevent state conflicts
const StableDropdownSelect = ({ 
  dropdownOptions, 
  dropdownName, 
  handleChange, 
  currentSelection 
}) => {
  // Generate stable key to prevent recreation
  const stableKey = useMemo(() => `dropdown-${dropdownName}-${uuidv4()}`, [dropdownName]);
  
  return (
    <DropdownSelect
      id='innerDD'
      key={stableKey}
      dropdownOptions={dropdownOptions}
      dropdownName={dropdownName}
      handleChange={handleChange}
      currentSelection={currentSelection}
    />
  );
};

const LayeredSelect = ({ 
  dropdownOptions = [], 
  dropdownName = '', 
  handleChange, 
  currentSelection 
}) => {
  const [open, setOpen] = useState(false);

  // Stable change handler to prevent closure issues
  const handleSelectChange = useCallback((e) => {
    const newSelection = e.target.value;
    handleChange(newSelection);
    // Don't auto-close here - let the natural behavior handle it
  }, [handleChange]);

  // Controlled open/close handlers
  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  // Memoize menu items creation to prevent unnecessary re-renders
  const menuOptions = useMemo(() => {
    return dropdownOptions.map((obj) => {
      const currentSelectionExists = currentSelection in obj.children ? currentSelection : '';
      
      return (
        <StableDropdownSelect
          key={obj.value} // Use obj.value instead of random UUID
          dropdownOptions={obj.children}
          dropdownName={obj.value}
          handleChange={handleChange}
          currentSelection={currentSelectionExists}
        />
      );
    });
  }, [dropdownOptions, handleChange, currentSelection]);
  
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
            open={open}
            onOpen={handleOpen}
            onClose={handleClose}
            onChange={handleSelectChange}
            MenuProps={{
              // Prevent menu from closing unexpectedly
              disableScrollLock: true,
              // Better positioning to avoid conflicts
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'left'
              },
              transformOrigin: {
                vertical: 'top',
                horizontal: 'left'
              },
              // Prevent auto-focus issues
              disableAutoFocus: true,
              disableEnforceFocus: true
            }}
          >
            {menuOptions}
          </Select>
        </FormControl>
      </ThemeProvider>
    </div>
  );
};

StableDropdownSelect.propTypes = {
  dropdownOptions: PropTypes.object,
  dropdownName: PropTypes.string,
  handleChange: PropTypes.func.isRequired,
  currentSelection: PropTypes.string
};

LayeredSelect.propTypes = {
  dropdownOptions: PropTypes.array,
  dropdownName: PropTypes.string,
  handleChange: PropTypes.func.isRequired,
  currentSelection: PropTypes.string.isRequired
};

export default LayeredSelect;