/* CHG */
const MAX_WAIT_TIME = 3000;
const MAX_RETRIES = 3;

function initializeBCPlayers() {
  // Select all BC video-js elements with a data-video-id
  const BCEls = document.querySelectorAll('video-js[data-video-id]');
  BCEls.forEach((videoEl, index) => {
    // Initialize BC wrapper (must be done before videojs)
    bc(videoEl);
    const player = videojs(videoEl);

    monitorBCPlayer(player, index, videoEl, 0, false);
  });
}

function monitorBCPlayer(player, index, videoEl, retryCount, hasReplacedDom) {
  let metadataLoaded = false;

  const timeout = setTimeout(() => {
    if (!metadataLoaded) {
      console.warn(`BC Player ${index}: metadata not loaded. Retry #${retryCount + 1}`);

      if (retryCount >= MAX_RETRIES) {
        console.error(`BC Player ${index} failed after ${MAX_RETRIES} retries.`);
        return;
      }

      player.dispose();

      let nextVideoEl = videoEl;
      if (!hasReplacedDom && retryCount >= 1) {
        // Clone the <video-js> element and replace in DOM
        const newVideo = videoEl.cloneNode(true);
        videoEl.parentNode.replaceChild(newVideo, videoEl);
        nextVideoEl = newVideo;
        hasReplacedDom = true;
        console.log(`BC Player ${index}: Replaced DOM element.`);
      }

      // Reinitialize the BC player on the new or original element
      bc(nextVideoEl);
      const newPlayer = videojs(nextVideoEl);

      monitorBCPlayer(newPlayer, index, nextVideoEl, retryCount + 1, hasReplacedDom);
    }
  }, MAX_WAIT_TIME);

  player.on('loadedmetadata', () => {
    metadataLoaded = true;
    clearTimeout(timeout);
    console.log(`BC Player ${index}: metadata loaded successfully.`);
  });
}

// Wait for BC + video.js globals to be ready before starting
function waitForBCAPI(callback) {
  if (window.bc && window.videojs) {
    callback();
  } else {
    const interval = setInterval(() => {
      if (window.bc && window.videojs) {
        clearInterval(interval);
        callback();
      }
    }, 200);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  waitForBCAPI(initializeBCPlayers);
});

/* CLD */

