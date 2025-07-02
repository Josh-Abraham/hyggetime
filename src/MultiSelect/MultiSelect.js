import React from 'react';
import {
  Input,
  InputLabel,
  MenuItem,
  FormControl,
  ListItemText,
  Select,
  Checkbox
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { theme } from '../constants';
import './MultiSelect.scss';
import { v4 as uuidv4 } from 'uuid';

const MultiSelect = ({ sounds = [], soundSelections = [], handleChange }) => {
  return (
    <div className='outerMultiWrap'>
      <ThemeProvider theme={theme}>
        <FormControl className='multiSelectWrapper'>
          <InputLabel 
            id="demo-mutiple-checkbox-label"
            style={{ fontSize: '16px' }}
          >
          </InputLabel>
          <Select
            labelId="demo-mutiple-checkbox-label"
            id="demo-mutiple-checkbox"
            multiple
            value={soundSelections}
            onChange={handleChange}
            input={<Input />}
            renderValue={(selected) => selected.join(', ')}
          >
            {sounds.map((sound) => (
              <MenuItem key={uuidv4()} value={String(sound)}>
                <Checkbox checked={soundSelections.indexOf(sound) > -1} />
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
  handleChange: PropTypes.func.isRequired
};

export default MultiSelect;