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
            
            // setup a flag for metadata availability
            this.hasMetadataUsed = false;
            this.loaded = false;
            
            // get player config attributes from the DOM
            this.type = this.rootElement.dataset.mediaplayerType || '';
            
            // create base for custom errors
            this.error = new Error();
            this.error.name = 'MediaPlayerError'
            
            // initiate BC player instance + setup instance props for loading control
            this.videoJSTag = this.rootElement.querySelector('video-js');
            this.clonedVideoJSTagOriginal = this.videoJSTag ? this.videoJSTag.cloneNode(true) : null;
            this.player = null;
            this.loadTimer = null;
            this.loadRetries = 0;
            this.maxLoadRetries = 3;
            
            // Generate unique ID immediately to prevent conflicts
            this.basePlayerId = this.videoJSTag ? this.videoJSTag.id : null;
            this.uniqueId = 'mp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            if (this.videoJSTag) {
                // Ensure unique ID from the start
                this.videoJSTag.id = this.uniqueId;
                this.initPlayer();
            } else {
                console.error('No video-js element found');
            }
        }

        initPlayer = () => {
            try {
                // Clear any existing timer
                this.clearLoadTimer();
                
                // Properly dispose old player and clean up
                if (this.player && !this.player.isDisposed()) {
                    try {
                        this.player.dispose();
                    } catch (e) {
                        console.warn('Error disposing player:', e);
                    }
                    this.player = null;
                }
                
                // Always create fresh DOM element for retries
                if (this.loadRetries > 0 && this.clonedVideoJSTagOriginal) {
                    // Remove any existing video-js elements
                    const existingVideoJS = this.rootElement.querySelector('video-js');
                    if (existingVideoJS && existingVideoJS.parentNode) {
                        existingVideoJS.parentNode.removeChild(existingVideoJS);
                    }
                    
                    // Insert fresh cloned element with unique ID
                    this.videoJSTag = this.clonedVideoJSTagOriginal.cloneNode(true);
                    this.uniqueId = 'mp_retry_' + this.loadRetries + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                    this.videoJSTag.id = this.uniqueId;
                    
                    this.rootElement.appendChild(this.videoJSTag);
                }
                
                // Ensure we have a valid element
                if (!this.videoJSTag || !this.videoJSTag.parentNode) {
                    throw new Error('No valid video-js element available for player creation');
                }
                
                // Wait for DOM to be ready before creating player
                setTimeout(() => {
                    try {
                        // Double-check for existing players with this ID and dispose them
                        if (window.videojs && window.videojs.getPlayers) {
                            const players = window.videojs.getPlayers();
                            Object.keys(players).forEach(playerId => {
                                if (playerId === this.uniqueId && players[playerId] && !players[playerId].isDisposed()) {
                                    try {
                                        players[playerId].dispose();
                                    } catch (e) {
                                        console.warn('Error disposing existing player:', e);
                                    }
                                }
                            });
                        }
                        
                        // Initiate (new) player
                        console.log(`Media debug: Creating player for element:`, this.videoJSTag);
                        this.player = videojs(this.videoJSTag);
                        console.log(`Media debug: Player created with ID:`, this.player.id_);
                        this.loaded = false;
                        
                        // config player options
                        if (this.type === "video") {
                            this.player.fluid(true);
                        }
                        
                        if (this.type === "audio") {
                            this.player.ready(() => {
                                try {
                                    this.player.controlBar.removeChild('subsCapsButton');
                                } catch (e) {
                                    // Control might not exist yet, ignore
                                }
                            });
                        }
                        
                        this.attachEventListeners();
                        this.startLoadTimer();
                    } catch (error) {
                        console.error(`Failed to create player:`, error);
                        this.reloadPlayer();
                    }
                }, 100); // Small delay to ensure DOM is ready

            } catch (error) {
                console.error(`Failed to initialize player:`, error);
                this.reloadPlayer();
            }
        }

        attachEventListeners = () => {
            this.player.ready(() => {
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

            /* player metadata is loaded */
            this.player.on('loadedmetadata', () => {
                if (debugLogsEnabled) console.log(`Log on 'loadedmetadata' event. Player object: `, this.player);
                this.loaded = true;
                this.clearLoadTimer();
                
                if (!this.hasMetadataUsed && this.testMetadata(this.player.mediainfo)) {
                    if (typeof mediaAnalytics !== 'undefined') {
                        mediaAnalytics.addPlayer(this.player, this.type, this.playButton);
                    }
                    this.insertMetadata(`insertMetadata in Player ${this.player.id_} runs on 'loadedmetadata', w/ following metadata:`, this.player.mediainfo);
                }
                
                this.rootElement.dispatchEvent(
                    new CustomEvent('mediaplayer-loaded', { bubbles: true, detail: { id: this.player.id_ } })
                );
            });

            /* Alternative success events for cross-browser compatibility */
            this.player.on('canplay', () => {
                if (!this.loaded) {
                    if (debugLogsEnabled) console.log(`Log on 'canplay' event. Player object: `, this.player);
                    this.loaded = true;
                    this.clearLoadTimer();
                }
            });
            
            // Additional fallback for browsers that don't fire loadedmetadata reliably
            this.player.on('loadeddata', () => {
                if (!this.loaded) {
                    if (debugLogsEnabled) console.log(`Log on 'loadeddata' event. Player loaded via fallback`);
                    this.loaded = true;
                    this.clearLoadTimer();
                }
            });

            /* Error event */
            this.player.on('error', () => {
                if (debugLogsEnabled) console.log(`Player ${this.player.id_} - Error occurred`);
                this.reloadPlayer();
            });

            /* player has started playing */
            this.player.on('play', () => {
                if (this.rootElement.getAttribute('data-mediaplayer-ended')) {
                    this.rootElement.setAttribute('data-mediaplayer-ended', 'false')
                }
                this.rootElement.setAttribute('data-mediaplayer-paused', 'false')
                this.rootElement.dispatchEvent(
                    new CustomEvent('mediaplayer-play', { bubbles: true, detail: { id: this.player.id_ } })
                );
            });
            
            /* player has paused */
            this.player.on('pause', () => {
                this.rootElement.setAttribute('data-mediaplayer-paused', 'true')
                this.rootElement.dispatchEvent(
                    new CustomEvent('mediaplayer-pause', { bubbles: true, detail: { element: this.player.el_, id: this.player.id_ } })
                );
            });
            
            /* player has ended playback */
            this.player.on('ended', () => {
                this.rootElement.setAttribute('data-mediaplayer-ended', 'true')
                this.rootElement.dispatchEvent(
                    new CustomEvent('mediaplayer-ended', { bubbles: true, detail: { id: this.player.id_ } })
                );
            });

            /* custom error */
            if (!this.type) {
                this.error.message = 'Player type should be specified. Add "video" or "audio" value to the `data-mediaplayer-type` attribute on player\'s rootElement'
                throw this.error
            }

            /* play button */
            if (this.playButton) {
                this.playButton.addEventListener('click', this.handlePlayClick)
            }
            /* a play button alternative */
            if (this.playElements) {
                Array.from(this.playElements).forEach(playElement => playElement.addEventListener('click', this.playMedia));
            }
            /* modal */
            if (this.modal) {
                // get elements for focus trap
                this.modal.firstFocusableElement = this.modalCloseButton
                this.modal.focusableElements = Array.from(this.modal.querySelectorAll('.vjs-control-bar .vjs-control:not([disabled])'))
                this.modal.lastFocusableElement = this.modal.focusableElements[this.modal.focusableElements.length - 1]
                // buttons
                this.modalCloseButton.addEventListener('click', this.pauseMedia)
                this.modal.addEventListener('click', this.closeModalOnBackdropClick)
                // pause on close event
                this.modal.addEventListener('close', this.pauseMedia)
                this.modal.addEventListener('keydown', this.trapFocus)
            }
        }

        startLoadTimer = () => {
            this.loadTimer = setTimeout(() => {
                if (!this.loaded) {
                    if (debugLogsEnabled) console.log(`Player ${this.player?.id_ || 'unknown'} - Load timeout, attempting reload`);
                    this.reloadPlayer();
                }
            }, 8000); // Increased timeout to 8 seconds for slower connections
        }

        clearLoadTimer = () => {
            if (this.loadTimer) {
                clearTimeout(this.loadTimer);
                this.loadTimer = null;
            }
        }

        reloadPlayer = () => {
            this.clearLoadTimer();

            if (this.loadRetries >= this.maxLoadRetries) { 
                console.error(`Player ${this.player?.id_ || 'unknown'} failed to load after ${this.maxLoadRetries} retries`);
                return;
            }

            this.loadRetries++;
            if (debugLogsEnabled) console.log(`Player ${this.player?.id_ || 'unknown'}: Retry ${this.loadRetries}/${this.maxLoadRetries}`);
            
            // Wait a bit longer before retry to ensure cleanup is complete
            setTimeout(() => {
                this.initPlayer();
            }, 2000);
        }

        testMetadata = data => {
            if (data && typeof data === 'object') {
                const propertiesToTest = ['name', 'duration', 'poster'];
                return propertiesToTest.every(property => property in data);
            }
            return false;
        }

        // process & insert metadata entries
        insertMetadata = (debugMsg, data) => {
            if (debugLogsEnabled) console.log(debugMsg);
            // do metadata insertion only if required container elements are present in the DOM
            if (this.schemaContainerElement && this.transcriptContainerElement) {
                if (typeof createMediaSchema === 'function') {
                    this.schemaText = createMediaSchema(this.player.mediainfo, this.type, this.transcriptContainerElement.textContent.trim());
                    if (typeof insertMediaSchema === 'function') {
                        insertMediaSchema(this.schemaText, this.schemaContainerElement);
                    }
                }
            }
            if (this.durationElement) {
                if (typeof millisToMinutesAndSeconds === 'function') {
                    this.durationElement.textContent = millisToMinutesAndSeconds(this.player.mediainfo.duration * 1000);
                }
            }
            if (this.posterElement && this.posterElement.tagName === 'IMG') {
                this.posterElement.setAttribute('src', this.player.mediainfo.poster);
            }
            this.hasMetadataUsed = true;
        }

        /* playback related methods */
        playMedia = event => {
            if (this.modal) {
                this.modal.showModal()
            }
            this.player.play()
        }

        pauseMedia = event => {
            if (this.modal) {
                this.modal.close()
            }
            this.player.pause()
        }

        handlePlayClick = () => {
            if (this.player.paused()) {
                this.playMedia()
            } else {
                this.pauseMedia()
            }
        }

        /* modal related methods */
        closeModalOnBackdropClick = event => {
            if (event.target.nodeName === 'DIALOG')
                this.pauseMedia()
        }

        trapFocus = event => {
            if (event.key !== 'Tab') return
            if (event.shiftKey) { // shift + tab
                if (document.activeElement === this.modal.firstFocusableElement) {
                    this.modal.lastFocusableElement.focus()
                    event.preventDefault()
                }
            } else { // tab
                if (document.activeElement === this.modal.lastFocusableElement) {
                    this.modal.firstFocusableElement.focus()
                    event.preventDefault()
                }
            }
        }
    }

    Array.from(playerElements).forEach(playerElement => new MediaPlayer(playerElement));
});
