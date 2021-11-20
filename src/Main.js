import React, { Component } from "react";
import { debounce } from "lodash";
import LayeredSelect from "./LayeredSelect";
import MultiSelect from "./MultiSelect";
import "./Main.scss";
import SoundComponent from "./SoundComponent";
import ReactPlayer from "react-player";
import SliderComponent from "./SliderComponent";


const backgroundJSONOptions = {
  // Fall
  "Autumn Forest": "https://www.youtube.com/watch?v=IadsLclBOS8",
  "Autumn River": "https://www.youtube.com/watch?v=6uhRxK_EOm4",
  "Fall Coffee Shop": "https://youtu.be/VMAPTo7RVCo?t=1287",
  "Halloween Party": "https://youtu.be/LmCg6V8e8Jw?t=42",
  "Halloween Porch": "https://youtu.be/cykFvQ2Y8sM?t=55",
  "Haunted Hogwarts": "https://www.youtube.com/watch?v=lQ12THXbUE0",
  "Hogwarts Fall Courtyard": "https://www.youtube.com/watch?v=JVAbQvUSUIY",
  "Magic Kingdom Halloween": "https://www.youtube.com/watch?v=CYGAXigR_Z8",
  "Nighttime Porch": "https://www.youtube.com/watch?v=-gKvayYQVcg",
  "Thanksgiving Kitchen": "https://youtu.be/Xl4aD7b2l-w?t=7",
  "Witch's Kitchen": "https://www.youtube.com/watch?v=900GFG30Fzg",
  // Winter
  "Christmas at the Burrow": "https://www.youtube.com/watch?v=NSw8epNSVRI",
  "Christmas Coffee Shop": "https://youtu.be/9a9GixtqVP4?t=313",
  "Christmas Fireplace": "https://www.youtube.com/watch?v=2WgpCWUEexI",
  "Hogsmeade": "https://www.youtube.com/watch?v=bi4VmbqFJ2Y",
  "Magic Kingdom Christmas": "https://www.youtube.com/watch?v=RgN4p62qzmA",
  "Magic Kingdom Cristmas 2": "https://www.youtube.com/watch?v=t4GSiJx6Glo",
  "Snow Fall": "https://youtu.be/jh_KFTYJnDo?t=567",
  "The Yule Ball": "https://www.youtube.com/watch?v=tTfr-0qa3OQ",
  "Winter Chalet": "https://youtu.be/111hKC_4LuY?t=234",
  "Winter Fireplace": "https://www.youtube.com/watch?v=WjOJis4UR44",
  "Winter Fireplace 2": "https://www.youtube.com/watch?v=oakA7RLvmWs",
  "Winter Forest": "https://youtu.be/eS2ssUROF5o?t=215",
  // Spring
  "Cherry Blossoms": "https://youtu.be/o6tmxJPcnsg?t=6",
  "EPCOT Flower Garden Festival": "https://www.youtube.com/watch?v=seAjL2U6N6o",
  "English Forest": "https://www.youtube.com/watch?v=IsPBplWLImI",
  "Greek Seaside": "https://youtu.be/N7SvKKxpVBc?t=131",
  "Hogwarts Spring Scene": "https://www.youtube.com/watch?v=QQRHobcT1_A",
  "Mountain View": "https://youtu.be/qRTVg8HHzUo?t=22",
  "Spring Cafe 1": "https://www.youtube.com/watch?v=MbiTgRzP_2I",
  "Spring Cafe 2": "https://www.youtube.com/watch?v=-aL6ig2lxrE",
  "Spring Kitchen": "https://youtu.be/m7DW3jxGa8U?t=15",
  "Sunflower Meadow": "https://youtu.be/ipf7ifVSeDU?t=6",
  // Summer
  "Beach Bonfire": "https://youtu.be/Y1y9GAjuSt8?t=24",
  "Hawaiian Sunset": "https://youtu.be/q3J0H5SAhJY?t=18",
  "Night Cafe": "https://www.youtube.com/watch?v=BA50F2aq9D8",
  "Summer Night": "https://youtu.be/SN3xlcjbvUo?t=164",
  "Summer Night Beach House": "https://youtu.be/V65kcs57yhY?t=6",
  "Summer Night Terrace": "https://www.youtube.com/watch?v=yBzR0OL9cqA",
  "Summer Picnic": "https://youtu.be/wSZ0j6eBRpg?t=158",
  "Tropical Beach": "https://www.youtube.com/watch?v=DGIXT7ce3vQ",
  "Waterfall": "https://www.youtube.com/watch?v=V1RPi2MYptM",
  // Other
  "Aquarium": "https://www.youtube.com/watch?v=dBsicD0ItD0",
  "Coral Reef": "https://www.youtube.com/watch?v=tADnCEpbPI8",
  "Diagon Alley Night": "https://www.youtube.com/watch?v=v0haKQUgxYE",
  "Disney Springs": "https://youtu.be/Szetlwwd6jw?t=42",
  "Hogwarts Library": "https://www.youtube.com/watch?v=20XE6GM7xWo",
  "Hogwarts Library 2": "https://youtu.be/oI9bqFUBJ9E?t=28",
  "Kiss Goodnight": "https://www.youtube.com/watch?v=QqGjuloQGgo",
  "Magic Kingdom": "https://www.youtube.com/watch?v=vnJEjMdQoDw",
  "Magic Kingdom Sunset": "https://www.youtube.com/watch?v=EoZCMGPtZlM",
  "Potions Class": "https://www.youtube.com/watch?v=J8K3nPP4V-Y",
  "Weasley's Wizard Wheezes": "https://www.youtube.com/watch?v=WxB6hbba8cY",
  "221B Baker Street": "https://www.youtube.com/watch?v=wFrIeXGXEco"
};