// Simple Video.js Player Recovery System
function createVideoRecovery(options) {
    options = options || {};
    
    const timeout = options.timeout || 8000; // 8 seconds
    const maxRetries = options.maxRetries || 2;
    const retryDelay = options.retryDelay || 3000; // 3 seconds
    
    const players = {};
    
    function addPlayer(videoId, config) {
      config = config || {};
      
      // Initialize player data
      players[videoId] = {
        element: document.getElementById(videoId),
        config: config,
        retries: 0,
        loaded: false,
        timer: null
      };
      
      // Create the player
      createPlayer(videoId);
      
      return players[videoId];
    }
    
    function createPlayer(videoId) {
      const data = players[videoId];
      if (!data) return;
      
      console.log(`Creating player: ${videoId}`);
      
      try {
        // Dispose old player if exists
        if (data.player && !data.player.isDisposed()) {
          data.player.dispose();
        }
        
        // Create new player
        data.player = videojs(videoId, data.config);
        data.loaded = false;
        
        // Set up success event
        data.player.one('loadedmetadata', () => {
          console.log(`Player ${videoId}: Loaded successfully`);
          data.loaded = true;
          clearTimer(videoId);
        });
        
        // Alternative success event
        data.player.one('canplay', () => {
          if (!data.loaded) {
            console.log(`Player ${videoId}: Can play`);
            data.loaded = true;
            clearTimer(videoId);
          }
        });
        
        // Error event
        data.player.on('error', () => {
          console.warn(`Player ${videoId}: Error occurred`);
          retryPlayer(videoId);
        });
        
        // Start timeout timer
        startTimer(videoId);
        
      } catch (error) {
        console.error(`Failed to create player ${videoId}:`, error);
        retryPlayer(videoId);
      }
    }
    
    function startTimer(videoId) {
      const data = players[videoId];
      if (!data) return;
      
      data.timer = setTimeout(() => {
        if (!data.loaded) {
          console.warn(`Player ${videoId}: Timeout - retrying`);
          retryPlayer(videoId);
        }
      }, timeout);
    }
    
    function clearTimer(videoId) {
      const data = players[videoId];
      if (data && data.timer) {
        clearTimeout(data.timer);
        data.timer = null;
      }
    }
    
    function retryPlayer(videoId) {
      const data = players[videoId];
      if (!data) return;
      
      clearTimer(videoId);
      
      if (data.retries >= maxRetries) {
        console.error(`Player ${videoId}: Max retries (${maxRetries}) exceeded`);
        markAsFailed(videoId);
        return;
      }
      
      data.retries++;
      console.log(`Player ${videoId}: Retry ${data.retries}/${maxRetries}`);
      
      // Reset video element
      resetVideoElement(videoId);
      
      // Wait and retry
      setTimeout(() => {
        createPlayer(videoId);
      }, retryDelay);
    }
    
    function resetVideoElement(videoId) {
      const data = players[videoId];
      if (!data || !data.element) return;
      
      const element = data.element;
      const currentSrc = element.src;
      
      // Reset the video element
      element.src = '';
      element.load();
      
      // Restore source after a short delay
      setTimeout(() => {
        element.src = currentSrc;
      }, 100);
    }
    
    function markAsFailed(videoId) {
      const data = players[videoId];
      if (data && data.element) {
        data.element.classList.add('video-failed');
        console.error(`Player ${videoId}: Marked as failed`);
      }
    }
    
    function getStatus() {
      const status = {};
      for (const videoId in players) {
        const data = players[videoId];
        status[videoId] = {
          loaded: data.loaded,
          retries: data.retries,
          failed: data.element && data.element.classList.contains('video-failed')
        };
      }
      return status;
    }
    
    function manualRetry(videoId) {
      const data = players[videoId];
      if (data) {
        console.log(`Manual retry for ${videoId}`);
        data.retries = 0; // Reset retry count
        retryPlayer(videoId);
      }
    }
    
    return {
      add: addPlayer,
      status: getStatus,
      retry: manualRetry
    };
  }
  
  // Even simpler version - just a single function
  function simpleVideoRecovery(videoId, config, options) {
    options = options || {};
    const timeout = options.timeout || 8000;
    const maxRetries = options.maxRetries || 2;
    
    let retries = 0;
    let loaded = false;
    let timer = null;
    
    function createPlayer() {
      console.log(`Creating player: ${videoId} (attempt ${retries + 1})`);
      
      try {
        const player = videojs(videoId, config || {});
        
        // Success events
        player.one('loadedmetadata', () => {
          console.log(`Player ${videoId}: Loaded!`);
          loaded = true;
          if (timer) clearTimeout(timer);
        });
        
        player.one('canplay', () => {
          if (!loaded) {
            console.log(`Player ${videoId}: Can play!`);
            loaded = true;
            if (timer) clearTimeout(timer);
          }
        });
        
        // Error event
        player.on('error', retry);
        
        // Timeout
        timer = setTimeout(() => {
          if (!loaded) {
            console.warn(`Player ${videoId}: Timeout`);
            retry();
          }
        }, timeout);
        
        return player;
        
      } catch (error) {
        console.error(`Error creating ${videoId}:`, error);
        retry();
      }
    }
    
    function retry() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      
      if (retries >= maxRetries) {
        console.error(`Player ${videoId}: Failed after ${maxRetries} retries`);
        document.getElementById(videoId).classList.add('video-failed');
        return;
      }
      
      retries++;
      
      // Reset video element
      const element = document.getElementById(videoId);
      const src = element.src;
      element.src = '';
      element.load();
      
      setTimeout(() => {
        element.src = src;
        setTimeout(createPlayer, 100);
      }, 2000);
    }
    
    return createPlayer();
  }
  
  // Usage Examples:
  
  // Method 1: Recovery system for multiple players
  /*
  const recovery = createVideoRecovery({
    timeout: 6000,
    maxRetries: 2,
    retryDelay: 2000
  });
  
  recovery.add('video1', { controls: true });
  recovery.add('video2', { controls: true });
  
  // Check status
  console.log(recovery.status());
  
  // Manual retry
  recovery.retry('video1');
  */
  
  // Method 2: Simple single player recovery
  /*
  const player1 = simpleVideoRecovery('video1', {
    controls: true,
    sources: [{ src: 'video.mp4', type: 'video/mp4' }]
  }, {
    timeout: 5000,
    maxRetries: 3
  });
  */

  /* CLD v3 */

  // Video.js Player Recovery System (using objects and arrays with arrow functions)
