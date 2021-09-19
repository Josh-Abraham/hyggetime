import React, { Component } from 'react';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import ListItemText from '@material-ui/core/ListItemText';
import Select from '@material-ui/core/Select';
import Checkbox from '@material-ui/core/Checkbox';
import { ThemeProvider } from '@material-ui/styles';
import Proptypes from 'prop-types';
import { theme } from '../constants';
import './MultiSelect.scss'
import { v4 as uuidv4 } from 'uuid';



class MultiSelect extends Component {
  
  render() {

    return (
      <div className='outerMultiWrap'>
        <ThemeProvider theme={theme}>
        <FormControl className='multiSelectWrapper'>
          <InputLabel 
            id="demo-mutiple-checkbox-label"
            style={{'fontSize': '16px'}}
            >Background Sounds</InputLabel>
          <Select
            labelId="demo-mutiple-checkbox-label"
            id="demo-mutiple-checkbox"
            multiple
            value={[]}
            onChange={this.props.handleChange}
            input={<Input />}
            renderValue={(selected) => selected.join(', ')}
            
          >
            {this.props.sounds.map((sound) => (
              <MenuItem key={uuidv4()} value={String(sound)}>
                <Checkbox checked={this.props.soundSelections.indexOf(sound) > -1} />
                <ListItemText primary={sound} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        </ThemeProvider>
      </div>
    );
  }
}

MultiSelect.propTypes = {
  sounds: Proptypes.array,
  soundSelections: Proptypes.array,
  handleChange: Proptypes.func.isRequired
 }

export default MultiSelect;