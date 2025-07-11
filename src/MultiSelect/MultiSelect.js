import React from 'react';
import {
  InputLabel,
  MenuItem,
  FormControl,
  ListItemText,
  Select,
  Checkbox,
  Chip,
  Box
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { theme } from '../constants';
import './MultiSelect.scss';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const MultiSelect = ({ sounds = [], soundSelections = [], handleChange, dropdownName }) => {
  return (
    <div className='outerMultiWrap'>
      <ThemeProvider theme={theme}>
        <FormControl className='multiSelectWrapper' style={{ minWidth: 200, width: 200, maxWidth: 200 }}>
          <InputLabel id="multi-select-label" style={{ fontSize: '16px' }}>
            {dropdownName || 'Select Options'}
          </InputLabel>
          <Select
            labelId="multi-select-label"
            id="multi-select"
            multiple
            value={soundSelections}
            onChange={handleChange}
            label={dropdownName || 'Select Options'}
            renderValue={(selected) => (
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                maxWidth: '100%',
                overflow: 'hidden',
                height: '24px', // Fixed height
                flexWrap: 'nowrap' // Prevent wrapping
              }}>
                {selected.length > 0 && (
                  <Chip 
                    key={selected[0]} 
                    label={selected[0]} 
                    size="small" 
                    style={{ maxWidth: selected.length > 1 ? '120px' : '160px' }}
                  />
                )}
                {selected.length > 1 && (
                  <Chip 
                    label={`+${selected.length - 1}`} 
                    size="small" 
                    variant="outlined" 
                  />
                )}
              </Box>
            )}
            MenuProps={MenuProps}
          >
            {sounds.map((sound) => (
              <MenuItem key={sound} value={sound}>
                <Checkbox 
                  checked={soundSelections.includes(sound)}
                  color="primary"
                />
                <ListItemText primary={sound} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </ThemeProvider>
    </div>
  );
};

MultiSelect.propTypes = {
  sounds: PropTypes.array,
  soundSelections: PropTypes.array,
  handleChange: PropTypes.func.isRequired,
  dropdownName: PropTypes.string
};

export default MultiSelect;