class VideoPlayerRecovery {
    constructor(options = {}) {
      this.options = {
        timeout: options.timeout || 10000, // 10 seconds default timeout
        maxRetries: options.maxRetries || 3,
        retryDelay: options.retryDelay || 2000, // 2 seconds between retries
        checkInterval: options.checkInterval || 1000, // Check every second
        ...options
      };
      
      this.players = {}; // Track player states
      this.retryCount = {}; // Track retry attempts
      this.timeouts = {}; // Track timeouts
      this.intervals = {}; // Track check intervals
    }
  
    // Register a player for monitoring
    registerPlayer(playerId, playerConfig = {}) {
      const player = videojs(playerId, playerConfig);
      
      this.players[playerId] = {
        player: player,
        loaded: false,
        config: playerConfig,
        element: document.getElementById(playerId)
      };
      
      this.retryCount[playerId] = 0;
      
      // Set up event listeners
      this.setupPlayerEvents(playerId, player);
      
      // Start monitoring this player
      this.startMonitoring(playerId);
      
      return player;
    }
  
    // Set up event listeners for a player
    setupPlayerEvents(playerId, player) {
      // Success case - metadata loaded
      player.one('loadedmetadata', () => {
        console.log(`Player ${playerId}: Metadata loaded successfully`);
        this.markPlayerAsLoaded(playerId);
      });
  
      // Alternative success indicators
      player.one('canplay', () => {
        if (!this.players[playerId] || !this.players[playerId].loaded) {
          console.log(`Player ${playerId}: Can play - marking as loaded`);
          this.markPlayerAsLoaded(playerId);
        }
      });
  
      // Error handling
      player.on('error', () => {
        console.warn(`Player ${playerId}: Error occurred`);
        this.handlePlayerError(playerId);
      });
  
      // Network state changes
      player.on('loadstart', () => {
        console.log(`Player ${playerId}: Load started`);
      });
    }
  
    // Mark player as successfully loaded
    markPlayerAsLoaded(playerId) {
      if (this.players[playerId]) {
        this.players[playerId].loaded = true;
        this.clearMonitoring(playerId);
      }
    }
  
    // Start monitoring a player for loading issues
    startMonitoring(playerId) {
      // Set timeout for loading
      this.timeouts[playerId] = setTimeout(() => {
        this.handleLoadTimeout(playerId);
      }, this.options.timeout);
  
      // Set up periodic checks
      this.intervals[playerId] = setInterval(() => {
        this.checkPlayerHealth(playerId);
      }, this.options.checkInterval);
    }
  
    // Check if player is healthy
    checkPlayerHealth(playerId) {
      const playerData = this.players[playerId];
      if (!playerData || playerData.loaded) return;
  
      const player = playerData.player;
      
      // Check various indicators of successful loading
      if (player.readyState() >= 1 || // HAVE_METADATA
          player.duration() > 0 ||
          player.videoWidth() > 0) {
        console.log(`Player ${playerId}: Health check passed - marking as loaded`);
        this.markPlayerAsLoaded(playerId);
      }
    }
  
    // Handle loading timeout
    handleLoadTimeout(playerId) {
      const playerData = this.players[playerId];
      if (!playerData || playerData.loaded) return;
  
      console.warn(`Player ${playerId}: Loading timeout - attempting recovery`);
      this.attemptRecovery(playerId);
    }
  
    // Handle player errors
    handlePlayerError(playerId) {
      const playerData = this.players[playerId];
      if (!playerData || playerData.loaded) return;
  
      console.warn(`Player ${playerId}: Error detected - attempting recovery`);
      this.attemptRecovery(playerId);
    }
  
