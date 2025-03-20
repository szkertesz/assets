
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
