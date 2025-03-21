
launch.js

```js
{
        id: "RL774f7db1086f41f7b37bbd98de09614c",
        name: "EBR - Click - Video Tracking",
        events: [{
            modulePath: "core/src/lib/events/entersViewport.js",
            settings: {
                frequency: "firstEntry",
                elementSelector: "video-js,div[data-video-id]"
            },
            ruleOrder: 50
        }],
        conditions: [{
            modulePath: "core/src/lib/conditions/customCode.js",
            settings: {
                source: function() {
                    var e = $(this).attr("id");
                    return !!e && (_satellite.setVar("vId", e),
                    console.log("Fired vId " + e),
                    !0)
                }
            }
        }],
        actions: [{
            modulePath: "core/src/lib/actions/customCode.js",
            settings: {
                global: !0,
                source: "https://assets.adobedtm.com/b124caa02ab9/525e8732929a/10b0be75c54d/RC7ed2818a15ea44df8d262298e9df94f7-source.min.js",
                language: "javascript",
                isExternal: !0
            }
        }]
    }
```

Key Components of the Rule:
Events:

The modulePath: "core/src/lib/events/entersViewport.js" ensures the rule triggers when the specified elements (matching elementSelector: "video-js,div[data-video-id]") enter the viewport.

The frequency: "firstEntry" setting ensures this only happens the first time the condition is met during the session.

Conditions:

The condition's custom code uses $(this).attr("id") to extract the ID of the video element that triggered the event.

If an ID is found, it sets _satellite.setVar("vId", e) for tracking purposes and logs the ID (console.log("Fired vId " + e)).

Actions:

A custom action (modulePath: "core/src/lib/actions/customCode.js") is executed.

The action fetches and executes external JavaScript code (source: "https://assets.adobedtm.com/..."), which could include logic to call setupVideoTracking.

Potential Interaction with setupVideoTracking:
The extracted video ID (vId) from the condition is stored via _satellite.setVar.

If the external JavaScript code specified in the action (located at the source URL) contains logic to invoke setupVideoTracking, it could use _satellite.getVar("vId") to retrieve the video ID and call the function for each video player.

How It Could Handle Multiple Players:
The elementSelector targets all elements matching "video-js,div[data-video-id]". As each instance enters the viewport, the rule triggers separately for each.

The condition extracts and sets a unique video ID (vId) for each element.

The external JavaScript then uses this ID to call setupVideoTracking for the specific video player instance.

Conclusion:
The EBR - Click - Video Tracking rule looks like it’s designed to dynamically track multiple video players on the page. However, to confirm that setupVideoTracking is being called, you’ll need to inspect the external JavaScript file (RC7ed2818a15ea44df8d262298e9df94f7-source.min.js) referenced in the action. If this file explicitly references and invokes setupVideoTracking, then the rule is indeed responsible.

the external script:
```js
_satellite.__registerScript('https://assets.adobedtm.com/b124caa02ab9/525e8732929a/10b0be75c54d/RC7ed2818a15ea44df8d262298e9df94f7-source.min.js', "var vidId=_satellite.getVar(\"vId\"),media=videojs(vidId),mediaName=media.mediainfo.name,mediaDuration=media.mediainfo.duration,mediaId=media.mediainfo.id;_satellite.setVar(\"mediaName\",mediaName),_satellite.setVar(\"mediaDuration\",mediaDuration),_satellite.setVar(\"mediaId\",mediaId),_satellite.track(\"videoPlaylistTrack\");");

var vidId = _satellite.getVar("vId");
var media = videojs(vidId);
var mediaName = media.mediainfo.name;
var mediaDuration = media.mediainfo.duration;
var mediaId = media.mediainfo.id;

_satellite.setVar("mediaName", mediaName);
_satellite.setVar("mediaDuration", mediaDuration);
_satellite.setVar("mediaId", mediaId);
_satellite.track("videoPlaylistTrack");
```

## External Script Behavior
1. Retrieves Video Player Info:

The script gets the vId (video ID) using _satellite.getVar("vId"), which is presumably set in a prior step (like in the rule you shared earlier).

It uses videojs(vidId) to create a Brightcove VideoJS player instance for the specified video.

2. Extracts Media Information:

Accesses properties like media.mediainfo.name, media.mediainfo.duration, and media.mediainfo.id from the videojs player instance.

