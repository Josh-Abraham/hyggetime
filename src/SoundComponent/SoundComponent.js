import React, { Component } from 'react';
import Proptypes from 'prop-types';
import ReactPlayer from "react-player";

const soundOptions = {
  "Bamboo Forest": "https://www.youtube.com/watch?v=a20ooDY0L0E",
  "Blizzard": "https://www.youtube.com/watch?v=YsmfWkE6FUg",
  "Cafe Jazz & Rain": "https://www.youtube.com/watch?v=c0_ejQQcrwI",
  "Campfire & River": "https://www.youtube.com/watch?v=Ftm2uv7-Ybw",
  "Christmas Music": "https://www.youtube.com/watch?v=hPz7h_XK9EQ",
  "Disney Piano": "https://www.youtube.com/watch?v=g8NVwN0_mks",
  "Disney Piano 2": "https://www.youtube.com/watch?v=2Mu7LAhxyp8",
  "Disney Springs": "https://www.youtube.com/watch?v=klOe-e9y0_4",
  "EPCOT Area Music": "https://www.youtube.com/watch?v=f7vevAplVYI",
  "Fall Leaves": "https://www.youtube.com/watch?v=aT66uumZ0Zo",
  "Fireplace": "https://youtu.be/UgHKb_7884o?t=607",
  "Forest Sounds": "https://www.youtube.com/watch?v=TOHYkccYfUk",
  "Jungle Sounds": "https://youtu.be/g45jXV-fg2E?t=393",
  "Hollywood Studios Area Music": "https://www.youtube.com/watch?v=NmSSUYMzQpY",
  "Large Waterfall": "https://www.youtube.com/watch?v=Qo3OM5sPUPM",
  "Light Rain": "https://www.youtube.com/watch?v=7JyE47-Ykjo",
  "Light Snow": "https://www.youtube.com/watch?v=vz91QpgUjFc",
  "Magic Kingdom Area Music": "https://www.youtube.com/watch?v=CYGAXigR_Z8",
  
  "Narnia Winter Music": "https://www.youtube.com/watch?v=5RHTt4_XVVU",
  "Nighttime Forest": "https://www.youtube.com/watch?v=PVV4-2G0t3k",
  "Small Waterfall": "https://youtu.be/02NQkhbjALg?t=388",
  "Snow & Wind": "https://www.youtube.com/watch?v=oakA7RLvmWs",
  "Soft Waves": "https://www.youtube.com/watch?v=ec_xGmM_tJc",
  "Stream": "https://youtu.be/UJZxtO9XNno?t=375",
  'Seaside Piano': "https://www.youtube.com/watch?v=0-orslgOSiE",
  "Summer Night": "https://www.youtube.com/watch?v=Q7R-1b1WEGQ",
  "Thunder": "https://www.youtube.com/watch?v=yMRoNNKWuqQ",
  "Tropical House": "https://www.youtube.com/watch?v=0D0LMWf93pU",
  "Waves": "https://www.youtube.com/watch?v=Nep1qytq9JM",
  "Wind": "https://www.youtube.com/watch?v=lWULd19LvaY",
  "Winter at Hogwarts": "https://www.youtube.com/watch?v=oE-pXV-G9aY",
  "Wizarding World Area Music": "https://www.youtube.com/watch?v=F6am4iEDez0",
  "Lilo & Stitch Soundscape": "https://www.youtube.com/watch?v=tbQ8yLIZePo",
  "Little Mermaid Soundscape": "https://www.youtube.com/watch?v=Kd0H572nTno",
  "Lion King Soundscape": "https://www.youtube.com/watch?v=Rx_Fp0sdXz8",
  "Disney Parks Soundscape": "https://www.youtube.com/watch?v=INppObmqIk8",
  "Haunted Mansion Soundscape": "https://www.youtube.com/watch?v=BuhiXmnMYPA",
  "WDW Today Channel": "https://www.youtube.com/watch?v=-LqPzc9bYe0"
};
class SoundComponent extends Component {
  render() {
    return(
      <ReactPlayer
        url={soundOptions[this.props.sound]}
        width={"0px"}
        height={"0px"}
        loop={true}
        controls={false}
        volume={this.props.volume}
        playing={this.props.playing}
      />
    );
  }
}


SoundComponent.propTypes = {
 sound: Proptypes.string.isRequired,
 volume: Proptypes.number.isRequired,
 playing: Proptypes.bool.isRequired
}

export default SoundComponent;
