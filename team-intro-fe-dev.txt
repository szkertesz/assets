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

Reducing overall load time: How long does it take the files required to render the website to download on to the user's computer? This tends to be affected by latency, how big your files are, how many files there are, and other factors besides. A general strategy is to make your files as small as possible, reduce the number of HTTP requests made as much as possible, and employ clever loading techniques (such as preload) to make files available sooner.
Making the site usable as soon as possible: This basically means loading your website assets in a sensible order so that the user can start to actually use it really quickly. Any other assets can continue to load in the background while the user gets on with primary tasks, and sometimes we only load assets when they are actually needed (this is called lazy loading). The measurement of how long it takes the site to get to a usable start after it has started loading is called time to interactive.
Smoothness and interactivity: Does the application feel reliable and pleasurable to use? Is the scrolling smooth? Are buttons clickable? Are pop-ups quick to open up, and do they animate smoothly as they do so? There are a lot of best practices to consider in making apps feel smooth, for example using CSS animations rather than JavaScript for animation, and minimizing the number of repaints the UI requires due to changes in the DOM.
Perceived performance: How fast a website seems to the user has a greater impact on user experience than how fast the website actually is. How a user perceives your performance is as important, or perhaps more important, than any objective statistic, but it's subjective, and not as readily measurable. Perceived performance is user perspective, not a metric. Even if an operation is going to take a long time (because of latency or whatever), it is possible to keep the user engaged while they wait by showing a loading spinner, or a series of useful hints and tips (or jokes, or whatever else you think might be appropriate). Such an approach is much better than just showing nothing, which will make it feel like it is taking a lot longer and possibly lead to your users thinking it is broken and giving up.
Performance measurements: Web performance involves measuring the actual and perceived speeds of an application, optimizing where possible, and then monitoring the performance, to ensure that what you've optimized stays optimized. This involves a number of metrics (measurable indicators that can indicate success or failure) and tools to measure those metrics, which we will discuss throughout this module.

#1

Title: Unveiling the Magic of Front-End Development

Hey everyone, today I want to take a moment to shed some light on the fascinating world of front-end development. For those of you who might not be familiar, front-end development is essentially the art and science of building the user interface and experience of a website or web application.

So, picture this: you open up a website, and within milliseconds, it's loaded and ready to rock. Ever wondered how that happens? That's where the magic of front-end development comes into play. We're the folks behind the scenes, optimizing code and assets to ensure that your website loads faster than a cheetah on caffeine. Because let's face it, ain't nobody got time to wait for a sluggish website, especially in today's fast-paced digital world.

Now, let's talk responsiveness and smoothness. Ever scrolled through a website on your phone and felt like you were wrestling with a stubborn octopus? Yeah, not fun. As front-end developers, we're on a mission to make sure your user experience is as smooth as butter. We fine-tune every pixel and animation to ensure that your interactions with the UI are seamless and delightful, whether you're browsing on a desktop, tablet, or smartphone.

But wait, there's more! Accessibility is a biggie in our playbook. We believe that everyone, regardless of ability, should have equal access to the web. That's why we meticulously craft our code to be accessible to all users, including those with disabilities. Because inclusivity isn't just a buzzword—it's a fundamental principle of good front-end development.

So, the next time you're browsing the web and everything just works like a charm, remember the unsung heroes of front-end development making it all possible. We're the wizards behind the curtain, weaving our magic to create seamless, lightning-fast, and accessible web experiences for all.

Thanks for tuning in, and happy browsing!

#2
Title: Demystifying Front-End Development Through Mary's Journey

Hey everyone, today I want to take you on a journey into the world of front-end development, through the eyes of our friend Mary. Now, what exactly is front-end development? It's like the architectural blueprint of a website or an app—the part you see and interact with.

Let's start with the loading aspect of web performance. Imagine Mary, a busy finance analyst, trying to access crucial data on a website. Time is money, right? Well, as front-end developers, we work tirelessly to ensure that Mary's experience is lightning-fast. We optimize code and assets, making sure that the website loads quicker than her morning coffee break. Because in the world of finance, every second counts.

Next up, responsiveness and smoothness. Picture Mary again, this time multitasking between her laptop and smartphone, analyzing data on the go. She shouldn't have to wrestle with a clunky interface, right? That's where we come in. We design and code with precision, ensuring that Mary's interactions with the UI are as smooth as silk. Whether she's tapping, swiping, or clicking, it's a seamless experience every time.

But what about accessibility? Well, let's imagine Mary's colleague, John, who's visually impaired. He relies on screen readers to navigate the web. As front-end developers, we make sure that our websites are accessible to everyone, including John. We use semantic HTML, provide alternative text for images, and ensure keyboard navigation, so that no one is left behind.

So, the next time you're scrolling through a website or using an app, remember Mary's journey. Front-end development isn't just about pixels and code—it's about crafting experiences that are fast, smooth, and accessible for everyone.

Thanks for joining me on this journey, and here's to building a better web for all!

#3
Title: Navigating the Three Pillars of Front-End Development: A Journey with Mary

Hey there, fellow finance and data science enthusiasts! Today, I want to take you on a journey into the world of front-end development, where pixels meet purpose and user experience reigns supreme.

But first, let's set the stage. What exactly is front-end development? Well, it's like the bridge between the back-end magic and the user's screen—it's where the rubber meets the road, so to speak. Think of it as the architect designing the blueprint of a website or application.

Now, let's meet Mary. Mary's a data analyst, always on the hunt for insights and trends. When Mary visits a website, she expects it to load faster than she can crunch numbers. That's where the first pillar of front-end development comes in: the loading aspect of web performance. We optimize every line of code and asset to ensure that Mary's experience is seamless and snappy. Because in the fast-paced world of finance, time is money.

Next up, smoothness and interactivity. Mary's not just looking for data—she's looking for an experience. As front-end developers, we strive to make sure that every interaction feels reliable and pleasurable. Whether she's clicking, scrolling, or tapping, it's gotta be as smooth as silk.

But what about accessibility? This is where things get real. Imagine if Mary, or someone like her, had a temporary disability—maybe a broken arm or a bout of color blindness. They still need to access the web, right? That's why we design with accessibility in mind. Our sites and applications are keyboard-friendly, screen reader-compatible, and free of harmful features like motion that could trigger migraines or seizures.

So, there you have it—front-end development in a nutshell. It's about reducing load times, enhancing interactivity, and ensuring accessibility for all. Because at the end of the day, it's not just about code—it's about crafting experiences that empower and enrich the lives of users like Mary.

Thanks for joining me on this journey, and here's to building a web that works for everyone, one pixel at a time!