These properties provide details about the video's name, duration, and ID.

3. Sets Adobe Launch Variables:

- Stores the extracted media information in Adobe Launch variables using _satellite.setVar:

  - mediaName: Name of the video.

  - mediaDuration: Duration of the video.

  - mediaId: ID of the video.

4. Triggers Analytics Tracking:

Uses _satellite.track("videoPlaylistTrack") to send the media information to Adobe Analytics or a similar tracking system.

### Relation to setupVideoTracking
While this script doesn't directly call setupVideoTracking, it prepares the necessary information (e.g., video ID, name, duration) for tracking purposes. Here's how it might fit into the broader workflow:

- The Launch rule (EBR - Click - Video Tracking) triggers when a video enters the viewport.

- The vId (video ID) is set by the rule's condition.

- This external script retrieves the vId and gathers media information, which could then be used by setupVideoTracking to configure milestone tracking and event listeners for the video.

While this script doesn't directly call setupVideoTracking, it prepares the necessary information (e.g., video ID, name, duration) for tracking purposes. Here's how it might fit into the broader workflow:

The Launch rule (EBR - Click - Video Tracking) triggers when a video enters the viewport.

The vId (video ID) is set by the rule's condition.

***

1. Triggering the Rule for Video Tracking
- Rule Name: EBR - Click - Video Tracking

- Event: The rule is triggered when video elements (video-js or div[data-video-id]) enter the viewport.

  - This is handled by the event module entersViewport.js with the frequency: "firstEntry" setting, ensuring the rule fires only the first time each video comes into view.

- Condition: The rule checks if the video element has a valid id attribute.

  - If an id exists, the condition uses _satellite.setVar("vId", id) to store the video ID (vId) for tracking purposes.

  - Logs this video ID for debugging (console.log("Fired vId " + e)).

2. Executing the External Script
- When the condition is met, the rule triggers an action to execute an external script from a specific URL:

  - The external script fetches the video player instance using the vId (video ID) via videojs(vidId).

  - Media details (name, duration, id) are retrieved from the mediainfo object of the player instance.

  - These media details are stored in Adobe Launch variables:

    - mediaName, mediaDuration, mediaId.

  - The script tracks the video playlist interaction by firing _satellite.track("videoPlaylistTrack").

3. Calling setupVideoTracking
- Based on the retrieved and stored media details, setupVideoTracking is invoked for each video player.

  - The rule indirectly enables this function by ensuring the necessary variables (e.g., mediaName, mediaId) are set and accessible.

- setupVideoTracking performs the following tasks:

  - Sets up milestones: Divides the video duration into milestones (Start, 25%, 50%, 75%, Complete).

  - Attaches event listeners: Tracks playback events like loadstart and timeupdate for detailed analytics.

4. Tracking Video Progress
- As videos play, the currentTime function (within setupVideoTracking) monitors the playback position and detects when milestones are reached.

- Milestone events trigger the analyticsCall function, which:

  - Logs the milestone (Start, 25%, etc.).

  - Updates tracking variables (e.g., videoTimePlayed, videoRestarts).

  - Sends tracking data via _satellite.track("BC_VideoTracking").

5. Repeating for Multiple Videos
- The Adobe Launch rule runs separately for each video player as they enter the viewport.

- The external script dynamically tracks each video by retrieving its vId and media details.

- The setupVideoTracking function is called for each video player, enabling milestone tracking and event logging independently.

***

Visual summary

1. Adobe Launch Rule: "EBR - Click - Video Tracking"
   └── Trigger: "entersViewport.js" (Elements: "video-js, div[data-video-id]")
   └── Frequency: "firstEntry"
   └── Condition:
       └── Check for "id" attribute of video element
       └── If valid, set video ID in _satellite (e.g., `vId`)
   └── Action: Execute external script:
       └── Fetch and initialize videojs(vidId)
       └── Retrieve media information: name, duration, and ID
       └── Store info in _satellite variables
       └── Trigger _satellite.track("videoPlaylistTrack")
   
2. External Script Execution:
   └── Script triggered for each video instance in viewport
   └── _satellite.getVar retrieves stored `vId`
   └── Prepares data for tracking and sends via Adobe Launch
   
3. setupVideoTracking Function:
   └── Dynamically invoked for each video instance
   └── Divides video into milestones: Start, 25%, 50%, 75%, Complete
   └── Sets up event listeners:
       └── loadstart: Initialize player
       └── timeupdate: Track progress and milestones
   └── Sends tracking data for milestones via _satellite.track("BC_VideoTracking")

