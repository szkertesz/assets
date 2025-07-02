$(document).ready(function () {
    const mediaPlayerSelector = '.cmp-mediaplayer';
    const transcriptContainerSelector = '[data-mediaplayer-transcript-container]'
    const playerElements = document.querySelectorAll(mediaPlayerSelector)
    let debugLogsEnabled = true;

    class MediaPlayer {
        constructor(domElement) {
            // get basic DOM
            this.rootElement = domElement;
            this.playButton = this.rootElement.querySelector(`${mediaPlayerSelector}__play`);
            this.playElements = this.rootElement.querySelectorAll('[data-mediaplayer-play]');
            this.modal = this.rootElement.querySelector(`${mediaPlayerSelector}__modal`);
            this.modalCloseButton = this.rootElement.querySelector(`${mediaPlayerSelector}__close`);
            this.transcriptContainerElement = this.rootElement.querySelector(`${mediaPlayerSelector}__transcript`) || findClosestElement(this.rootElement, transcriptContainerSelector);
            this.schemaContainerElement = this.rootElement.querySelector(`${mediaPlayerSelector}__schema`);
            this.durationElement = this.rootElement.querySelector(`${mediaPlayerSelector}__duration`);
            this.posterElement = this.rootElement.querySelector(`${mediaPlayerSelector}__poster`);
            
            // Setup flags and state
            this.hasMetadataUsed = false;
            this.loaded = false;
            this.destroyed = false;
            
            // Get player config attributes from the DOM
            this.type = this.rootElement.dataset.mediaplayerType || '';
            
            // Create base for custom errors
            this.error = new Error();
            this.error.name = 'MediaPlayerError'
            
            // Player instance properties
            this.videoJSTag = this.rootElement.querySelector('video-js');
            this.clonedVideoJSTagOriginal = this.videoJSTag ? this.videoJSTag.cloneNode(true) : null;
            this.player = null;
            
            // Loading control properties
            this.loadTimer = null;
            this.loadRetries = 0;
            this.maxLoadRetries = 3;
            this.loadTimeout = 5000; // Increased timeout for slower connections
            
            // Initialize if we have required elements
            if (this.videoJSTag) {
                this.initPlayer();
            } else {
                console.error('MediaPlayer: No video-js element found');
            }
        }

        initPlayer = () => {
            if (this.destroyed) return;
            
            try {
                // Clear any existing timers
                this.clearLoadTimer();
                
                // Dispose old player if exists
                if (this.player && !this.player.isDisposed()) {
                    try {
                        this.player.dispose();
                    } catch (disposeError) {
                        console.warn('Error disposing player:', disposeError);
                    }
                }
                
                // Reset video element properly
                if (this.clonedVideoJSTagOriginal) {
                    // Remove existing video-js element
                    const existingVideoJS = this.rootElement.querySelector('video-js');
                    if (existingVideoJS && existingVideoJS.parentNode) {
                        existingVideoJS.parentNode.removeChild(existingVideoJS);
                    }
                    
                    // Insert fresh cloned element
                    this.videoJSTag = this.clonedVideoJSTagOriginal.cloneNode(true);
                    this.rootElement.appendChild(this.videoJSTag);
                }
                
                // Wait for DOM to be ready before creating player
                setTimeout(() => {
                    if (this.destroyed) return;
                    
                    try {
                        console.log(`Media debug: Creating player for element:`, this.videoJSTag);
                        this.player = videojs(this.videoJSTag);
                        console.log(`Media debug: Player created:`, this.player);
                        
                        this.loaded = false;
                        
                        // Configure player options
                        if (this.type === "video") {
                            this.player.fluid(true);
                        }
                        
                        if (this.type === "audio") {
                            // Use try-catch for controlBar operations
                            try {
                                this.player.controlBar.removeChild('subsCapsButton')
                            } catch (e) {
                                console.warn('Could not remove subsCapsButton:', e);
                            }
                        }
                        
                        this.attachEventListeners();
                        this.startLoadTimer();
                        
                    } catch (playerError) {
                        console.error(`Failed to create player:`, playerError);
                        this.reloadPlayer();
                    }
                }, 100);
                
            } catch (error) {
                console.error(`Failed to initialize player:`, error);
                this.reloadPlayer();
            }
        }

        attachEventListeners = () => {
            if (!this.player || this.destroyed) return;
            
            // Store bound event handlers for cleanup
            this.boundHandlers = {
                playClick: this.handlePlayClick.bind(this),
                playMedia: this.playMedia.bind(this),
                pauseMedia: this.pauseMedia.bind(this),
                closeModalOnBackdropClick: this.closeModalOnBackdropClick.bind(this),
                trapFocus: this.trapFocus.bind(this)
            };
            
            this.player.ready(() => {
                if (this.destroyed) return;
                
                /* player is ready */
                if (debugLogsEnabled) console.log(`Log on 'ready' event. Player object for player#${this.player.id_}: `, this.player);
                
                if (!this.hasMetadataUsed && this.testMetadata(this.player.mediainfo)) {
                    // initiate analytics tracking on player instance
                    if (typeof mediaAnalytics !== 'undefined') {
                        mediaAnalytics.addPlayer(this.player, this.type, this.playButton);
                    }
                    this.insertMetadata(`insertMetadata in Player ${this.player.id_} runs on 'ready', w/ following metadata:`, this.player.mediainfo)
                }
                
                /* create & emit 'ready' custom event */
                this.rootElement.dispatchEvent(
                    new CustomEvent('mediaplayer-ready', { bubbles: true, detail: { id: this.player.id_ } })
                );
            });

            // Enhanced loadedmetadata handler with better browser compatibility
            this.player.on('loadedmetadata', () => {
                if (this.destroyed) return;
                
                if (debugLogsEnabled) console.log(`Log on 'loadedmetadata' event. Player object: `, this.player);
                this.loaded = true;
                this.clearLoadTimer();
                
                // if metadata has still not been processed on 'ready' event, try again
                if (!this.hasMetadataUsed && this.testMetadata(this.player.mediainfo)) {
                    if (typeof mediaAnalytics !== 'undefined') {
                        mediaAnalytics.addPlayer(this.player, this.type, this.playButton);
                    }
                    this.insertMetadata(`insertMetadata in Player ${this.player.id_} runs on 'loadedmetadata', w/ following metadata:`, this.player.mediainfo);
                }
                
                /* create & emit 'loaded' custom event */
                this.rootElement.dispatchEvent(
                    new CustomEvent('mediaplayer-loaded', { bubbles: true, detail: { id: this.player.id_ } })
                );
            });

            // Additional events for better cross-browser compatibility
            this.player.on('canplay', () => {
                if (this.destroyed) return;
                
                if (!this.loaded) {
                    if (debugLogsEnabled) console.log(`Log on 'canplay' event. Player object: `, this.player);
                    this.loaded = true;
                    this.clearLoadTimer();
                }
            });
            
            // Add canplaythrough as another fallback
            this.player.on('canplaythrough', () => {
                if (this.destroyed) return;
                
                if (!this.loaded) {
                    if (debugLogsEnabled) console.log(`Log on 'canplaythrough' event. Player loaded successfully`);
                    this.loaded = true;
                    this.clearLoadTimer();
                }
            });
            
            // Progress event as additional safety net
            this.player.on('progress', () => {
                if (this.destroyed) return;
                
                if (!this.loaded && this.player.buffered().length > 0) {
                    if (debugLogsEnabled) console.log(`Log on 'progress' event. Player has buffered data`);
                    this.loaded = true;
                    this.clearLoadTimer();
                }
            });

            /* Error event */
            this.player.on('error', (error) => {
                if (this.destroyed) return;
                
                if (debugLogsEnabled) console.log(`Player ${this.player.id_} - Error occurred:`, error);
                this.reloadPlayer();
            });

            /* Playback events */
            this.player.on('play', () => {
                if (this.destroyed) return;
                
                if (this.rootElement.getAttribute('data-mediaplayer-ended')) {
                    this.rootElement.setAttribute('data-mediaplayer-ended', 'false')
                }
                this.rootElement.setAttribute('data-mediaplayer-paused', 'false')
                
                this.rootElement.dispatchEvent(
                    new CustomEvent('mediaplayer-play', { bubbles: true, detail: { id: this.player.id_ } })
                );
            });
            
            this.player.on('pause', () => {
                if (this.destroyed) return;
                
                this.rootElement.setAttribute('data-mediaplayer-paused', 'true')
                this.rootElement.dispatchEvent(
                    new CustomEvent('mediaplayer-pause', { bubbles: true, detail: { element: this.player.el_, id: this.player.id_ } })
                );
            });
            
            this.player.on('ended', () => {
                if (this.destroyed) return;
                
                this.rootElement.setAttribute('data-mediaplayer-ended', 'true')
                this.rootElement.dispatchEvent(
                    new CustomEvent('mediaplayer-ended', { bubbles: true, detail: { id: this.player.id_ } })
                );
            });

            /* Custom error handling */
            if (!this.type) {
                this.error.message = 'Player type should be specified. Add "video" or "audio" value to the `data-mediaplayer-type` attribute on player\'s rootElement'
                throw this.error
            }

            /* DOM event listeners */
            if (this.playButton) {
                this.playButton.removeEventListener('click', this.boundHandlers.playClick);
                this.playButton.addEventListener('click', this.boundHandlers.playClick);
            }
            
            if (this.playElements && this.playElements.length > 0) {
                Array.from(this.playElements).forEach(playElement => {
                    playElement.removeEventListener('click', this.boundHandlers.playMedia);
                    playElement.addEventListener('click', this.boundHandlers.playMedia);
                });
            }
            
            /* Modal setup */
            if (this.modal) {
                // get elements for focus trap
                this.modal.firstFocusableElement = this.modalCloseButton
                this.modal.focusableElements = Array.from(this.modal.querySelectorAll('.vjs-control-bar .vjs-control:not([disabled])'))
                this.modal.lastFocusableElement = this.modal.focusableElements[this.modal.focusableElements.length - 1]
                
                // Remove existing listeners before adding new ones
                this.modalCloseButton?.removeEventListener('click', this.boundHandlers.pauseMedia);
                this.modal.removeEventListener('click', this.boundHandlers.closeModalOnBackdropClick);
                this.modal.removeEventListener('close', this.boundHandlers.pauseMedia);
                this.modal.removeEventListener('keydown', this.boundHandlers.trapFocus);
                
                // Add listeners
                this.modalCloseButton?.addEventListener('click', this.boundHandlers.pauseMedia);
                this.modal.addEventListener('click', this.boundHandlers.closeModalOnBackdropClick);
                this.modal.addEventListener('close', this.boundHandlers.pauseMedia);
                this.modal.addEventListener('keydown', this.boundHandlers.trapFocus);
            }
        }

        startLoadTimer = () => {
            this.clearLoadTimer();
            this.loadTimer = setTimeout(() => {
                if (!this.loaded && !this.destroyed) {
                    if (debugLogsEnabled) console.log(`Player ${this.player?.id_ || 'unknown'} - Load timeout after ${this.loadTimeout}ms`);
                    this.reloadPlayer();
                }
            }, this.loadTimeout);
        }

        clearLoadTimer = () => {
            if (this.loadTimer) {
                clearTimeout(this.loadTimer);
                this.loadTimer = null;
            }
        }

        reloadPlayer = () => {
            if (this.destroyed) return;
            
            this.clearLoadTimer();

            if (this.loadRetries >= this.maxLoadRetries) { 
                console.error(`Player failed to load after ${this.maxLoadRetries} retries`);
                return;
            }

            this.loadRetries++;
            if (debugLogsEnabled) console.log(`Player ${this.player?.id_ || 'unknown'}: Retry ${this.loadRetries}/${this.maxLoadRetries}`);
            
            // Wait before retrying to allow cleanup
            setTimeout(() => {
                if (!this.destroyed) {
                    this.initPlayer();
                }
            }, 1000 + (this.loadRetries * 500)); // Progressive delay
        }

        testMetadata = data => {
            if (!data || typeof data !== 'object') return false;
            
            const propertiesToTest = ['name', 'duration', 'poster'];
            return propertiesToTest.every(property => property in data && data[property] != null);
        }

        // process & insert metadata entries
        insertMetadata = (debugMsg, data) => {
            if (this.destroyed) return;
            
            if (debugLogsEnabled) console.log(debugMsg, data);
            
            // do metadata insertion only if required container elements are present in the DOM
            if (this.schemaContainerElement && this.transcriptContainerElement) {
                try {
                    if (typeof createMediaSchema === 'function') {
                        this.schemaText = createMediaSchema(this.player.mediainfo, this.type, this.transcriptContainerElement.textContent.trim());
                        if (typeof insertMediaSchema === 'function') {
                            insertMediaSchema(this.schemaText, this.schemaContainerElement);
                        }
                    }
                } catch (schemaError) {
                    console.warn('Error creating/inserting media schema:', schemaError);
                }
            }
            
            if (this.durationElement && data.duration) {
                try {
                    if (typeof millisToMinutesAndSeconds === 'function') {
                        this.durationElement.textContent = millisToMinutesAndSeconds(data.duration * 1000);
                    }
                } catch (durationError) {
                    console.warn('Error setting duration:', durationError);
                }
            }
            
            if (this.posterElement && this.posterElement.tagName === 'IMG' && data.poster) {
                this.posterElement.setAttribute('src', data.poster);
            }
            
            this.hasMetadataUsed = true;
        }

        /* playback related methods */
        playMedia = (event) => {
            if (this.destroyed || !this.player) return;
            
            if (this.modal) {
                this.modal.showModal();
            }
            
            try {
                this.player.play();
            } catch (playError) {
                console.warn('Error playing media:', playError);
            }
        }

        pauseMedia = (event) => {
            if (this.destroyed || !this.player) return;
            
            if (this.modal) {
                this.modal.close();
            }
            
            try {
                this.player.pause();
            } catch (pauseError) {
                console.warn('Error pausing media:', pauseError);
            }
        }

        handlePlayClick = () => {
            if (this.destroyed || !this.player) return;
            
            try {
                if (this.player.paused()) {
                    this.playMedia();
                } else {
                    this.pauseMedia();
                }
            } catch (error) {
                console.warn('Error handling play click:', error);
            }
        }

        /* modal related methods */
        closeModalOnBackdropClick = (event) => {
            if (event.target.nodeName === 'DIALOG') {
                this.pauseMedia();
            }
        }

        trapFocus = (event) => {
            if (event.key !== 'Tab') return;
            
            if (event.shiftKey) { // shift + tab
                if (document.activeElement === this.modal.firstFocusableElement) {
                    this.modal.lastFocusableElement?.focus();
                    event.preventDefault();
                }
            } else { // tab
                if (document.activeElement === this.modal.lastFocusableElement) {
                    this.modal.firstFocusableElement?.focus();
                    event.preventDefault();
                }
            }
        }

        // Cleanup method for proper disposal
        destroy = () => {
            this.destroyed = true;
            this.clearLoadTimer();
            
            // Remove event listeners
            if (this.boundHandlers) {
                if (this.playButton) {
                    this.playButton.removeEventListener('click', this.boundHandlers.playClick);
                }
                
                if (this.playElements && this.playElements.length > 0) {
                    Array.from(this.playElements).forEach(playElement => {
                        playElement.removeEventListener('click', this.boundHandlers.playMedia);
                    });
                }
                
                if (this.modal) {
                    this.modalCloseButton?.removeEventListener('click', this.boundHandlers.pauseMedia);
                    this.modal.removeEventListener('click', this.boundHandlers.closeModalOnBackdropClick);
                    this.modal.removeEventListener('close', this.boundHandlers.pauseMedia);
                    this.modal.removeEventListener('keydown', this.boundHandlers.trapFocus);
                }
            }
            
            // Dispose player
            if (this.player && !this.player.isDisposed()) {
                try {
                    this.player.dispose();
                } catch (disposeError) {
                    console.warn('Error disposing player:', disposeError);
                }
            }
        }
    }

    // Store player instances for potential cleanup
    const playerInstances = [];
    
    Array.from(playerElements).forEach(playerElement => {
        const instance = new MediaPlayer(playerElement);
        playerInstances.push(instance);
    });
    
    // Optional: Global cleanup function
    window.cleanupMediaPlayers = () => {
        playerInstances.forEach(instance => instance.destroy());
        playerInstances.length = 0;
    };
});