const backgroundOptions = [
  {
    value: "Fall",
    children: [
      "Autumn Forest",
      "Autumn River",
      "Fall Coffee Shop",
      "Halloween Party",
      "Halloween Porch",
      "Haunted Hogwarts",
      "Hogwarts Fall Courtyard",
      "Magic Kingdom Halloween",
      "Nighttime Porch",
      "Thanksgiving Kitchen",
      "Witch's Kitchen",
    ],
  }, {
    value: "Winter",
    children: [
      "Christmas at the Burrow",
      "Christmas Coffee Shop",
      "Christmas Fireplace",
      "Hogsmeade",
      "Magic Kingdom Christmas",
      "Magic Kingdom Cristmas 2",
      "Snow Fall",
      "The Yule Ball",
      "Winter Chalet",
      "Winter Fireplace",
      "Winter Fireplace 2",
      "Winter Forest",
    ],
  },  {
    value: "Spring",
    children: [
      "Cherry Blossoms",
      "EPCOT Flower Garden Festival",
      "English Forest",
      "Greek Seaside",
      "Hogwarts Spring Scene",
      "Mountain View",
      "Spring Cafe 1",
      "Spring Cafe 2",
      "Spring Kitchen",
      "Sunflower Meadow",
    ],
  }, {
    value: "Summer",
    children: [
      "Beach Bonfire",
      "Hawaiian Sunset",
      "Night Cafe",
      "Summer Night",
      "Summer Night Beach House",
      "Summer Night Terrace",
      "Summer Picnic",
      "Tropical Beach",
      "Waterfall",
    ],
  }, {
    value: "Other",
    children: [
      "Aquarium",
      "Coral Reef",
      "Diagon Alley Night",
      "Disney Springs",
      "Hogwarts Library",
      "Hogwarts Library 2",
      "Kiss Goodnight",
      "Magic Kingdom",
      "Magic Kingdom Sunset",
      "Potions Class",
      "Weasley's Wizard Wheezes",
      "221B Baker Street"
    ],
  }
];
const BASESOUND = 'Base Sound'
const soundOptions = [
  BASESOUND,
  "Bamboo Forest",
  "Blizzard",
  "Cafe Jazz & Rain",
  "Campfire & River",
  "Christmas Music",
  "Disney Piano",
  "Disney Piano 2",
  "Disney Springs",
  "EPCOT Area Music",
  "Fall Leaves",
  "Fireplace",
  "Forest Sounds",
  "Jungle Sounds",
  "Hollywood Studios Area Music",
  "Large Waterfall",
  "Light Rain",
  "Light Snow",
  "Magic Kingdom Area Music",
  "Mandalorian Music",
  "Narnia Winter Music",
  "Nighttime Forest",
  "Small Waterfall",
  "Snow & Wind",
  "Soft Waves",
  "Stream",
  "Summer Night",
  "Thunder",
  "Tropical House",
  "Waves",
  "Wind",
  "Winter at Hogwarts",
  "Wizarding World Area Music",
  "Yiruma"
];



class Main extends Component {
  constructor() {
    super();
    this.state = {
      background: "",
      backgroundURL: "",
      play: true,
      selectedSounds: [],
      width: window.screen.availWidth,
      height: window.screen.availHeight - 84,
      baseSound: {
        enabled: false,
        volume: 1
      },
      openSide: false
    };
    this.play = this.play.bind(this);
    this.pause = this.pause.bind(this);
    this.handleBackgroundDropdown = this.handleBackgroundDropdown.bind(this);
    this.handleSoundChange = this.handleSoundChange.bind(this);
    this.getSoundComponents = this.getSoundComponents.bind(this);
    this.onResize = debounce(this.onResize.bind(this), 200);
    this.arrowClicked = this.arrowClicked.bind(this);
    this.volumeChange = this.volumeChange.bind(this);
  }

  // fetchSounds()

  getDropDown() {
    return (
      <LayeredSelect
        id='dropdownAddRecipe'
        dropdownOptions={backgroundOptions}
        dropdownName='Select Background'
        handleChange={this.handleBackgroundDropdown}
        currentSelection={this.state.background}
      />
      
    );
  }