    // Attempt to recover a failed player
    attemptRecovery(playerId) {
      const currentRetries = this.retryCount[playerId] || 0;
      
      if (currentRetries >= this.options.maxRetries) {
        console.error(`Player ${playerId}: Max retries exceeded - giving up`);
        this.clearMonitoring(playerId);
        this.onPlayerFailure(playerId);
        return;
      }
  
      this.retryCount[playerId] = currentRetries + 1;
      console.log(`Player ${playerId}: Recovery attempt ${currentRetries + 1}/${this.options.maxRetries}`);
  
      // Clear current monitoring
      this.clearMonitoring(playerId);
  
      // Wait before retry
      setTimeout(() => {
        this.reinitializePlayer(playerId);
      }, this.options.retryDelay);
    }
  
    // Reinitialize a player
    reinitializePlayer(playerId) {
      const playerData = this.players[playerId];
      if (!playerData) return;
  
      try {
        // Dispose of the old player
        if (playerData.player && !playerData.player.isDisposed()) {
          playerData.player.dispose();
        }
  
        // Reset the video element
        const element = playerData.element;
        if (element) {
          // Force reload of the video element
          const src = element.src;
          element.src = '';
          element.load();
          
          // Small delay before reinitializing
          setTimeout(() => {
            element.src = src;
            
            // Create new player instance
            const newPlayer = videojs(playerId, playerData.config);
            
            // Update our tracking
            playerData.player = newPlayer;
            playerData.loaded = false;
            
            // Set up events for the new player
            this.setupPlayerEvents(playerId, newPlayer);
            
            // Restart monitoring
            this.startMonitoring(playerId);
            
            console.log(`Player ${playerId}: Reinitialized`);
          }, 100);
        }
      } catch (error) {
        console.error(`Player ${playerId}: Reinitialization failed:`, error);
        this.attemptRecovery(playerId);
      }
    }
  
    // Clear monitoring for a player
    clearMonitoring(playerId) {
      // Clear timeout
      if (this.timeouts[playerId]) {
        clearTimeout(this.timeouts[playerId]);
        delete this.timeouts[playerId];
      }
  
      // Clear interval
      if (this.intervals[playerId]) {
        clearInterval(this.intervals[playerId]);
        delete this.intervals[playerId];
      }
    }
  
    // Override this method to handle permanent failures
    onPlayerFailure(playerId) {
      console.error(`Player ${playerId}: Permanent failure - all recovery attempts exhausted`);
      
      // You can implement custom failure handling here
      // For example: show error message, hide player, etc.
      const playerData = this.players[playerId];
      if (playerData && playerData.element) {
        // Example: Add error class to element
        playerData.element.classList.add('video-player-failed');
      }
    }
  
    // Get status of all players
    getPlayersStatus() {
      const status = {};
      const playerIds = Object.keys(this.players);
      
      for (let i = 0; i < playerIds.length; i++) {
        const playerId = playerIds[i];
        const playerData = this.players[playerId];
        
        status[playerId] = {
          loaded: playerData.loaded,
          retries: this.retryCount[playerId] || 0,
          isMonitoring: this.timeouts.hasOwnProperty(playerId) || this.intervals.hasOwnProperty(playerId)
        };
      }
      
      return status;
    }
  
    // Manually trigger recovery for a specific player
    manualRecovery(playerId) {
      console.log(`Manual recovery triggered for player ${playerId}`);
      this.attemptRecovery(playerId);
    }
  
