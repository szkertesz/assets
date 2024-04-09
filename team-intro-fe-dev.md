Let's see Jeane's user journey on example.com.

When Jeane visits example.com, __code is sent from a web server to her device of choice__: her phone, tablet, smart TV, smart watch or fridge.

The code sent will __produce the user interface she sees in the browser__. This code is considered __front-end code__.

1. __To provide fast loading times, we try to optimise this code line by line and optimise every asset__

   Pal and I collaborate on this multimedia optimisation effort.

   We use different __tools and metrics to measure and monitor loading performance__.
   The slide shows a pagespeedinsights report, which can help identify bottlenecks and possible targets for optimisation.

3. So, example.com __will need to become interactive and respond to events orchestrated by the user__, Jeane.

   __Ideally, the interaction feels reliable and pleasurable__.

   Whether she's clicking, scrolling, swiping or tapping, it's gotta be as smooth as silk.

   We also have tools to measure runtime performance

5. Jeane might be a visually impaired person, using a screenreader when visiting example.com.

   Or she might have a temporary disability - maybe a broken arm, or a baby held in one of his arms. She might have to navigate the site without using a mouse but only a keyboard and one free hand.

   __Accessibility is about making websites usable by as many people as possible, no matter what their ability OR circumstances.__

   Imagine Jeane loading example.com using tethered mobile data on an ancient chinese tablet while commuting home on public transportation with poor cell coverage. She might give up before it finishes loading, not accessing the site at all.

   In this example we might consider web performance as a subset of accessibility.


***


Sources:

https://frontendmasters.com/guides/front-end-handbook/2018/what-is-a-FD.html
A front-end developer is a type of software developer who specializes in creating and designing the user interface (UI) and user experience (UX) of websites and web applications. The primary responsibility of a front-end developer is to ensure that the visual and interactive aspects of a website or application are user-friendly, aesthetically pleasing, and functionally efficient.

The client side: when you load a webpage into a web browser, code is sent from a web server to the device/client requesting the page. The code sent will produce the user interface one sees in the web browser. This code is considered front-end code and is a mixture of the web technologies HTML, CSS, and JavaScript.

will need to become interactive and respond to events orchestrated by the user or the device on which it runs (e.g., on click or on load do X)

Front-end developers develop for the web platform, and the web platform is most commonly associated with web browser run times.

A11y
https://developer.mozilla.org/en-US/docs/Learn/Accessibility/What_is_accessibility#so_what_is_accessibility
Accessibility is the practice of making your websites usable by as many people as possible.

treating everyone the same, and giving them equal opportunities, no matter what their ability or circumstances

Web performance
https://developer.mozilla.org/en-US/docs/Learn/Performance/What_is_web_performance#what_is_web_performance

__Reducing overall load time__: How long does it take the files required to render the website to download on to the user's computer? This tends to be affected by latency, how big your files are, how many files there are, and other factors besides. A general strategy is to make your files as small as possible, reduce the number of HTTP requests made as much as possible, and employ clever loading techniques (such as preload) to make files available sooner.

__Making the site usable as soon as possible__: This basically means loading your website assets in a sensible order so that the user can start to actually use it really quickly. Any other assets can continue to load in the background while the user gets on with primary tasks, and sometimes we only load assets when they are actually needed (this is called lazy loading). The measurement of how long it takes the site to get to a usable start after it has started loading is called time to interactive.

__Smoothness and interactivity__: Does the application feel reliable and pleasurable to use? Is the scrolling smooth? Are buttons clickable? Are pop-ups quick to open up, and do they animate smoothly as they do so? There are a lot of best practices to consider in making apps feel smooth, for example using CSS animations rather than JavaScript for animation, and minimizing the number of repaints the UI requires due to changes in the DOM.

__Perceived performance__: How fast a website seems to the user has a greater impact on user experience than how fast the website actually is. How a user perceives your performance is as important, or perhaps more important, than any objective statistic, but it's subjective, and not as readily measurable. Perceived performance is user perspective, not a metric. Even if an operation is going to take a long time (because of latency or whatever), it is possible to keep the user engaged while they wait by showing a loading spinner, or a series of useful hints and tips (or jokes, or whatever else you think might be appropriate). Such an approach is much better than just showing nothing, which will make it feel like it is taking a lot longer and possibly lead to your users thinking it is broken and giving up.

__Performance measurements__: Web performance involves measuring the actual and perceived speeds of an application, optimizing where possible, and then monitoring the performance, to ensure that what you've optimized stays optimized. This involves a number of metrics (measurable indicators that can indicate success or failure) and tools to measure those metrics, which we will discuss throughout this module.