Here’s a more straightforward explanation for your teammates:

Video Player Instances:

The process starts when videos on the page are detected (like when they appear in the viewport). Each video has a unique ID used for tracking purposes.

First videojs Interaction (External Script):

The external script retrieves the video instance for each video by using videojs(videoID).

It gathers basic details like the video’s name, duration, and ID, and stores these in Adobe Launch variables for tracking.

Second videojs Interaction (Tracking Setup):

Later, the setupVideoTracking function is called for each video, again using videojs(videoID) to access the instance.

This is where detailed tracking is set up, like dividing the video into milestones (e.g., 25%, 50%) and adding event listeners to monitor playback progress.

## Benefits of Calling setupVideoTracking in the Frontend

### Eliminates Redundant Processing:

- If setupVideoTracking is directly integrated into the AEM frontend, you can avoid initializing and processing video player instances twice (as in the current flow with the external script and setup functions).

- Direct invocation can reduce reliance on Adobe Launch rules and dynamic variable setting (_satellite), simplifying the flow.

### Faster Execution:

By skipping the need to trigger external scripts and rules, you can handle video tracking in real time when videos are rendered on the page.

### Better Control:

You can directly manage milestones and event listeners for video players in the frontend code without having to depend on Launch rules to pass vId and other variables.


## Potential Challenges

### Increased Responsibility in Frontend:

Moving tracking logic to the AEM frontend means developers need to ensure proper initialization, error handling, and synchronization of video player instances.

If you move tracking logic to the frontend, updates will require code changes in AEM.

### Compatibility and Scalability:

If the website evolves to include more videos or dynamic loading, maintaining separate tracking logic could become less efficient.

### Analytics Consistency:

Ensure that direct call methods for sending events conform to the analytics platform's requirements (Adobe Analytics). You'll need to align the event schema and data mapping manually.

## When It’s Performance Friendly

It is performance-friendly if:

- Videos are static and loaded during page rendering.

- The number of video instances is predictable or manageable.

- Direct call methods are optimized to send lightweight analytics payloads.

## Proposed Workflow

### A

Here’s an optimized workflow for calling setupVideoTracking in the AEM frontend:

1. Initialize Video Player Instances:

Use AEM’s component lifecycle to initialize video.js instances as soon as they are rendered.

2. Directly Call setupVideoTracking:

Pass the player ID to setupVideoTracking for each video.

3. Use Milestones and Listeners:

Set milestones and attach event listeners to track progress, just as setupVideoTracking currently does.

4. Send Events via Direct Call:

### B

Potential Flow with _satellite.track
1. Frontend Workflow in AEM:

- For each video player instance, initialize videojs and call setupVideoTracking directly.

- Use the timeupdate event listener in setupVideoTracking to monitor playback progress and detect milestones (Start, 25%, 50%, etc.).

2. Tracking Events via _satellite.track:

- When a milestone is reached, trigger _satellite.track with appropriate parameters, such as:

    - Milestone name (Start, 25%, etc.).

    - Video name, ID, and duration (available from Adobe Launch variables set in the external script).

Example:

```javascript
_satellite.track("VideoMilestone", {
    milestone: milestoneName, // e.g., "25%"
    videoName: videoName,
    videoID: videoID,
    videoDuration: videoDuration
});
```

3. Processing in Adobe Launch:

- Define a rule in Adobe Launch to handle the VideoMilestone event and process the data sent from _satellite.track.

- This rule can forward the data to Adobe Analytics or other analytics platforms.

## Best Practices for Performance
1. Reduce Redundant Calls:

Ensure _satellite.track is triggered only when necessary (e.g., once per milestone per session).

2. Minimize Payload:

Limit the amount of data sent with each _satellite.track call to include only the essential parameters.

3. Optimize setupVideoTracking:

Avoid repeated calls to videojs for already initialized instances. Use references to player objects instead.

***

## Factors That Impact Performance with Multiple Videos
1. Number of Video Instances:

- If you have 5–10 videos on a page, modern browsers and devices can typically handle this without significant issues.

- When the number grows to 20+ videos on a page, performance may degrade due to higher demands on CPU, memory, and JavaScript processing.