  handleBackgroundDropdown(newSelection) {
    this.setState({
      background: newSelection,
      backgroundURL: backgroundJSONOptions[newSelection],
    });
  }

  getMultiSelect() {
    return (
      <MultiSelect
        id="dropdownAddRecipe"
        sounds={soundOptions}
        dropdownName="Select Background"
        soundSelections={this.state.selectedSounds.map(e => e.sound)}
        handleChange={this.handleSoundChange}
      />
    );
  }

  handleSoundChange(e) {
    const newSelection = e.target.value[0];
    
    if (newSelection === BASESOUND) {
      let baseSound = {
        enabled: !this.state.baseSound.enabled,
        volume: 1
      }
      this.setState({baseSound: baseSound})

    }
      let index = -1;
      let i = 0;
      for (const elem of this.state.selectedSounds) {
        if (elem['sound'] === newSelection) {
          index = i;
          break;
        }
        i++;
      }
      const newList = [...this.state.selectedSounds];
      if (index > -1) {
        newList.splice(index, 1);
      } else {
        const newSelectionObj = {'sound': newSelection, 'volume': 1 }
        newList.push(newSelectionObj);
      }
      this.setState({
        selectedSounds: newList,
      });
    
  }

  pause() {
    this.setState({
      play: false,
    });
  }

  play() {
    this.setState({
      play: true,
    });
  }

  getSoundComponents() {
    const sounds = this.state.selectedSounds.map((soundData) => {
      if (soundData['sound'] !== BASESOUND) {
        return (
          <SoundComponent
            sound={soundData['sound']}
            volume={soundData['volume']}
            playing={this.state.play}
          />
        );
      }
      return null;
    });

    return sounds;
  }

  onResize(e) {
    this.setState({
      width: e.target.outerWidth,
      height: e.target.outerHeight - 84,
    });
  }

  arrowClicked() {
    this.setState({ openSide: !this.state.openSide })
  }

  volumeChange(index, volume) {
    
    const newList = [...this.state.selectedSounds];
    const newSound = newList[index];
    newList.splice(index, 1);
    newSound['volume'] = volume;
    newList.splice(index, 0, newSound);
    
    if (newSound['sound'] === BASESOUND) {
      const newBase = this.state.baseSound;
      newBase['volume'] = volume;
      this.setState({
        selectedSounds: newList,
        baseSound: newBase
      });
    } else {
      this.setState({
        selectedSounds: newList
      });
    }
  }

  getSliders() {
    let i = -1
    const sliders = this.state.selectedSounds.map((soundData) => {
      i += 1;
      return (
        <SliderComponent
          index={i}
          onChange={this.volumeChange}
          sound={soundData['sound']}
          volume={soundData['volume']}
        />
      );
    })

    return sliders;
  }
  getSidePanel() {
    if (this.state.openSide) {
      const sliders = this.getSliders();

      return (
        <div>
        <div className="sideBar"> 
        Volume Mixer
        <div className="sliderTop">
          {sliders}
        </div>          
        </div>
        <svg height="50" width="50" className="circleIn">
          <circle cx="25" cy="25" r="25" fill="white" />
        </svg>
          <img 
            src="https://www.shareicon.net/data/512x512/2015/10/17/657431_arrows_512x512.png" 
            alt="" 
            onClick={this.arrowClicked}
            className="arrowIn"
            width="50"
            height="50"/>
        </div>
      );
    }
    return (
      <div onClick={this.arrowClicked}> 
      <svg height="50" width="50" className="circleOut">
        <circle cx="25" cy="25" r="25" fill="white" />
      </svg>
        <img 
          src="https://www.shareicon.net/data/512x512/2015/10/17/657431_arrows_512x512.png" 
          alt="" 
          className="arrowOut"
          width="50"
          height="50"/>
      </div>
    );
  }

  render() {
    const backgroundDropdown = this.getDropDown();
    const soundSelect = this.getMultiSelect();
    const currentSounds = this.getSoundComponents();
    const sidePanel = this.getSidePanel();
    window.addEventListener("resize", (e) => this.onResize(e));

    return (
      <div
        className="outerWrapper"
        width={this.state.width}
        height={this.state.height}
      >
        <div
          className="videoWrapper"
          height={this.state.height}
          width={this.state.width}
        >
          <ReactPlayer
            url={this.state.backgroundURL}
            width={this.state.width + "px"}
            height={this.state.height + "px"}
            loop={true}
            controls={false}
            muted={!this.state.baseSound.enabled}
            volume={this.state.baseSound.volume}
            playing={true}
            onPause={this.pause}
            onPlay={this.play}
          />
          {currentSounds}
        </div>
        <div className="playerOptions" width={this.state.width + "px"}>
          <div className="playerTitle" width={this.state.width + "px"}>Hygge Time</div>
          {backgroundDropdown}
          {soundSelect}
        </div>
        {sidePanel}
      </div>
    );
  }
}
export default Main;
