/**
 * Tracks playback progress and logs milestone events for a media element.
 * Logs: "Start", "25%", "50%", "75%", "Complete", "Play", "Pause", and "Restart".
 *
 * @param {HTMLMediaElement} player - The media element (e.g. <video> or <audio>).
 * @param {number} duration - The total duration of the media (in seconds).
 * @param {number} [interval=250] - Throttle interval for timeupdate checks (in ms).
 */
function trackMediaProgress(player, duration, interval = 250) {
  // Define playback milestones with their respective progress thresholds
  const milestones = [
    { label: 'Start', trigger: 0, logged: false },
    { label: '25%', trigger: 0.25, logged: false },
    { label: '50%', trigger: 0.50, logged: false },
    { label: '75%', trigger: 0.75, logged: false },
    { label: 'Complete', trigger: 1.00, logged: false },
  ];

  let lastCheckTime = 0;   // Used to throttle timeupdate events
  let completed = false;   // Tracks if playback has fully completed

  /**
   * Handles the 'timeupdate' event — fired frequently during playback.
   * Throttles execution and logs milestone progress.
   */
  player.addEventListener('timeupdate', () => {
    const now = Date.now();
    if (now - lastCheckTime < interval) return; // Skip if too soon since last check
    lastCheckTime = now;

    const currentTime = player.currentTime;
    const progress = currentTime / duration;

    // Find and log the next milestone that hasn't been logged yet
    const nextMilestone = milestones.find(m => !m.logged && progress >= m.trigger);
    if (nextMilestone) {
      console.log(nextMilestone.label);
      nextMilestone.logged = true;

      if (nextMilestone.label === 'Complete') {
        completed = true;
      }
    }
  });

  /**
   * Handles the 'play' event.
   * Logs "Play" only if not part of "Start" or "Restart" events.
   * Logs "Restart" if media is replayed after completion.
   */
  player.addEventListener('play', () => {
    const currentTime = player.currentTime;
    const progress = currentTime / duration;

    const justStarted = !milestones[0].logged && currentTime === 0;
    const restarting = completed && currentTime === 0;

    if (restarting) {
      console.log("Restart");
      completed = false;
      milestones.forEach(m => m.logged = false); // Reset milestone logs
    } else if (!justStarted) {
      console.log("Play");
    }
  });

  /**
   * Handles the 'pause' event.
   * Logs "Pause" unless it's immediately after "Start" or just before "Complete".
   */
  player.addEventListener('pause', () => {
    const currentTime = player.currentTime;
    const progress = currentTime / duration;

    const nearStart = !milestones[0].logged && currentTime === 0;

    // Use >= 1.0 to safely account for rounding errors (e.g., 1.00001)
    const nearEnd = progress >= 1.0 && !milestones[milestones.length - 1].logged;

    if (!nearStart && !nearEnd) {
      console.log("Pause");
    }
  });
}