- Pages with 50+ videos often lead to noticeable lag or crashes, especially on low-power devices like older smartphones or tablets.

2. Heavy JavaScript Processing:

- Each video requires initialization (videojs()), event listeners (e.g., timeupdate), and tracking logic. As the number of videos increases, these operations can overwhelm the browser.

3. Network Overhead:

- Each video player might load assets (e.g., player scripts, thumbnails), increasing network traffic.

- If milestones trigger frequent _satellite.track events for many videos, the browser could struggle with the sheer number of analytics calls.

4. Device and Browser Limitations:

Low-power devices (e.g., entry-level smartphones) and older browsers are less capable of managing complex JavaScript or rendering numerous videos smoothly.

## Performance Concerns with a High Number of Videos
1. CPU Usage:

Video playback and event listeners like timeupdate require frequent calculations. With many videos, the CPU usage spikes.

2. Memory Consumption:

Each video player instance consumes memory for its video element, associated scripts, and tracking logic.

3. UI Responsiveness:

Heavy JavaScript execution for milestones, tracking calls, and rendering can cause delays in user interactions (e.g., slow scrolling).

4. Battery Drain (Mobile Devices):

Multiple videos playing or processing simultaneously can quickly drain the battery of mobile devices.

## How to Mitigate Performance Issues
- Lazy Initialization: Only initialize video players when they are about to play (e.g., enter the viewport).

- Pause/Unload Inactive Videos: Stop tracking and playback for videos not currently in use.

- Debounce Analytics Calls: Reduce the frequency of _satellite.track events to prevent overloading.

- Optimize Tracking Logic: Minimize global variables and avoid redundant calculations for each video.

__If only one video is allowed to play at a time by pausing other videos when a new playback starts, the performance concerns are significantly reduced__

## Performance Impact
1. Reduced CPU and Memory Usage:

- Pausing videos ensures that only one video is actively consuming resources (e.g., video decoding, event listener execution).

- This eliminates the cumulative impact of having multiple videos playing simultaneously, which is typically a major performance bottleneck.

2. Optimized Event Listeners:

- Since only the active video triggers events like timeupdate, milestone tracking, and _satellite.track, the JavaScript processing overhead is minimized.

- This approach prevents redundant calls across inactive videos.

3. Improved Network Efficiency:

Only the active video loads and streams content, reducing bandwidth usage and the risk of network congestion.

4. Better UI Responsiveness:

Fewer active video players mean the browser has more resources available for handling user interactions like scrolling or navigating.

***

__By enforcing single-video playback, the page can handle a much larger number of video instances without significant performance concerns. The CPU, memory, and network resources are focused on one video at a time, which is ideal for scalability.__

## When This Approach Becomes Performance-Friendly
Even with 20–50 videos on a page, the performance impact is manageable because only one video is active at any given time.

The main consideration becomes ensuring efficient initialization and cleanup when switching between active videos.

## Recommendations to Maximize Performance
1. Lazy Loading:

Initialize video players only when their playback is requested (or when they enter the viewport).

2. Efficient Switching:

When a video starts playing:

- Pause all other active video players.

- Unload their tracking listeners to prevent unnecessary processing.

3. Debouncing Analytics Calls:

Ensure _satellite.track is triggered efficiently for the active video, avoiding overloading the analytics system with frequent milestone events.

4. State Management:

Maintain a lightweight state to track which video is currently active. This ensures smooth transitions and prevents redundant operations on paused videos.

***

