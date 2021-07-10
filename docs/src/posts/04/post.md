---
title: Hello tiptap 2 beta!
teaser: After months of building tiptap 2.0, we’ve finally tagged its first beta version. I want to share a few of the most exciting changes with you.
author: "@hanspagel"
slug: tiptap-2.0-beta
published_at: 2021-03-04
---

After months of developing tiptap 2.0, we’ve finally tagged its first beta version. For now, it’s still private, but it’s definitely ready to build cool things with it. What we achieved feels already outstanding, and I want to share a few of the most exciting changes with you.

## Who’s using tiptap?
Let’s go through a few impressive numbers first. The repository has more than 9,000 stars on GitHub. Notable companies like GitLab, Statamic, and Apostrophe CMS (to name just a few) use tiptap 1 in their applications. The (currently awful) documentation has more than 60k page views/month. The package has more than 6,000,000 downloads in total. Isn’t that crazy?

We already worked more than 800 hours on the new version. [164 sponsors (so cool!) are donating $2,884/month (wow!) on GitHub.](https://github.com/sponsors/ueberdosis) This is a huge motivation to keep working on it!

![the tiptap 2.0 logo](./tiptap-2.0-beta.png)

## What’s new in 2.0?
There’s a lot to talk about, but I’ll focus on the five most important points. Everything in this list started as an idea but is ready to use with the freshly tagged beta version.

If you’re brave and not too upset if you find a glitch here and there, I’d even call it ready for production. Even if in beta, it feels more robust than version 1 ever was.

### 1. Choose your stack
**The new version is completely framework-agnostic and works with the tech stack of your choice.**

To get started quickly, you can drop in a modern CDN build. For Vue 2 and Vue 3 projects, we provide everything you need to get going. We are translating more and more to React. There are integration guides for Svelte, Alpine.js, and Livewire, and we plan to add even more.

No matter, what you are building in, you will be able to use tiptap 2. And by the way, the new documentation already has 63 interactive demos, ready to copy & paste, and 100 pages explaining all the nifty details of building a fantastic editor experience with tiptap.

### 2. Your framework to build any editor
**We see tiptap as a headless editor framework for web artisans. For people who want to craft their applications to build outstanding user experiences.**

With the new API, you’ve got everything in your hands and control every aspect of the text editor. It’s clear, intuitive, powerful, well-documented, tested. We wrote the new version in TypeScript, after struggling with it for months, it now feels really, really good. You don’t even need to have TypeScript in your project to benefit from an autocomplete for the API.

### 3. So! Many! Extensions!
**All extensions from v1 are rewritten and improved, and we added a whole bunch of new ones, too. **

Add task lists, text highlights, add complex tables, align your text, set the font family, limit the number of characters, [automatically fix the typography](https://twitter.com/tiptap_editor/status/1357622240574119936) … I could go on and on.

We even got a whole new `Mention` extension, which is so much more flexible and robust. With the generic `Suggestion` utility, you can easily add all types of autocompletes in your editor, for example, for `#hashtags`, `:emojis:`, or `$variables`.

And it’s never been easier to add your custom extensions. That’s what tiptap is about anyway. Fully control, customize and extend the editor experience.

Oh, by the way, did I mention that you are literally in full control over the styling too? Use custom markup, add CSS or use Tailwind. There is no limitation.

### 4. Collaborative by heart
**Add real-time collaboration, build offline-first apps, keep the content in sync over multiple devices or with hundreds of other users.**

Adding those capabilities to your editor will be a matter of minutes to hours, not weeks to months, thanks to the first-class integration of [Y.js](https://github.com/yjs/yjs) and a provided plug & play collaboration backend.

If you haven’t heard of Y.js, no worries. The new documentation has a 10-minute guide with everything you need to know.

### 5. Who we’re building it for
**Though the new version isn’t public, it already has 2.5k downloads/month. More than 130 people have access to the private repository and the new documentation by now.**

They form a tiny but pretty active community, and we enjoy getting bug reports, feedback, and contributions!

If you want to help shaping the future of tiptap or start building cool things with it right now, [become a sponsor](https://github.com/sponsors/ueberdosis) to get immediate access!

We can’t wait to share a public beta with you in the next months. That’s why we are doing all this: To make a superb editor framework accessible to everyone.

<!-- ## Try it out!
That was a lot of words already. Why don’t you try it out? But please, be nice. The content of the editor is public and visible to other reads of the post.

<iframe src="https://tiptap-demo.netlify.app/" width="100%" frameborder="0"></iframe>

This isn’t even a full-blown version, only the most common extensions are loaded. And don’t forget the styling is totally up to you. It doesn’t have to look like the above example. That’s the joy of headless. -->

## How do I get access?
**It took us a while, but now we know it. tiptap 2 won’t be complete, ever. With every task we complete, we add four new ideas to our backlog. So when do we share it with the world?**

We have this very long list of ideas and want to make sure we can keep working on tiptap for the foreseeable future. We can still count on the strong backing of our company überdosis, which already funded more than 60,000 € of the development. That’s fine, and we don’t want that money back.

But we want to make sure it’s sustainable to continue building an amazing editor for you all in the long run. That’s why we set up the [ambitious sponsorship goal of $5,000/month on GitHub](https://github.com/sponsors/ueberdosis) we’d like to reach before going public. Maybe it’s not too ambitious though. We are halfway there already!

**Are you able to help us with that? [Become a sponsor and shape the future of tiptap!](https://github.com/sponsors/ueberdosis) As a thank you, you’ll get immediate access to the private repository and the all-new documentation!**

Reaching our goal will ensure we can keep going with the development, answer all emails, issues, and support requests, keep everything up to date and develop new features and extensions.

## What do you think?
Comment in the [related issue on GitHub](https://github.com/ueberdosis/tiptap/issues/547), hit [Philipp](https://twitter.com/_philippkuehn) or [me](https://twitter.com/hanspagel) up on Twitter, or send an email to [humans@tiptap.dev](mailto:humans@tiptap.dev). We’re there to answer all your questions and hope you are excited as we are about the future of tiptap.

[By the way, tiptap has its own Twitter account now.](https://twitter.com/tiptap_editor)

> A big **THANK YOU** to every single sponsor who keeps us going! And a very special thank you to [@samwillis](https://github.com/samwillis), [@oodavid](https://github.com/oodavid), [@fourstacks](https://github.com/fourstacks), [@dmonad](https://github.com/dmonad) and [@holtwick](https://github.com/holtwick) for helping us on our way! You are all amazing!
