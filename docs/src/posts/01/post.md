---
title: Our Plan for tiptap 2
teaser: With tiptap we built a renderless text editor for the Web. Today, it’s already used by thousands of developers, and we plan to release a completely new version of it. Here’s everything you need to know about the current state and the current roadmap.
author: "@hanspagel"
slug: our-plan-for-tiptap-2
published_at: 2020-10-12
---

<hr>

**You probably want to read the [new post about tiptap 2.0](/post/tiptap-2-0-beta/).**

<hr>

With [tiptap](https://github.com/ueberdosis/tiptap) we built a renderless text editor for the Web. Today, it’s already used by thousands of developers, and we plan to release a completely new version of it. Here’s everything you need to know about the current state and the current roadmap.

## Who’s using it?
First of all, let me share a few impressive numbers with you. The repository has 8,000 stars on GitHub. Notable companies like GitLab and Statamic (to name just a few) use tiptap in their software. The (currently awful) documentation has more than 60k page views/month. The package was downloaded 500k times in 2019, and already 2.7m times in 2020. Isn’t that crazy?

Let’s add numbers people usually don’t talk much about: We put in a few hundred hours to develop the package, we don’t know the exact number, but it’s probably something like 500 hours. And we got a few donations from kind humans, I think it’s something like $200 in total. We recently set up GitHub sponsorship and now have 15 sponsors (so cool!), giving us around $160/month. We are very, very thankful for every donation, and for every sponsor, it’s a huge motivation for us to work on tiptap.

## What changed already?
But let’s talk about how we made tiptap 2 even more awesome already. I guess that’s why you’re here.

### 1) A new home for tiptap.
First of all, we moved tiptap to our [überdosis GitHub organization](https://github.com/ueberdosis). [überdosis](https://twitter.com/_ueberdosis) is the company we are both co-founders of and which is sponsoring the development currently. Without that kind of support, we wouldn’t be able to work on tiptap.

### 2) Hello TypeScript!
So many people asked us to add TypeScript definitions. We couldn’t ignore it anymore. We took a close look at TypeScript and finally decided – after months of fiddling around with it – to write tiptap (from scratch) using TypeScript. For us, it’s still a love-hate relationship, but you will definitely have a ton of advantages.

As long as your IDE supports it (most do), you’re going to have a very nice autocomplete for the tiptap API. Some bugs will be pointed out early, without running the code. And we can render an auto-generated API reference from it, on top of the extensive documentation.

### 3) Finally, everything is documented.
The current documentation for tiptap is very lacking. We couldn’t take it anymore and made the documentation a priority instead of an afterthought.

The packages, documentation, and website with examples that’s all the same (currently private) repository now. We’ve started to write about everything you can do with tiptap 2 early on and add content parallel to developing the described features. It pays out.

Also, there are already more than 40 interactive demos added to the documentation, and we’re adding new ones every week. I’m sure you all will love the documentation for tiptap 2.

### 4) Decoupled the core from Vue.js.
The first version was developed for Vue.js. Actually, we didn’t use much of the framework in the editor. For tiptap 2, we were able to decouple that part from the core. Et voilá, tiptap 2 is framework-agnostic.

Yes, you will be able to use it with other frameworks, for example, with React. But we’ll definitely need time to build React components and document them. We won’t rush that. Currently, all examples are based on Vue.js, so it’s basically like writing the whole documentation from scratch.

### 5) Let’s chain it.
One of the cool new features are chainable commands. All commands can be joined to one call (and a single performant transaction) from now on. Let’s have a look at an example:

```js
editor
  .chain()
  .focus('end')
  .insertText('at the end')
  .insertNewLine()
  .insertText('on a new line')
  .toggleNode('heading', { level: 2 })
  .run()
 ```

### 6) It’s tested.
The initial version of tiptap doesn’t have any real tests, leading to chaos again and again. We’re continually adding tests to the new code base and count 140 by now. We aim to have something like 1,000 over time. I think we can do that.

The tests already helped us to find bugs early. For future contributions, it’ll be a huge time saver too.

### 7) Improve the collaborative editing experience.
We always thought that collaborative editing is one of the coolest features of tiptap. I think we were already able to take our approach with tiptap 2 to a whole new level.

The new implementation is based on [Y.js by Kevin Jahns](https://github.com/yjs/yjs) (who is also sponsoring us on GitHub). I don’t want to talk about too many details for now but believe me, it’s the coolest thing in that space.

It’s still a complex topic, though. That’s why we are in the process of writing a very detailed guide on that.

### 8) Rewriting all extensions.
The following 19 extensions are rewritten for version 2 already: Blockquote, Bold, BulletList, Code, CodeBlock, Collaboration, Document, HardBreak, Heading, History, HorizontalRule, Italic, Link, ListItem, OrderedList, Paragraph, Strike, Text, and Underline.

And we added two new ones: CollaborationCursor and Highlight. But more on that in a different post.

## When we share access to the code.
I hope you’re as hyped as I am about tiptap. We can’t wait to give you access, but it’ll still take some time, that’s for sure. Here are all the steps we want to take:

1. Get the new extension API stable. Currently, we’re rewriting that every second week. Actually, Philipp is working on it while I write that post.
2. Rewrite the Vue components for version 2, probably add an optional default styling, write a few missing pages for the documentation and add a few more tests.
3. Invite [our GitHub sponsors](https://github.com/sponsors/ueberdosis) to the private repository. ← That could be you.
4. Incorporate early feedback and iron out glitches, working with the different teams e. g. from Statamic to see if the migration would work.
5. Publish a public beta version for everyone.

Does that sound like a plan? If you like it, be sure to [sponsor us](https://github.com/sponsors/ueberdosis). Like I said, every sponsor is a huge motivation to put even more time into tiptap. By the way, we’ve already put nearly 300 hours (and a ton of love) in developing the new version.

## Start your projects with tiptap 1, migrate later.
A few people asked me already, so I’ll add this here too. Yes, you can still start projects with tiptap 1. We already wrote an upgrade guide, and we try to keep the migration path as smooth as possible.

If you’re writing custom extensions, you’re going to need to rewrite them. But you will probably be able to reuse the tricky parts. You just need to glue them together differently. That said, in the long run, we’re going to provide more extensions than we did with version 1.

## What do you think?
Let us know what you think about our plan! Comment in [the related issue on GitHub](https://github.com/ueberdosis/tiptap/issues/547) or hit [Philipp](https://twitter.com/_philippkuehn) or [me](https://twitter.com/hanspagel) up on Twitter. Thanks for reading!
