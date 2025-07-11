/* global cast, chrome */

class CastService {
  constructor() {
    this.listeners = [];
    this.isInitialized = false;
    this.castState = {
      isAvailable: false,
      isConnected: false,
      session: null
    };
    
    this.initializeCast();
  }

  initializeCast() {
    // Since SDK is already loaded in index.html, just wait for it to be available
    if (typeof window !== 'undefined') {
      // Try multiple times with delays
      const checkCastAvailability = () => {
        if (typeof cast !== 'undefined' && cast.framework) {
          console.log('Cast framework found, setting up...');
          this.setupCast();
        } else {
          console.log('Cast framework not ready, waiting...');
          setTimeout(checkCastAvailability, 500);
        }
      };

      // Check if Cast API is already fully available
      if (typeof cast !== 'undefined' && cast.framework) {
        this.setupCast();
      } else {
        // Wait for Cast API to become available
        window.__onGCastApiAvailable = (isAvailable) => {
          console.log('Cast API available callback:', isAvailable);
          if (isAvailable) {
            setTimeout(() => {
              if (typeof cast !== 'undefined' && cast.framework) {
                this.setupCast();
              } else {
                checkCastAvailability();
              }
            }, 100);
          }
        };
        
        // Also try polling as backup
        checkCastAvailability();
      }
    }
  }

  setupCast() {
    // Double-check that cast API is available
    if (typeof cast === 'undefined' || !cast.framework) {
      console.error('Cast framework not available');
      return;
    }

    try {
      console.log('Setting up Cast context...');
      const context = cast.framework.CastContext.getInstance();
      
      // Configure cast options - using default media receiver
      context.setOptions({
        receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
        autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
      });

      console.log('Cast options set successfully');
      this.isInitialized = true;

      // Listen for cast state changes
      context.addEventListener(
        cast.framework.CastContextEventType.CAST_STATE_CHANGED,
        (event) => {
          this.handleCastStateChanged(event.castState);
        }
      );

      // Listen for session state changes
      context.addEventListener(
        cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
        (event) => {
          this.handleSessionStateChanged(event.sessionState, event.session);
        }
      );

      // Update initial state
      this.updateCastState();
    } catch (error) {
      console.error('Error setting up Cast:', error);
    }
  }

  handleCastStateChanged(castState) {
    const isAvailable = castState !== cast.framework.CastState.NO_DEVICES_AVAILABLE;
    const isConnected = castState === cast.framework.CastState.CONNECTED;
    
    this.castState = {
      ...this.castState,
      isAvailable,
      isConnected
    };

    this.notifyListeners();
  }

  handleSessionStateChanged(sessionState, session) {
    this.castState = {
      ...this.castState,
      session: session
    };

    this.notifyListeners();
  }

  updateCastState() {
    if (typeof cast !== 'undefined') {
      const context = cast.framework.CastContext.getInstance();
      const castState = context.getCastState();
      const session = context.getCurrentSession();
      
      this.castState = {
        isAvailable: castState !== cast.framework.CastState.NO_DEVICES_AVAILABLE,
        isConnected: castState === cast.framework.CastState.CONNECTED,
        session: session
      };
    }

    this.notifyListeners();
  }

  addListener(callback) {
    this.listeners.push(callback);
    // Immediately notify new listener of current state
    callback(this.castState);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback(this.castState));
  }

  requestSession() {
    if (!this.isInitialized) {
      console.error('Cast service not initialized yet');
      return;
    }

    if (typeof cast !== 'undefined') {
      const context = cast.framework.CastContext.getInstance();
      console.log('Requesting cast session...');
      context.requestSession().then(
        () => {
          console.log('Cast session started successfully');
        },
        (error) => {
          console.error('Error starting cast session:', error);
        }
      );
    } else {
      console.error('Cast framework not available');
    }
  }

  endSession() {
    if (this.castState.session) {
      this.castState.session.endSession(true);
    }
  }

  // Simple cast method - just pass URL and basic info
  castMedia(mediaUrl, title = 'Hygge Time') {
    if (!this.castState.isConnected || !this.castState.session) {
      console.error('No active cast session');
      return;
    }

    // Let Chrome Cast auto-detect the media type
    const mediaInfo = new chrome.cast.media.MediaInfo(mediaUrl);
    
    // Simple metadata
    mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
    mediaInfo.metadata.title = title;

    const request = new chrome.cast.media.LoadRequest(mediaInfo);
    request.autoplay = true;

    this.castState.session.loadMedia(request).then(
      () => {
        console.log('Media loaded successfully');
      },
      (error) => {
        console.error('Error loading media:', error);
      }
    );
  }

  // Basic playback controls
  play() {
    if (this.castState.session) {
      const media = this.castState.session.getMediaSession();
      if (media) {
        media.play(new chrome.cast.media.PlayRequest());
      }
    }
  }

  pause() {
    if (this.castState.session) {
      const media = this.castState.session.getMediaSession();
      if (media) {
        media.pause(new chrome.cast.media.PauseRequest());
      }
    }
  }

  setVolume(volume) {
    if (this.castState.session) {
      const media = this.castState.session.getMediaSession();
      if (media) {
        const volumeRequest = new chrome.cast.media.VolumeRequest();
        volumeRequest.volume = new chrome.cast.Volume(volume, false);
        media.setVolume(volumeRequest);
      }
    }
  }
}

// Create singleton instance
const castService = new CastService();

export default castService;