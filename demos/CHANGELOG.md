# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.0.0-beta.197](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.196...v2.0.0-beta.197) (2022-09-26)


### Bug Fixes

* **core:** Can() does not work for setting marks ([#3223](https://github.com/ueberdosis/tiptap/issues/3223)) ([17a41da](https://github.com/ueberdosis/tiptap/commit/17a41da5a7a14879cf490c81914084791c4c494c))





# [2.0.0-beta.196](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.195...v2.0.0-beta.196) (2022-09-20)

**Note:** Version bump only for package tiptap-demos





# [2.0.0-beta.195](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.194...v2.0.0-beta.195) (2022-09-14)


### Bug Fixes

* **extension/bubble-menu:** :bug: fix bubble menu and floating menu being available when editor not editable ([#3195](https://github.com/ueberdosis/tiptap/issues/3195)) ([fa96749](https://github.com/ueberdosis/tiptap/commit/fa96749ce22ec67125da491cfeeb38623b9f0d6e))





# [2.0.0-beta.194](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.193...v2.0.0-beta.194) (2022-09-11)

**Note:** Version bump only for package tiptap-demos





# [2.0.0-beta.193](https://github.com/ueberdosis/tiptap/compare/v0.1.2...v2.0.0-beta.193) (2022-09-10)


### Bug Fixes

* bump documents ([43611ea](https://github.com/ueberdosis/tiptap/commit/43611ea2e70d3dc66ff907ba7ca377bf74814543))
* disable broken tests for experiements with further todo message ([b8ae9e2](https://github.com/ueberdosis/tiptap/commit/b8ae9e27622857093c6ca539901956da5cc291e5))
* don’t check for active node in wrapIn command, fix [#1059](https://github.com/ueberdosis/tiptap/issues/1059) ([170ec4b](https://github.com/ueberdosis/tiptap/commit/170ec4be5b3c8362890ca3100a223b505f788381))
* **extension/collaboration:** :ambulance: pin y-prosemirror version to 1.0.20 to fix broken functionality with vue ([5989f3b](https://github.com/ueberdosis/tiptap/commit/5989f3b780bb64b2884d81dcd41a95d98a0714b2))
* fix RangeError bug when selecting all text, fix [#2490](https://github.com/ueberdosis/tiptap/issues/2490) ([70422dd](https://github.com/ueberdosis/tiptap/commit/70422dd107ed1ecdd8dfe41a8a93297124d2f1e0))
* **maintainment:** fix cjs issues with prosemirror-tables ([eb92597](https://github.com/ueberdosis/tiptap/commit/eb925976038fbf59f6ba333ccc57ea84113da00e))
* remove some magic strings ([6c34dec](https://github.com/ueberdosis/tiptap/commit/6c34dec33ac39c9f037a0a72e4525f3fc6d422bf))
* **suggestion:** :bug: make clientrect prop optional as it can potentially be undefined ([#2813](https://github.com/ueberdosis/tiptap/issues/2813)) ([f019f70](https://github.com/ueberdosis/tiptap/commit/f019f70a19c34715e2d5c3921d348e11c7ac51a3)), closes [#2795](https://github.com/ueberdosis/tiptap/issues/2795)
* temp fix collaboration demo ([4528756](https://github.com/ueberdosis/tiptap/commit/45287563f3cfb389095a2794cb2001d65e56d633))


### Features

* Add extension storage ([#2069](https://github.com/ueberdosis/tiptap/issues/2069)) ([7ffabf2](https://github.com/ueberdosis/tiptap/commit/7ffabf251c408a652eec1931cc78a8bd43cccb67))
* add getText() and generateText() methods (fix [#1428](https://github.com/ueberdosis/tiptap/issues/1428)) ([#1875](https://github.com/ueberdosis/tiptap/issues/1875)) ([fe6a3e7](https://github.com/ueberdosis/tiptap/commit/fe6a3e7491f6a42123d3d8a92ab588f2a40d7799))
* add some improvements to `CharacterCount` extension ([#2256](https://github.com/ueberdosis/tiptap/issues/2256)), fix [#1049](https://github.com/ueberdosis/tiptap/issues/1049), fix [#1550](https://github.com/ueberdosis/tiptap/issues/1550), fix [#1839](https://github.com/ueberdosis/tiptap/issues/1839), fix [#2245](https://github.com/ueberdosis/tiptap/issues/2245) ([5daa870](https://github.com/ueberdosis/tiptap/commit/5daa870b0906f0387fe07041681bc6f5b3774617))
* Add support for autolink ([#2226](https://github.com/ueberdosis/tiptap/issues/2226)) ([3d68981](https://github.com/ueberdosis/tiptap/commit/3d68981b47d087fff40549d2143eb952fc9e0a50))
* **extension-link:** :sparkles: add validate option to link extension ([23e67ad](https://github.com/ueberdosis/tiptap/commit/23e67adfa730df7364bc31220d0ed0e8ea522593)), closes [#2779](https://github.com/ueberdosis/tiptap/issues/2779)
* **extension/youtube:** :sparkles: new youtube embed extension ([#2814](https://github.com/ueberdosis/tiptap/issues/2814)) ([1c0554b](https://github.com/ueberdosis/tiptap/commit/1c0554b7c06d80145274353e58d56608b097fbe4))
* Integrate input rules and paste rules into the core ([#1997](https://github.com/ueberdosis/tiptap/issues/1997)) ([723b955](https://github.com/ueberdosis/tiptap/commit/723b955cecc5c92c8aad897ce16c60fb62976571))
* parseHTML for attributes should return the value instead of an object now, fix [#1863](https://github.com/ueberdosis/tiptap/issues/1863) ([8a3b47a](https://github.com/ueberdosis/tiptap/commit/8a3b47a529d28b28b50d634c6ff69b8e5aad3080))
