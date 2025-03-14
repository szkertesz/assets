// Function to set up video tracking for a given video ID
function setupVideoTracking(e) {
    console.log('>>> *** fired setupVideoTracking vidID2="' + e + '"');
    
    videojs(e).ready(function () {
      console.log('123*****************************: ' + _stl.get('mediaName'));
      
      // Assign media metadata to analytics variables
      DOTCOM.analytics.videoName = _stl.get('mediaName');
      DOTCOM.analytics.videoID = _stl.get('mediaId');
      DOTCOM.analytics.videoDuration = _stl.get('mediaDuration');
      
      // Convert video duration to an integer and adjust if it's a multiple of 4
      videoDuration = Math.floor(_stl.get('mediaDuration'));
      if (videoDuration % 4 === 0) {
        videoDuration -= 1;
      }
      
      // Generate milestone tracking points
      createMilestones(videoDuration);
      
      // Attach event listeners
      this.on('loadstart', function () {});
      videojs(e).on('timeupdate', currentTime);
    });
  }
  
  // Function to create milestone tracking points for video playback
  function createMilestones(e) {
    console.log('>>> fired createMilestones video duration="' + e + '"...');
    
    segmentLength = Math.floor(e / 4); // Split duration into 4 equal segments
    
    for (i = 0; i < 5; i++) {
      if (i === 0) {
        mileStoneSecs[i] = segmentLength * i + 1; // Adjust first milestone
        mileStoneHash[segmentLength * i + 1] = mileStoneName[i];
      }
      mileStoneSecs[i] = segmentLength * i;
      mileStoneHash[segmentLength * i] = mileStoneName[i];
    }
    return mileStoneSecs;
  }
  
  // Function to track video time updates and trigger milestone events
  function currentTime() {
    currSecond = Math.floor(videojs(bcPlayerObj).currentTime());
    mileStoneIndx = mileStoneSecs.indexOf(currSecond);
    currTime = videojs(bcPlayerObj).currentTime();
    
    // Detect if a new second has passed
    if (prevSecond < currSecond) {
      secondChanged = true;
      videoTimePlayed += 1;
      videoElapsedSec += 1;
    }
    
    // Check if the current time matches a milestone and trigger analytics
    if (mileStoneIndx !== -1 && secondChanged) {
      analyticsCall(mileStoneHash[currSecond]);
      secondChanged = false;
    }
    
    prevSecond = Math.floor(currTime);
    _stl.set('prevSecond', prevSecond);
  }
  
  // Function to send analytics data when a milestone is reached
  function analyticsCall(e) {
    DOTCOM.analytics.videoMilestone = e;
    _stl.set('currSecond2', mileStoneSecs[1]);
    
    if (e === 'Start') {
      _stl.set('currSecond2', 0);
    }
    
    DOTCOM.analytics.videoCurrSecond = currSecond;
    console.log('>>> fired restarts=' + videoRestarts + ' type=' + e);
    
    DOTCOM.analytics.videoRestarts = 'false';
    if (videoRestarts > 0 && e === 'Start') {
      console.log('>>> fired videoRestarts="' + videoRestarts + '"');
      DOTCOM.analytics.videoRestarts = 'true';
    }
    
    _stl.track('BC_VideoTracking');
    nextMileStone += 1;
    videoElapsedSec = -1;
    
    if (e === 'Start') {
      _stl.set(DOTCOM.analytics.videoName + '-Start', 1);
    } else if (e === 'Complete') {
      prevSecond = -1;
      videoTimePlayed = -1;
      videoRestarts += 1;
    }
  }
  
  // Initialization of tracking variables
  var xyz1 = 'BC';
  var bcPlayers = new Array();
  var bcPlayerObj = new Object();
  var mileStoneName = ['Start', '25%', '50%', '75%', 'Complete'];
  var mileStoneHash = new Object();
  var mileStoneSecs = new Array(4);
  var currSecond = -1;
  var prevSecond = -1;
  var segmentLength = 0;
  var mileStoneIndx = -1;
  var nextMileStone = 0;
  var currTime = -1;
  var secondChanged = false;
  var videoTimePlayed = -1;
  var videoDuration = 0;
  var videoElapsedSec = -1;
  var videoRestarts = 0;
  var videoID1 = '';
  
  // Retrieve the video ID from _stl or fallback to the first video element in the playlist
  if (_stl.get('vId')) {
    videoID1 = _stl.get('vId');
    _stl.set('vId', '');
  } else {
    videoID1 = $('.videoplaylist video').attr('id');
  }
  console.log('>>> fired Video Id: ' + videoID1);
  
  var playerID = videoID1;
  console.log('>>> fired L O O P I N G =' + videojs(playerID).loop());
  
  // If the video is not set to loop, initialize tracking
  if (videojs(playerID).loop() === false) {
    console.log('>>> fired C A L L I N G setupVideoTracking...');
    bcPlayerObj = playerID;
    console.log('>>> b c P l a y e r O b j="' + bcPlayerObj + '"');
    setupVideoTracking(playerID);
  }
  
***

// throttle

// Function to track video time updates and trigger milestone events
let lastTrackedTime = 0; // Stores the last tracked time
let isThrottled = false; // Throttling flag

function currentTime() {
  let currSecond = Math.floor(videojs(bcPlayerObj).currentTime());

  // Throttle updates to avoid excessive function calls
  if (isThrottled || currSecond === lastTrackedTime) {
    return;
  }

  isThrottled = true;
  lastTrackedTime = currSecond;

  setTimeout(() => {
    isThrottled = false; // Reset throttle flag after 1 second
  }, 1000);

  let mileStoneIndx = mileStoneSecs.indexOf(currSecond);
  let currTime = videojs(bcPlayerObj).currentTime();

  // Detect if a new second has passed
  if (prevSecond < currSecond) {
    secondChanged = true;
    videoTimePlayed += 1;
    videoElapsedSec += 1;
  }

  // Check if the current time matches a milestone and trigger analytics
  if (mileStoneIndx !== -1 && secondChanged) {
    analyticsCall(mileStoneHash[currSecond]);
    secondChanged = false;
  }

  prevSecond = Math.floor(currTime);
  _stl.set('prevSecond', prevSecond);
}

/* All together */

// Throttle variables
let isThrottled = false;
let lastTrackedTime = -1;

function currentTime() {
  let currSecond = Math.floor(videojs(bcPlayerObj).currentTime());

  // Avoid redundant updates within the same second
  if (currSecond === lastTrackedTime) {
    return;
  }

  // Throttle execution to once per second
  if (isThrottled) {
    return;
  }

  isThrottled = true;
  lastTrackedTime = currSecond;

  setTimeout(() => {
    isThrottled = false; // Reset throttle flag after 1 second
  }, 1000);

  let mileStoneIndx = mileStoneSecs.indexOf(currSecond);
  let currTime = videojs(bcPlayerObj).currentTime();

  // Detect if a new second has passed
  if (prevSecond < currSecond) {
    secondChanged = true;
    videoTimePlayed += 1;
    videoElapsedSec += 1;
  }

  // Check if the current time matches a milestone and trigger analytics
  if (mileStoneIndx !== -1 && secondChanged) {
    analyticsCall(mileStoneHash[currSecond]);
    secondChanged = false;
  }

  prevSecond = Math.floor(currTime);
  _stl.set('prevSecond', prevSecond);
}


