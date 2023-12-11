# Spike: Animated Hero Section Backgrounds

## Goal

The UX/UI team has expressed interest in incorporating animated content into hero sections of pages. Currently, this feature relies on animated GIFs. However, these media files, due to their extensive sizes, consume heavy bandwidth and significantly impact page load performance, resulting in a degraded user experience (UX).

What solutions could be considered as alternatives to GIFs, based on the following criteria?
- File size/quality ratio to improve page load performance
- Stable browser support
- Accessibility awareness[1]
- Implementation efforts and technical requirements

## Method

Research existing documents, case studies, and samples.

## Evidence

### Currently Used Solution: Animated GIFs

- GIF is a bitmap image format that supports up to 8-bit color depth. Therefore, it is less suitable for reproducing color photographs but is effective for graphics and logos with solid areas of color, sharp lines, and edges using few colors.
- GIF was not designed as an animation medium but can store multiple images in one file as frames of an animation to be painted with time delays, forming a video clip. This simple architecture results in limited compression capabilities compared to more modern formats and videos.

GIF performs poorly from a file size and image quality perspective.

- GIF was invented in 1987 and has practically universal support across platforms and browsers.
- The current implementation of hero sections is not aware of accessibility concerns. There is no native, programmatic method to let users pause or stop the animation loop of animated GIFs. However, workarounds or hacks exist: these require a poster image, which, when toggled, covers the GIF, effectively "pausing" it. It is controlled via JavaScript or HTML elements with state-preserving capabilities ([checkbox](https://christianheilmann.com/2020/07/16/a-css-only-click-to-animate-gif-solution/) or [details]/[summary](https://css-tricks.com/pause-gif-details-summary/)).

### Image Alternatives

There are image formats capable of presenting animations. Their compression capabilities and browser support vary. Besides providing playback features and motion preference detection (accessibility features), these image-based solutions don't require additional development efforts; the currently used hero components can utilize them seamlessly.

#### Animated PNG (APNG)

Similar to GIFs but allowing 24-bit colors and alpha transparency with better compression abilities. Browser support for APNG is stable ([source](https://caniuse.com/apng)). However, it can't defeat compressed WebP images at file sizes.

#### AVIF

A modern image format generally has better compression than WebP, JPEG, PNG, and GIF. It can also provide alpha transparency and improved perceptual quality at file sizes smaller than JPEG or WebP. AVIF has compatibility limitations ([source](https://caniuse.com/avif)):
- On Safari iOS, it supports still images only. Animated image sequences are not supported at all.
- It has no support on Edge.

#### JPEG XL

By default, it is only supported on Safari ([source](https://caniuse.com/jpegxl)).

#### WebP

WebP is an image format designed for the web created by Google in 2010. It supports lossy and lossless compression, as well as animation and alpha transparency.
WebP supports 24-bit RGB color with an 8-bit alpha channel, compared to GIF's 8-bit color and 1-bit alpha.
WebP requires fewer bytes than GIF[^1]. Animated GIFs converted to lossy WebPs are 64% smaller, while lossless Webs are 19% smaller[^3].
It also has strong browser support ([source](https://caniuse.com/webp)), so WebP should be considered as a good alternative image format instead of GIF.

### Video Solutions

Videos resolve many issues presented by GIFs:
- Drastically smaller file sizes
- The ability to surpass the 8-bit color restriction
- Better frame handling and compression through codecs ([source](https://en.wikipedia.org/wiki/GIF#Animated_GIF))

From the early 2010s, as the support of the HTML5 `<video>` element became widespread, a technique became popular which utilizes looped versions of videos, giving the appearance of a GIF but with the size and speed advantages of compressed video[^5].
Image sharing sites like Imgur and Gfycat started to convert all images uploaded in GIF format to lightweight MP4 videos in 2014 ([source](https://techcrunch.com/2014/10/09/imgur-to-convert-uploaded-gifs-into-videos)). The same decision has been made by Pinterest ([source](https://medium.com/pinterest-engineering/improving-gif-performance-on-pinterest-8dad74bf92f1)).
The Google Chrome Developer Relations team experts also advise replacing animated GIFs with video for faster page loads ([source](https://web.dev/articles/replace-gifs-with-videos)).

The most commonly used video formats on the web are WebM and MP4.

#### WebM

WebM is an open video format specifically designed for the web. With its support for the VP8 and VP9 video codec, WebM offers superior compression capabilities, reducing file sizes but maintaining visual fidelity.
It has partial support on iOS ([source](https://caniuse.com/webm)). Since it’s optimized for the internet, WebM theoretically offers a higher compression ratio than MP4. WebM files are, therefore, smaller.

#### MP4

MP4 is an efficient video format that manages to maintain both compression and quality, but tends to favor the latter. Its compatibility spans across various platforms and browsers, making it a more universal choice for delivering animated content than WebM.

These formats are often used in tandem to provide the smallest media resource for compatible platforms (WebM), and MP4 as a fallback option for browsers that may not support WebM. This approach helps ensure broader compatibility and optimal performance across various web environments.

#### A Proof of Concept

I conducted a POC, which involved converting a currently used animated GIF, sized at 12.705KB (12.4MB), into both an MP4 (994KB) and a WebM (879KB) video file. Additionally, a 28KB poster image was extracted from the animated content. I used <video> and <source> elements for the WebM and MP4 versions, with an <img> element serving as a poster image fallback. Importantly, only one of these elements gets loaded per page visit, optimizing resource usage.

The implementation also featured motion preference detection. Initially, only the poster image is loaded and displayed, for users with reduced motion preferences. If users set a preference for reduced motion in their OS, the poster image remains the sole display. If users do not prefer reduced motion, one of the videos is autoplayed and looped.

To align with the WCAG Success Criterion 2.2.2 Pause, Stop, Hide, playback functionality was integrated. The HTML <video> element allows for native options, enabling comprehensive control over playback. Users can pause, stop, or continue animating content based on their preferences. The functionality was implemented with 759 bytes of JavaScript code.

## Conclusions

A case study focused on converting an animated GIF (448KB in size) into different alternative formats and comparing their file size savings, found the illustrative ranking below:

Format/Codec	Size	Savings
WebM/VP9 (Video)	24 KB	94.6%
AVIF (Image)	35 KB	92.1%
MP4/H.264 (Video)	63 KB	85.9%
WebP (Image)	136 KB	69.6%

| Format/Codec       | Size | Savings  |
|---------------------|------|----------|
| WebM/VP9 (Video)    | 24 KB | 94.6%    |
| AVIF (Image)        | 35 KB | 92.1%    |
| MP4/H.264 (Video)   | 63 KB | 85.9%    |
| WebP (Image)        | 136 KB | 69.6%   |

While empirical verification and additional testing are advisable, these results can be considered plausible, reflecting an accurate efficiency ranking of the alternative formats.

If the currently used module for hero sections accommodates only image files, employing WebP instead of GIF can yield significant file savings. However, to meet accessibility requirements, the implementation of workarounds with suboptimal results may also be necessary.

For cases prioritizing loading performance improvements, the most efficient alternatives, also considered best practice for this use case, involve utilizing video resources with HTML `<video>`. This approach requires at least one MP4 video file, optionally complemented by a more performant WebM file, and a poster image to cover all conditions, including network failure. The implementation involves a modest amount, less than 1KB, of JavaScript code. Importantly, it is aware of user motion preferences, in compliance with corresponding WCAG criteria, thus significantly enhancing overall UX.



## Next Steps

## Next Steps

**Empirical Validation:** Conduct testing to empirically validate the efficiency rankings and assess the real-world performance of the implemented alternatives, also search for the optimal, generalised parameters for each format to ensure best file-size / quality ratio.

**User Testing:** Gather feedback on the implemented motion preference detection and playback functionality, refining them based on findings.

**Collaboration with UX/UI Team:** Understand their everyday workflows, preferences, and production needs. Tailor the end solution to seamlessly integrate with their existing processes, provide the tools they require.

**Comprehensive Documentation:** Create comprehensive documentation detailing the spike's findings and implementation details.

[1] To autoplayed, looped animations, which are longer than 5 seconds and are not essential to the content, the [WCAG Success Criterion 2.2.2 Pause, Stop, Hide](https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide.html) apply. In order to comply, a mechanism for the user should be provided to pause, stop, or hide the content.
