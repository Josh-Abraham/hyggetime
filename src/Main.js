import React, { Component } from "react";
import { debounce } from "lodash";
import LayeredSelect from "./LayeredSelect";
import MultiSelect from "./MultiSelect";
import "./Main.scss";
import SoundComponent from "./SoundComponent";
import ReactPlayer from "react-player";
import SliderComponent from "./SliderComponent";
import CastButton from "./CastButton";
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
      openSide: false,
      searchQuery: "",
      showControls: true,
      isFullscreen: false
    };
    this.play = this.play.bind(this);
    this.pause = this.pause.bind(this);
    this.handleBackgroundDropdown = this.handleBackgroundDropdown.bind(this);
    this.handleSoundChange = this.handleSoundChange.bind(this);
    this.getSoundComponents = this.getSoundComponents.bind(this);
    this.onResize = debounce(this.onResize.bind(this), 200);
    this.arrowClicked = this.arrowClicked.bind(this);
    this.volumeChange = this.volumeChange.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.toggleFullscreen = this.toggleFullscreen.bind(this);
    this.hideControlsTimer = null;
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.castService = null;
  }

   componentDidMount() {
    window.addEventListener("resize", this.onResize);
    document.addEventListener("mousemove", this.handleMouseMove);
    
    // Initialize cast service after DOM is ready
    setTimeout(() => {
      import('./CastService').then(module => {
        this.castService = module.default;
      });
    }, 1000);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.onResize);
    document.removeEventListener("mousemove", this.handleMouseMove);
    if (this.hideControlsTimer) {
      clearTimeout(this.hideControlsTimer);
    }
  }

  handleMouseMove() {
    this.setState({ showControls: true });
    if (this.hideControlsTimer) {
      clearTimeout(this.hideControlsTimer);
    }
    this.hideControlsTimer = setTimeout(() => {
      if (this.state.isFullscreen) {
        this.setState({ showControls: false });
      }
    }, 3000);
  }

  

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      this.setState({ isFullscreen: true });
    } else {
      document.exitFullscreen();
      this.setState({ isFullscreen: false });
    }
  }

  // Helper method to get current audio URL for casting
  getCurrentAudioUrl() {
    // If base sound is enabled, use the background video's audio
    if (this.state.baseSound.enabled && this.state.backgroundURL) {
      return this.state.backgroundURL;
    }
    // Otherwise, you might want to return a mixed audio stream URL
    // This depends on how your SoundComponent works
    return null;
  }

  // Helper method to get current title for casting
  getCurrentTitle() {
    const backgroundTitle = this.state.background || "Hygge Ambience";
    const soundNames = this.state.selectedSounds
      .filter(s => s.sound !== BASESOUND)
      .map(s => s.sound)
      .join(", ");
    
    return soundNames ? `${backgroundTitle} + ${soundNames}` : backgroundTitle;
  }

  getTopBar() {
    return (
      <div className={`top-bar ${this.state.showControls ? 'visible' : 'hidden'}`}>
        <div className="top-bar-left">
          <div className="app-logo">
            <span className="app-title">Hygge Time</span>
          </div>
        </div>
        
        <div className="top-bar-center">
          <div className="search-container">
            <input
              type="text"
              placeholder="Enter YouTube URL"
              value={this.state.searchQuery}
              onChange={this.handleSearchChange}
              onKeyPress={(e) => e.key === 'Enter' && this.handleSearchSubmit(e)}
              className="search-input"
            />
            <button className="search-button" onClick={this.handleSearchSubmit}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="top-bar-right">
          <CastButton 
            audioUrl={this.getCurrentAudioUrl()}
            title={this.getCurrentTitle()}
            artist="Hygge Time"
          />
          <button className="icon-button volume-button" onClick={() => this.arrowClicked()}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z"/>
            </svg>
          </button>
          <button className="icon-button fullscreen-button" onClick={this.toggleFullscreen}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7,14H5V19H10V17H7V14M12,14H14V17H17V19H12V14M17,10V7H14V5H19V10H17M10,5V7H7V10H5V5H10Z"/>
            </svg>
          </button>
        </div>
      </div>
    );
  }

  getBottomControls() {
    return (
      <div className={`bottom-controls ${this.state.showControls ? 'visible' : 'hidden'}`}>
        <div className="control-section">
          <div className="control-group">
            <label className="control-label">Background</label>
            {this.getDropDown()}
          </div>
          
          <div className="control-group">
            <label className="control-label">Ambient Sounds</label>
            {this.getMultiSelect()}
          </div>
          
          <div className="control-group play-controls">
            <button 
              className={`play-button ${this.state.play ? 'playing' : 'paused'}`}
              onClick={this.state.play ? this.pause : this.play}
            >
              {this.state.play ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14,19H18V5H14M6,19H10V5H6V19Z"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8,5.14V19.14L19,12.14L8,5.14Z"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  getDropDown() {
    return (
      <LayeredSelect
        id='dropdownAddRecipe'
        dropdownOptions={backgroundOptions}
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

  // Custom Search
  handleSearchChange = (event) => {
    this.setState({
      searchQuery: event.target.value
    });
  };

  // -------------------------------
  // Handler for search submission
  handleSearchSubmit = async (event) => {
    event.preventDefault(); // Prevent form submission if using form
    
    const url = this.state.searchQuery.trim();
    
    // Basic YouTube URL validation
    if (this.isValidYouTubeUrl(url)) {
      const videoId = this.extractVideoId(url);
      const videoTitle = await this.fetchYouTubeTitleProxy(videoId)
      this.setState({
        background: videoTitle, // or whatever key you use for custom URLs
        backgroundURL: url,
        searchQuery: '' // Clear the search input after successful submission
      });
    } else {
      // Handle invalid URL (you might want to show an error message)
      alert('Please enter a valid YouTube URL');
    }
  };

  // Helper function to validate YouTube URLs
  isValidYouTubeUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/;
    return youtubeRegex.test(url);
  };

  extractVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  fetchYouTubeTitleProxy = async (videoId) => {
    try {
      const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
      const data = await response.json();
      return data.title || null;
    } catch (error) {
      console.error('Error fetching YouTube title:', error);
      return null;
    }
  };


  getMultiSelect() {
    return (
      <MultiSelect
        id="dropdownAddRecipe"
        sounds={soundOptions}
        dropdownName="Select Sounds"
        soundSelections={this.state.selectedSounds.map(e => e.sound)}
        handleChange={this.handleSoundChange}
      />
    );
  }

  handleSoundChange = (e) => {
    const selectedSounds = e.target.value; // This is the full array of selected items
    
    // Handle base sound if it's in the selection
    if (selectedSounds.includes(BASESOUND)) {
      let baseSound = {
        enabled: !this.state.baseSound.enabled,
        volume: 1
      }
      this.setState({baseSound: baseSound})
    }

    // Convert the selected sound names to objects with volume
    const newList = selectedSounds.map(sound => {
      // Check if this sound already exists in state to preserve volume
      const existingSound = this.state.selectedSounds.find(s => s.sound === sound);
      return existingSound || { sound: sound, volume: 1 };
    });

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

  onResize() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight,
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
        <div className={`side-panel open ${this.state.showControls ? 'visible' : 'hidden'}`}>
          <div className="side-panel-header">
            <h3>Volume Mixer</h3>
            <button className="close-button" onClick={this.arrowClicked}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
              </svg>
            </button>
          </div>
          <div className="slider-container">
            {sliders}
          </div>
        </div>
      );
    }
    return null;
  }

  render() {
    const currentSounds = this.getSoundComponents();
    const topBar = this.getTopBar();
    const bottomControls = this.getBottomControls();
    const sidePanel = this.getSidePanel();

    return (
      <div className="modern-hygge-app">
        <div className="video-container">
          <ReactPlayer
            url={this.state.backgroundURL}
            width="100%"
            height="100%"
            loop={true}
            controls={false}
            muted={!this.state.baseSound.enabled}
            volume={this.state.baseSound.volume}
            playing={this.state.play}
            onPause={this.pause}
            onPlay={this.play}
          />
          {currentSounds}
        </div>
        
        {topBar}
        {bottomControls}
        {sidePanel}
        
        <div className="gradient-overlay top"></div>
        <div className="gradient-overlay bottom"></div>
      </div>
    );
  }
}

export default Main;