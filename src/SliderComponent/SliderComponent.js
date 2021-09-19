import React, { Component } from 'react';
import Proptypes from 'prop-types';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';
import "./SliderComponent.scss";

class SliderComponent extends Component {
  constructor() {
    super();
    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    const newVolume = e.target.value / 100;
    this.props.onChange(this.props.index, newVolume)
  }
  
  render() {
    return(
      <div className="slider">
      <Box sx={{ width: 280 }}>
        {this.props.sound}
      <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
        <VolumeDown />
        <Slider aria-label="Volume" 
          value={this.props.volume*100} 
          onChange={this.onChange}
          min={0}
          max={100}
         />
        <VolumeUp />
      </Stack>
    </Box>
    </div>
    );
  }
}


SliderComponent.propTypes = {
  index: Proptypes.number.isRequired,
  onChange: Proptypes.func.isRequired,
  sound: Proptypes.string.isRequired,
  volume: Proptypes.number.isRequired
}

export default SliderComponent;