```js
// Array to hold all video player instances
let videoPlayers = [];

// Function to initialize video tracking and single-playback logic
function initializeVideoTracking() {
    const videoElements = document.querySelectorAll('video'); // Select all video elements on the page

    videoElements.forEach((videoElement) => {
        const videoID = videoElement.id; // Ensure each video has a unique ID
        const player = videojs(videoID); // Initialize the video.js player instance

        videoPlayers.push(player); // Add to the list of players

        // Event listener to ensure only one video plays at a time
        player.on('play', () => {
            // Pause other players
            videoPlayers.forEach((otherPlayer) => {
                if (otherPlayer !== player) {
                    otherPlayer.pause();
                }
            });

            // Call the setupVideoTracking logic
            setupVideoTracking(videoID);
        });
    });
}

// Function to set up video tracking for milestones and playback events
function setupVideoTracking(videoID) {
    const player = videojs(videoID);

    // Retrieve and log video information
    const mediaName = player.mediainfo.name || 'Unknown Video';
    const mediaDuration = Math.floor(player.mediainfo.duration || 0);
    const mediaId = player.mediainfo.id || videoID;

    console.log(`Tracking started for Video: ${mediaName}, ID: ${mediaId}, Duration: ${mediaDuration}s`);

    // Set up milestone tracking
    const milestones = [25, 50, 75, 100]; // Milestones as percentages
    const milestoneTriggers = milestones.map((milestone) => Math.floor((mediaDuration * milestone) / 100));
    let lastMilestone = -1;

    player.on('timeupdate', () => {
        const currentTime = Math.floor(player.currentTime());

        // Check if a milestone is reached
        milestoneTriggers.forEach((milestoneTime, index) => {
            if (currentTime >= milestoneTime && lastMilestone < index) {
                lastMilestone = index; // Update the last milestone reached

                // Send tracking event via _satellite.track
                _satellite.track('VideoMilestone', {
                    milestone: `${milestones[index]}%`,
                    videoName: mediaName,
                    videoID: mediaId,
                    videoDuration: mediaDuration,
                });

                console.log(`Milestone reached: ${milestones[index]}%`);
            }
        });
    });

    // Optional: Track playback start and completion
    player.on('play', () => {
        _satellite.track('VideoStart', {
            videoName: mediaName,
            videoID: mediaId,
            videoDuration: mediaDuration,
        });
        console.log('Video started');
    });

    player.on('ended', () => {
        _satellite.track('VideoComplete', {
            videoName: mediaName,
            videoID: mediaId,
            videoDuration: mediaDuration,
        });
        console.log('Video completed');
    });
}

// Initialize tracking when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeVideoTracking);
```

```js
function setupVideoTracking(e) {
    console.log('>>> *** fired setupVideoTracking vidID2="' + e + '"');
    videojs(e).ready(function() {
        console.log("123*****************************: " + _satellite.getVar("mediaName"));
        MSCOM.analytics.videoName = _satellite.getVar("mediaName");
        MSCOM.analytics.videoID = _satellite.getVar("mediaId");
        MSCOM.analytics.videoDuration = _satellite.getVar("mediaDuration");
        (videoDuration = 1 * Math.floor(_satellite.getVar("mediaDuration"))) % 4 == 0 && (videoDuration -= 1);

        createMilestones(videoDuration);

        this.on("loadstart", function() {
            // Placeholder: Loading behavior (if needed)
        });

        videojs(e).on("timeupdate", currentTime);

        // Add 'play' event listener to enforce single-video playback
        this.on("play", function() {
            pauseOtherVideos(e); // Ensure other videos are paused
        });
    });
}

// Function to pause all other videos on the page
function pauseOtherVideos(currentVideoID) {
    console.log(">>> Ensuring only one video plays at a time...");
    bcPlayers.forEach(function(playerID) {
        if (playerID !== currentVideoID) {
            const otherPlayer = videojs(playerID);
            if (!otherPlayer.paused()) {
                otherPlayer.pause();
                console.log(">>> Paused video: " + playerID);
            }
        }
    });
}

// Original createMilestones function (no changes)
function createMilestones(e) {
    for (console.log('>>> fired createMilestones video duration="' + e + '"...'),
        segmentLength = Math.floor(e / 4),
        i = 0; i < 5; i++)
        0 == i && (mileStoneSecs[i] = segmentLength * i + 1,
            mileStoneHash[segmentLength * i + 1] = mileStoneName[i]),
        mileStoneSecs[i] = segmentLength * i,
        mileStoneHash[segmentLength * i] = mileStoneName[i];
    return mileStoneSecs;
}

// Original currentTime function (no changes)
function currentTime() {
    Math.floor(videojs(bcPlayerObj).currentTime());
    Math.floor(videojs(bcPlayerObj).duration() / 4);
    currSecond = Math.floor(videojs(bcPlayerObj).currentTime());
    mileStoneIndx = mileStoneSecs.indexOf(currSecond);
    currTime = videojs(bcPlayerObj).currentTime();
    prevSecond < currSecond && (secondChanged = !0,
        videoTimePlayed += 1,
        videoElapsedSec += 1),
        -1 != mileStoneIndx && secondChanged && (analyticsCall(mileStoneHash[currSecond]),
            secondChanged = !1);
    prevSecond = Math.floor(currTime);
    _satellite.setVar("prevSecond", prevSecond);
}

// Original analyticsCall function (no changes)
function analyticsCall(e) {
    MSCOM.analytics.videoMilestone = e;
    _satellite.setVar("currSecond2", mileStoneSecs[1]);
    "Start" == e && _satellite.setVar("currSecond2", 0);
    MSCOM.analytics.videoCurrSecond = currSecond;
    console.log(">>> fired restarts=" + videoRestarts + " type=" + e);
    MSCOM.analytics.videoRestarts = "false";
    videoRestarts > 0 && "Start" == e && (console.log('>>> fired videoRestarts="' + videoRestarts + '"'),
        MSCOM.analytics.videoRestarts = "true");
    _satellite.track("BC_VideoTracking");
    nextMileStone += 1;
    videoElapsedSec = -1;
    "Start" == e && _satellite.setVar(MSCOM.analytics.videoName + "-Start", 1);
    "Complete" == e && (prevSecond = -1,
        videoTimePlayed = -1,
        videoRestarts += 1);
}

// Updated global array to track multiple video players
var bcPlayers = []; // Stores video IDs for all video instances

var xyz1 = "BRIGHTCOVE",
    bcPlayerObj = new Object,
    mileStoneName = ["Start", "25%", "50%", "75%", "Complete"],
    mileStoneHash = new Object,
    mileStoneSecs = new Array(4),
    currSecond = -1,
    prevSecond = -1,
    segmentLength = 0,
    mileStoneIndx = -1,
    nextMileStone = 0,
    currTime = -1,
    secondChanged = !1,
    videoTimePlayed = -1,
    videoDuration = 0,
    videoElapsedSec = -1,
    videoRestarts = 0,
    videoID1 = "";

// Add videoID to players array and call setup tracking
_satellite.getVar("vId") ? (
    videoID1 = _satellite.getVar("vId"),
    _satellite.setVar("vId", ""),
    bcPlayers.push(videoID1) // Add to global player tracking
) : (
    videoID1 = $(".videoplaylist video").attr("id"),
    bcPlayers.push(videoID1)
);

console.log(">>> fired Video Id: " + videoID1);
var playerID = videoID1;
console.log(">>> fired L O O P I N G =" + videojs(playerID).loop());
0 == videojs(playerID).loop() && (
    console.log(">>> fired C A L L I N G setupVideoTracking..."),
    bcPlayerObj = playerID,
    console.log('>>> b c P l a y e r O b j="' + bcPlayerObj + '"'),
    setupVideoTracking(playerID)
);

```