    // Dispose of all players and clean up
    dispose() {
      const playerIds = Object.keys(this.players);
      
      for (let i = 0; i < playerIds.length; i++) {
        const playerId = playerIds[i];
        const playerData = this.players[playerId];
        
        this.clearMonitoring(playerId);
        
        if (playerData.player && !playerData.player.isDisposed()) {
          playerData.player.dispose();
        }
      }
      
      this.players = {};
      this.retryCount = {};
      this.timeouts = {};
      this.intervals = {};
    }
  }
  
  // Simpler alternative without classes (functional approach with closures)
  function createVideoRecoverySystem(options) {
    options = options || {};
    
    const settings = {
      timeout: options.timeout || 10000,
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 2000,
      checkInterval: options.checkInterval || 1000
    };
    
    const players = {};
    const retryCount = {};
    const timeouts = {};
    const intervals = {};
    
    function markAsLoaded(playerId) {
      if (players[playerId]) {
        players[playerId].loaded = true;
        clearMonitoring(playerId);
      }
    }
    
    function clearMonitoring(playerId) {
      if (timeouts[playerId]) {
        clearTimeout(timeouts[playerId]);
        delete timeouts[playerId];
      }
      if (intervals[playerId]) {
        clearInterval(intervals[playerId]);
        delete intervals[playerId];
      }
    }
    
    function checkHealth(playerId) {
      const playerData = players[playerId];
      if (!playerData || playerData.loaded) return;
      
      const player = playerData.player;
      if (player.readyState() >= 1 || player.duration() > 0) {
        markAsLoaded(playerId);
      }
    }
    
    function startMonitoring(playerId) {
      timeouts[playerId] = setTimeout(() => {
        if (!players[playerId].loaded) {
          console.warn(`Player ${playerId}: Timeout`);
          attemptRecovery(playerId);
        }
      }, settings.timeout);
      
      intervals[playerId] = setInterval(() => {
        checkHealth(playerId);
      }, settings.checkInterval);
    }
    
    function attemptRecovery(playerId) {
      const tries = retryCount[playerId] || 0;
      
      if (tries >= settings.maxRetries) {
        console.error(`Player ${playerId}: Max retries exceeded`);
        clearMonitoring(playerId);
        return;
      }
      
      retryCount[playerId] = tries + 1;
      clearMonitoring(playerId);
      
      setTimeout(() => {
        reinitialize(playerId);
      }, settings.retryDelay);
    }
    
    function reinitialize(playerId) {
      const playerData = players[playerId];
      if (!playerData) return;
      
      try {
        if (playerData.player && !playerData.player.isDisposed()) {
          playerData.player.dispose();
        }
        
        const element = playerData.element;
        const src = element.src;
        element.src = '';
        element.load();
        
        setTimeout(() => {
          element.src = src;
          const newPlayer = videojs(playerId, playerData.config);
          playerData.player = newPlayer;
          playerData.loaded = false;
          
          // Re-setup events using arrow functions that capture the outer scope
          newPlayer.one('loadedmetadata', () => {
            markAsLoaded(playerId);
          });
          newPlayer.one('canplay', () => {
            if (!players[playerId].loaded) {
              markAsLoaded(playerId);
            }
          });
          newPlayer.on('error', () => {
            attemptRecovery(playerId);
          });
          
          startMonitoring(playerId);
        }, 100);
        
      } catch (error) {
        console.error(`Failed to reinitialize ${playerId}:`, error);
        attemptRecovery(playerId);
      }
    }
    
    function registerPlayer(playerId, playerConfig) {
      const player = videojs(playerId, playerConfig || {});
      
      players[playerId] = {
        player: player,
        loaded: false,
        config: playerConfig || {},
        element: document.getElementById(playerId)
      };
      
      retryCount[playerId] = 0;
      
      // Set up events using arrow functions that capture the outer scope
      player.one('loadedmetadata', () => {
        console.log(`Player ${playerId}: Metadata loaded`);
        markAsLoaded(playerId);
      });
      
      player.one('canplay', () => {
        if (!players[playerId].loaded) {
          console.log(`Player ${playerId}: Can play`);
          markAsLoaded(playerId);
        }
      });
      
      player.on('error', () => {
        console.warn(`Player ${playerId}: Error`);
        attemptRecovery(playerId);
      });
      
      // Start monitoring
      startMonitoring(playerId);
      
      return player;
    }
    
    return {
      registerPlayer: registerPlayer,
      getStatus: function() {
        const status = {};
        const ids = Object.keys(players);
        for (let i = 0; i < ids.length; i++) {
          const id = ids[i];
          status[id] = {
            loaded: players[id].loaded,
            retries: retryCount[id] || 0
          };
        }
        return status;
      },
      manualRecovery: function(playerId) {
        attemptRecovery(playerId);
      }
    };
  }
  
  // Usage examples:
  
  // Class-based approach:
  // const recovery = new VideoPlayerRecovery({ timeout: 8000, maxRetries: 2 });
  // const player1 = recovery.registerPlayer('video1', { controls: true });
  
  // Functional approach:
  // const recovery = createVideoRecoverySystem({ timeout: 8000, maxRetries: 2 });
  // const player1 = recovery.registerPlayer('video1', { controls: true });
