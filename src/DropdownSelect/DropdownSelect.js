import React, { Component } from 'react';
import {InputLabel, MenuItem, FormControl, Select } from '@material-ui/core';
import Proptypes from 'prop-types';
import { ThemeProvider } from '@material-ui/styles';
import './DropdownSelect.scss';
import { theme } from '../constants';

class DropdownSelect extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  createMenuItems(){
    const options = this.props.dropdownOptions.map((obj) =>
      {
        const menuItem =
          <MenuItem
            id={obj}
            key={obj}
            value={obj}
           >{`${obj}`}
          </MenuItem>
          return menuItem;
      }
    );
    return options;
  }

  handleChange(e) {
    const newSelection = e.target.value;
    this.props.handleChange(newSelection)
  }

  render() {
    const menuOptions = this.createMenuItems();
    return(
      <div  className='dropdownWrapper'>
        <ThemeProvider theme={theme}>
          <FormControl className='dropdownSelect'>
            <InputLabel id={`Dropdown_${this.props.dropdownName}`} color="primary"
            style={{"fontSize": '16px'}}
            >
                {this.props.dropdownName}
            </InputLabel>
          <Select
            id={`Dropdown_Select_${this.props.dropdownName}`}
            value={this.props.currentSelection}
            onChange={this.handleChange}
          >
          {menuOptions}
          </Select>
        </FormControl>
        </ThemeProvider>
      </div>
    );
  }
}

DropdownSelect.defaultProps = {
  dropdownOptions: [],
  dropdownName: '',
}

DropdownSelect.propTypes = {
 dropdownOptions: Proptypes.array,
 dropdownName: Proptypes.string,
 handleChange: Proptypes.func.isRequired,
 currentSelection: Proptypes.string.isRequired
}

export default DropdownSelect;