```js
// Array to hold all video player instances
let bcPlayers = [];

// Function to set up video tracking and ensure only one video plays at a time
function setupVideoTracking(videoInstance) {
    const videoID = videoInstance.id; // Assuming each video element has a unique ID

    console.log(`>>> *** fired setupVideoTracking for video ID: "${videoID}"`);

    videoInstance.ready(function() {
        console.log("Tracking setup for video:", videoID);

        // Extract video details directly from the player instance
        const mediaName = videoInstance.mediainfo.name || "Unknown Video";
        const mediaDuration = Math.floor(videoInstance.mediainfo.duration || 0);
        const mediaId = videoInstance.mediainfo.id || videoID;

        console.log(`Media Info: Name="${mediaName}", ID="${mediaId}", Duration="${mediaDuration}"`);

        // Initialize milestones
        (videoDuration = 1 * mediaDuration) % 4 === 0 && (videoDuration -= 1);
        createMilestones(videoDuration);

        // Set up playback-related event listeners
        videoInstance.on("loadstart", function() {
            // Placeholder: Handle video load start logic (if needed)
            console.log(`Video "${videoID}" load started.`);
        });

        videoInstance.on("timeupdate", function() {
            currentTime(videoInstance); // Pass the video instance to track progress
        });

        // Add a 'play' listener to enforce single-video playback
        videoInstance.on("play", function() {
            pauseOtherVideos(videoID); // Pause other videos except the current one
        });
    });
}

// Function to pause all other videos except the currently playing one
function pauseOtherVideos(currentVideoID) {
    console.log(">>> Ensuring only one video plays at a time...");
    bcPlayers.forEach(function(player) {
        if (player.id !== currentVideoID) {
            if (!player.paused()) {
                player.pause();
                console.log(`>>> Paused video: ${player.id}`);
            }
        }
    });
}

// Function to handle video milestones and trigger events
function createMilestones(videoDuration) {
    console.log(`>>> fired createMilestones for video duration: "${videoDuration}"`);
    const segmentLength = Math.floor(videoDuration / 4);
    for (let i = 0; i < 5; i++) {
        if (i === 0) {
            mileStoneSecs[i] = segmentLength * i + 1;
            mileStoneHash[segmentLength * i + 1] = mileStoneName[i];
        } else {
            mileStoneSecs[i] = segmentLength * i;
            mileStoneHash[segmentLength * i] = mileStoneName[i];
        }
    }
    return mileStoneSecs;
}

// Function to handle current time logic and milestones
function currentTime(videoInstance) {
    const currSecond = Math.floor(videoInstance.currentTime());
    const videoDuration = Math.floor(videoInstance.duration());
    const segmentLength = Math.floor(videoDuration / 4);
    const mileStoneIndx = mileStoneSecs.indexOf(currSecond);

    if (prevSecond < currSecond) {
        secondChanged = true;
        videoTimePlayed += 1;
        videoElapsedSec += 1;
    }

    if (mileStoneIndx !== -1 && secondChanged) {
        analyticsCall(mileStoneHash[currSecond]);
        secondChanged = false;
    }

    prevSecond = currSecond;
}

// Function to handle analytics calls (removes reliance on _satellite variables)
function analyticsCall(milestone) {
    console.log(`Analytics Call: Milestone "${milestone}" triggered.`);
    console.log(`Video Milestone: ${milestone}, Video Time Played: ${videoTimePlayed}`);
    // Add your analytics tracking code here, such as direct API calls or other methods
}

// Add references for each video instance and initialize tracking
document.addEventListener("DOMContentLoaded", function() {
    const videoElements = document.querySelectorAll("video"); // Get all video elements
    videoElements.forEach(function(videoElement) {
        const player = videojs(videoElement.id); // Initialize a video.js player instance
        bcPlayers.push(player); // Store the player instance for later reference
        setupVideoTracking(player); // Set up tracking for the video instance
    });
});

// Variables and constants (retain existing ones)
const mileStoneName = ["Start", "25%", "50%", "75%", "Complete"];
let mileStoneHash = {};
let mileStoneSecs = [];
let prevSecond = -1;
let secondChanged = false;
let videoTimePlayed = 0;
let videoElapsedSec = 0;

```

