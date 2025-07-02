import React, { Component } from "react";
import { debounce } from "lodash";
import LayeredSelect from "./LayeredSelect";
import MultiSelect from "./MultiSelect";
import "./Main.scss";
import SoundComponent from "./SoundComponent";
import ReactPlayer from "react-player";
import SliderComponent from "./SliderComponent";
import { 
  backgroundJSONOptions, 
  backgroundOptions, 
  BASESOUND, 
  soundOptions 
} from "./constants.js";

class Main extends Component {
  constructor() {
    super();
    this.state = {
      background: "",
      backgroundURL: "",
      play: true,
      selectedSounds: [{'sound': "Base Sound", 'volume': 1 }],
      width: window.screen.availWidth,
      height: window.screen.availHeight,
      baseSound: {
        enabled: true,
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
            key={soundData['sound']}
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
      height: e.target.outerHeight,
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
          key={soundData['sound']}
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