import React, { Component } from 'react';
import {InputLabel, FormControl, Select, Input } from '@material-ui/core';
import DropdownSelect from '../DropdownSelect';
import Proptypes from 'prop-types';
import { ThemeProvider } from '@material-ui/styles';
import './LayeredSelect.scss';
import { theme } from '../constants';
import { v4 as uuidv4 } from 'uuid';
class LayeredSelect extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  createMenuItems(){
    const options = this.props.dropdownOptions.map((obj) =>
      {
        const currentSelection = this.props.currentSelection in obj.children ? this.props.currentSelection : '';
        const menuItem =
        <DropdownSelect
        id='innerDD'
        key={uuidv4()}
        dropdownOptions={obj.children}
        dropdownName={obj.value}
        handleChange={this.props.handleChange}
        currentSelection={currentSelection}
        />
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
            value={[]}
            input={<Input />}
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

LayeredSelect.defaultProps = {
  dropdownOptions: [],
  dropdownName: '',
}

LayeredSelect.propTypes = {
 dropdownOptions: Proptypes.array,
 dropdownName: Proptypes.string,
 handleChange: Proptypes.func.isRequired,
 currentSelection: Proptypes.string.isRequired
}

export default LayeredSelect;