***

Impact Analysis: Performance Implications of Replacing Adobe Launch Custom Code-Based Media Player Analytics with a Direct Call Rule Implementation in AEM Frontend

Current Implementation (Adobe Launch Custom Code-Based Analytics)

Step-by-Step Breakdown

Triggering Mechanism:

The rule "EBR - Click - Video Tracking" is triggered when a video element enters the viewport.

It uses the entersViewport.js module with firstEntry frequency.

The selector targets elements: video-js or div[data-video-id].

Conditions for Execution:

The custom condition script checks whether the video element has an id attribute.

If an id is found, _satellite.setVar("vId", e) stores it in Adobe Launch’s data layer.

The console.log("Fired vId " + e) confirms execution.

The function returns true, allowing the rule to proceed.

Action Execution:

The rule executes an external JavaScript file (RC7ed2818a15ea44df8d262298e9df94f7-source.min.js).

The script is loaded globally and executed in the page context.

The external script is responsible for sending analytics events to Adobe Analytics.

Media Player Tracking Logic:

The implementation includes additional JavaScript for tracking video interactions using the Video.js library.

The setupVideoTracking function initializes tracking by retrieving metadata (mediaName, mediaId, mediaDuration) and setting up milestone tracking.

Milestone tracking divides the video duration into four equal segments (25%, 50%, 75%, Complete) and triggers analytics calls when a milestone is reached.

The currentTime function listens for time updates and fires analytics events at milestone points.

_stl.track("BC_VideoTracking") is used to send analytics data when a milestone is reached.

A restart counter tracks whether a video has been restarted, affecting the analytics tracking logic.

Custom Code for Metadata and Tracking:

The external script retrieves video metadata using videojs(vidId).mediainfo and stores it using _satellite.setVar.

Once the metadata is stored, _satellite.track("videoPlaylistTrack") is fired to send the tracking event.

Performance Considerations of the Current Approach

