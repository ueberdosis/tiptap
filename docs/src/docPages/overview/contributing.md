# Contributing

## toc

## Introduction
tiptap would be nothing without its lively community. Contributions have always been and will always be welcome. Here is a little bit you should know, before you send your contribution:

## Welcome examples
* Failing regression tests as bug reports
* Documentation improvements, e. g. fix a typo, add a section
* New features for existing extensions, e. g. a new configureable option
* New extensions, which don’t require changes to the core or other core extensions
* Well explained, non-breaking changes to the core

## Submit ideas
Make sure to open an issue and outline your idea first. We’ll get back to you quickly and let you know if there is a chance we can merge your contribution.

## Set up the development environment
It’s not too hard to tinker around with the offical repository. You’ll need [Git](https://github.com/git-guides/install-git), [Node](https://nodejs.org/en/download/) and [Yarn](https://classic.yarnpkg.com/en/docs/install/#mac-stable) installed. Here is what you need to do then:

1. Copy the code to your local machine: `$ git clone git@github.com:ueberdosis/tiptap-next.git`
2. Install dependencies: `$ yarn install`
3. Start the development environment: `$ yarn start`
4. Open http://localhost:3000 in your favorite browser.
5. Start playing around!

## Our code style
There is an eslint config that ensures a consistent code style. To check for errors, run `$ yarn run lint`. That’ll be checked when you send a pull request, too. Make sure it’s passing, before sending a pull request.

## Testing for errors
Your pull request will automatically execute all our existing tests. Make sure that they all pass, before sending a pull request. Run all tests locally with `$ yarn run test` or run single tests (e. g. when writing new ones) with `$ yarn run test:open`.

## Futher questions
Any further questions? Create a new issue or discussion in the repository. We’ll get back to you.
