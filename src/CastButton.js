import React, { Component } from 'react';
import castService from './CastService';

class CastButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAvailable: false,
      isConnected: false,
      isInitialized: false
    };
  }

  componentDidMount() {
    // Listen for cast state changes
    castService.addListener(this.handleCastStateChange);
  }

  componentWillUnmount() {
    castService.removeListener(this.handleCastStateChange);
  }

  handleCastStateChange = (castState) => {
    this.setState({
      isAvailable: castState.isAvailable,
      isConnected: castState.isConnected,
      isInitialized: castService.isInitialized
    });
  };

  handleCastClick = () => {
    console.log('Cast button clicked', {
      isInitialized: this.state.isInitialized,
      isConnected: this.state.isConnected,
      isAvailable: this.state.isAvailable
    });

    if (!this.state.isInitialized) {
      console.error('Cast service not initialized yet');
      return;
    }

    if (this.state.isConnected) {
      // If connected, cast the media
      if (this.props.audioUrl) {
        castService.castMedia(this.props.audioUrl, this.props.title);
      }
    } else {
      // If not connected, request session
      castService.requestSession();
    }
  };

  render() {
    // Always show the button for debugging
    return (
      <button 
        className="cast-button icon-button"
        onClick={this.handleCastClick}
        style={{
          padding: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title={this.state.isConnected ? 'Cast media' : 'Connect to Cast device'}
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="currentColor"
          style={{ opacity: this.state.isAvailable ? 1 : 0.5 }}
        >
          <path d="M1,18V16H4A14,14 0 0,0 18,2H20A16,16 0 0,1 4,18H1M1,14V12H4A10,10 0 0,0 14,2H16A12,12 0 0,1 4,14H1M1,10V8H4A6,6 0 0,0 10,2H12A8,8 0 0,1 4,10H1M21,3H3C1.89,3 1,3.89 1,5V8H3V5H21V19H14V21H21A2,2 0 0,0 23,19V5C23,3.89 22.1,3 21,3Z"/>
        </svg>
        {this.state.isConnected && (
          <div style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            width: '8px',
            height: '8px',
            backgroundColor: '#4CAF50',
            borderRadius: '50%'
          }}></div>
        )}
      </button>
    );
  }
}

export default CastButton;