Dependency on _satellite.setVar: Introduces reliance on Adobe Launch's data elements, potentially affecting load times and data consistency.

Custom Code Execution Overhead: The script execution occurs within the browser, possibly introducing delays in analytics events.

External Script Loading: Fetching the JavaScript file from Adobe’s CDN adds a network request, increasing page load time.

Viewport-Based Triggering: Can lead to unintended tracking if a video enters the viewport but isn't interacted with.

Milestone Tracking Complexity: Additional processing for milestone tracking might introduce execution overhead.

Proposed Implementation (Direct Call Rule-Based AEM Frontend Analytics)

Step-by-Step Breakdown

Triggering Mechanism:

Instead of relying on entersViewport.js, the tracking logic is integrated within the AEM frontend.

When a user interacts with a video (e.g., play, pause, seek), the frontend explicitly fires a Direct Call Rule (_satellite.track("videoInteraction")).

Data Handling:

No reliance on _satellite.setVar, as data is passed directly within the Direct Call Rule payload.

The AEM frontend script retrieves video metadata and directly pushes it to Adobe Analytics.

Milestone tracking logic is handled within AEM without needing additional custom JavaScript for video event listeners.

A players object stores all video player instances, along with state variables such as mileStoneHash, allowing better state management.

Each instance is initialized with setupVideoTracking(playerInstance), ensuring consistency across multiple videos.

Action Execution:

The Direct Call Rule executes within Adobe Launch, sending analytics data immediately without an external script dependency.

Data Layer updates are managed within the AEM application, reducing reliance on Adobe Launch's internal mechanisms.

Performance Considerations of the Proposed Approach

Reduced Network Requests: Eliminates the need for fetching an external script, reducing load time.

Lower Execution Overhead: Moving logic to the AEM frontend minimizes execution delays introduced by Adobe Launch.

More Reliable Data Handling: Direct Call Rules ensure that tracking occurs only upon user interaction, reducing unnecessary event firing.

Less Dependency on Launch Variables: Avoids _satellite.getVar and _satellite.setVar, simplifying the implementation and making debugging easier.

Streamlined Milestone Tracking: Handled within AEM frontend, reducing complexity and improving efficiency.

Potential Drawbacks

I've attached the analysis piece to this email. I’d like to point out that it does not include the empirical performance measurements we discussed earlier, as I was unable to set up proper test cases for them. To conduct those tests, I would need two instances of the same component—one with the current analytics implementation enabled and one without—and I wasn’t sure how to create this setup. Unfortunately, I also wasn’t able to ask for your advice on this.

However, the write-up contains a detailed breakdown of the current implementation, which should help in understanding the challenges and potential improvements we can achieve with the DBR solution.

Additionally, please review my implementation in this pull request and check with the Analytics team to see if they can help verify the direct call payload once it's deployed to QA.

I hope it’s acceptable that I wasn’t able to complete the research we originally discussed.

Increased Frontend Complexity: Requires additional development effort and proper state management for multiple video instances.

Higher Client-Side Processing: Tracking logic execution on the client-side could slightly increase script execution time.

Dependency on AEM Implementation: Tightly coupling analytics with the AEM frontend could make future CMS migrations more difficult.

Potential Data Loss in Certain Scenarios: Ensuring all tracking events fire correctly, especially if a user interacts before tracking initializes.

Reliability of Direct Call Rule Execution: Requires thorough testing to ensure proper event firing and eliminate race conditions.

Removal of Viewport-Based Tracking: The new approach eliminates automatic tracking when a video enters the viewport, which may lead to reporting differences.

Conclusions & Next Steps

Key Takeaways

The current approach introduces overhead due to custom script execution, dependency on _satellite.setVar, and an additional network request.

The proposed approach leverages Direct Call Rules for more efficient and reliable analytics tracking.

The transition will likely result in faster page load times, more accurate event tracking, and simplified implementation.

Recommended Next Steps

Implement a Proof-of-Concept: Develop and test a prototype of the new implementation within AEM.

Validate Data Integrity: Ensure that analytics events match those captured by the current implementation.

Performance Testing: Compare load times, event latency, and accuracy between both implementations.

Stakeholder Approval & Deployment Plan: Present findings and finalize the rollout strategy.

By transitioning to a Direct Call Rule-based implementation, we can optimize performance and enhance the accuracy of video analytics tracking in Adobe Analytics.
