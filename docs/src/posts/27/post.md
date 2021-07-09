---
title: It’s public! The tiptap v2.0 beta
teaser: Does the Internet really need another rich text editor? Yes, it does! And we’ve built it for you. Ready to take it for a test drive?
author: "@hanspagel"
slug: tiptap-public-beta
published_at: 2021-04-21
---

Does the Internet really need another rich text editor? Yes, it does! And we’ve built it, for all the people that truely care about the user experience and it looks like that’s a lot of people.

## TL;DR
* Here is the new documentation: https://www.tiptap.dev
* GitHub repository: https://github.com/ueberdosis/tiptap

## A quick look back …
The tiptap 1 repository has more than 9,000 stars on GitHub already. Notable companies like GitLab, Statamic, and Apostrophe CMS (to name just a few) use tiptap 1 in their applications. The (awful) documentation had more than 70k page views/month. The npm package has more than 6,000,000 downloads in total. Isn’t that crazy?

But we have built this three years ago, without knowing what we are going to run into. We couldn’t help, but think about a successor, a new version, all the time. We had literally hundreds of ideas to make tiptap better for everyone. Luckily, we ignored the fact that it’s hard to make money with open source and just buckled down to build it.

After 9 months of work, 2,783 commits, more than 300 people testing the private beta, it’s here: The first public beta version of tiptap v2 (and it’s amazing).

## Wait, what’s tiptap?
tiptap is a framework-agnostic WYSIWYG text editor framework. It’s headless, and doesn’t come with CSS. Add your own markup and styling and control every aspect of your editor to build outstanding user experiences.

## And what’s so special about v2?
It’s (finally) framework-agnostic, written in TypeScript, comes with a handful of new and amazing extensions, has hundreds of tests, 150 pages of documentation, first class collaborative editing support, integrations for [Vue 2](https://www.tiptap.dev/installation/vue2), [Vue 3](https://www.tiptap.dev/installation/vue3), *and* [React](https://www.tiptap.dev/installation/react), guides for [Svelte](https://www.tiptap.dev/installation/svelte), [Alpine](https://www.tiptap.dev/installation/alpine), [Nuxt.js](https://www.tiptap.dev/installation/nuxt), a modern [CDN build](https://www.tiptap.dev/installation/cdn), [SSR utilities](https://www.tiptap.dev/api/utilities/html), [more than 80 interactive examples](https://www.tiptap.dev/examples) … Here are a few things you can do with tiptap:

* [Get started in seconds](https://www.tiptap.dev/installation/cdn)
* [Markdown shortcuts](https://www.tiptap.dev/examples/markdown-shortcuts)
* [Vue components inside the editor](https://www.tiptap.dev/guide/node-views/vue)
* [React components inside the editor](https://www.tiptap.dev/guide/node-views/react)
* [Vanilla JavaScript inside the editor](https://www.tiptap.dev/guide/node-views/js)
* [Collaborative editors & offline-first apps](https://www.tiptap.dev/examples/collaborative-editing)
* [Tasks inside the editor](https://www.tiptap.dev/examples/tasks)
* [Use any markup to render a menu](https://www.tiptap.dev/guide/menus)
* [Autocompletes, for example for `@mentions`](https://www.tiptap.dev/examples/suggestions)
* [Teach the editor new things](https://www.tiptap.dev/examples/savvy)
* [Lint the content](https://www.tiptap.dev/experiments/linter)
* [Use it with Tailwind CSS](https://www.tiptap.dev/guide/styling#with-tailwind-css)
* [Fix typographic mistakes](https://www.tiptap.dev/api/extensions/typography)
* [Add keyboard shortcuts](https://www.tiptap.dev/api/keyboard-shortcuts)
* [Control exactly what content is allowed](https://www.tiptap.dev/api/schema)
* [Highlight text in different colors](https://www.tiptap.dev/api/marks/highlight)
* [Add resizeable tables](https://www.tiptap.dev/examples/tables)
* and [so](https://www.tiptap.dev/guide/node-views/examples) [many](https://www.tiptap.dev/examples/drawing) [more](https://www.tiptap.dev/examples/formatting) [things](https://www.tiptap.dev/experiments/word-break) …

## Ready to use
tiptap v2 is still tagged as beta and yes, chances are minor things change before the stable release. That said, this version is already way more robust than v1 ever was, it’s well tested, and is already in use in many production apps.

In other words: Go get it and build cool things with it!

## Upgrading from tiptap v1
There is an [upgrade guide](https://www.tiptap.dev/overview/upgrade-guide) helping you to get from v1 to v2.

## The community
A tiny, but very active community has formed around tiptap v2 already.

[Join our Discord server to chit-chat, get help from the community, and share what you’ve built.](https://discord.gg/WtJ49jGshW)

BTW, a big **THANK YOU** to every single sponsor who keeps us going! And a very special thank you to [@marijnh](https://github.com/marijnh) for building ProseMirror, the foundation of tiptap, [@samwillis](https://github.com/samwillis), [@oodavid](https://github.com/oodavid), [@fourstacks](https://github.com/fourstacks), [@dmonad](https://github.com/dmonad), [@holtwick](https://github.com/holtwick) and [@lostdesign](https://github.com/lostdesign) for helping us on our way! You are all amazing!

## Become a sponsor!
We have this very long list of ideas and want to make sure we can keep working on tiptap for the foreseeable future. We can still count on the strong backing of our company überdosis, which already funded more than 100,000 € of the development. That’s fine. But we want to make sure it’s sustainable to continue building an amazing editor for you all in the long run. That’s why we set up the [ambitious sponsorship goal of $10,000/month on GitHub](https://github.com/sponsors/ueberdosis). Maybe it’s not too ambitious though. We are halfway there already!

**Are you able to help us with that? [Become a sponsor and help shape the future of tiptap!](https://github.com/sponsors/ueberdosis) As a thank you, you’ll get access to the collaborative editing backend we’ve built next week!**

Reaching our goal will ensure we can keep going with the development, answer all emails, issues, and support requests, keep everything up to date and develop new features and extensions.

## What’s next?
Oh, there’s way too much on our list. First, we’d like to get an officially stable tagged version out in the next few weeks (depending on your feedback). Also, we’ve developed a plug & play collaborative editing backend, we’d like to share next week with all sponsors. And then, there’s this long list of exciting things we’d like to build for tiptap: emoji support, more image capabilities, better dragging support …

But for today, that’s it. The public version of tiptap v2. Thanks for reading!

## Links
* Here is the new documentation: https://www.tiptap.dev
* GitHub repository: https://github.com/ueberdosis/tiptap
* Join the discussion on Twitter: https://twitter.com/tiptap_editor
* Discord Server: https://discord.gg/WtJ49jGshW
