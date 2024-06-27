# Change Log

> **Important information**
>
> As of version 2.4.1 Tiptap uses **Changesets** which don't allow the generation of one generic CHANGELOG file.
> If you want to check changes of a specific package version, check the **CHANGELOG.md** file in the specific package
> directory or out [Github Releases](https://github.com/ueberdosis/tiptap/releases)

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.4.0](https://github.com/ueberdosis/tiptap/compare/v2.3.2...v2.4.0) (2024-05-14)


### Bug Fixes

* **core:** configure should use the parent of the current instance, to avoid duplication ([#5147](https://github.com/ueberdosis/tiptap/issues/5147)) ([4db463c](https://github.com/ueberdosis/tiptap/commit/4db463c6bbcc3a17ee8eb591bea8e357120ecb35))
* fix ts error for BubbleMenu and FloatingMenu in @tiptap/react ([#5126](https://github.com/ueberdosis/tiptap/issues/5126)) ([baff4af](https://github.com/ueberdosis/tiptap/commit/baff4af39e2b8970d7cab99859ece41228643f9d))


### Features

* added jsdocs ([#4356](https://github.com/ueberdosis/tiptap/issues/4356)) ([b941eea](https://github.com/ueberdosis/tiptap/commit/b941eea6daba09d48a5d18ccc1b9a1d84b2249dd))





## [2.3.2](https://github.com/ueberdosis/tiptap/compare/v2.3.1...v2.3.2) (2024-05-08)


### Bug Fixes

* NodePos querySelectorAll function ([#5094](https://github.com/ueberdosis/tiptap/issues/5094)) ([4900a27](https://github.com/ueberdosis/tiptap/commit/4900a27c5389d9a2d0d69f407ca3db0155304315))





## [2.3.1](https://github.com/ueberdosis/tiptap/compare/v2.3.0...v2.3.1) (2024-04-30)

**Note:** Version bump only for package tiptap





# [2.3.0](https://github.com/ueberdosis/tiptap/compare/v2.2.6...v2.3.0) (2024-04-09)


### Bug Fixes

* **core:** fix nodepos child lookup ([#5038](https://github.com/ueberdosis/tiptap/issues/5038)) ([22ced31](https://github.com/ueberdosis/tiptap/commit/22ced318723003365fbfd8f59b8dac79c7563017))


### Features

* **core:** apply input and paste rules when using insertContent methods ([#5046](https://github.com/ueberdosis/tiptap/issues/5046)) ([96b6abc](https://github.com/ueberdosis/tiptap/commit/96b6abcf6edbc6cac03a391130d9feebb6de3a04))





## [2.2.6](https://github.com/ueberdosis/tiptap/compare/v2.2.5...v2.2.6) (2024-04-06)


### Bug Fixes

* unexpected renderText() for contentful nodes ([#3410](https://github.com/ueberdosis/tiptap/issues/3410)) ([d6c71a8](https://github.com/ueberdosis/tiptap/commit/d6c71a838d590f78fdff15c805d93f43c8a5a1a5))





## [2.2.5](https://github.com/ueberdosis/tiptap/compare/v2.2.4...v2.2.5) (2024-04-05)


### Bug Fixes

* Disallow only whitespace between markdown shortcuts delimiters ([#4866](https://github.com/ueberdosis/tiptap/issues/4866)) ([aa029fe](https://github.com/ueberdosis/tiptap/commit/aa029fe2242aeadc38555b2832df6ae1614c7d1d))
* **extension-link:** Avoid auto-linking partial text for invalid TLDs ([#4865](https://github.com/ueberdosis/tiptap/issues/4865)) ([4474d05](https://github.com/ueberdosis/tiptap/commit/4474d056daf9280ebb10b31f98bb000e953132e5))





## [2.2.4](https://github.com/ueberdosis/tiptap/compare/v2.2.3...v2.2.4) (2024-02-23)


### Bug Fixes

* mark nocookie youtube url as valid when parsing html ([#4883](https://github.com/ueberdosis/tiptap/issues/4883)) ([099e10d](https://github.com/ueberdosis/tiptap/commit/099e10df923d851dd866354e9abca331d995b65c))
* typecheck drag and clipboard events for testing environments ([bbee9a3](https://github.com/ueberdosis/tiptap/commit/bbee9a3c3090fa40bf366591682b42a3f6ec5f91))





## [2.2.3](https://github.com/ueberdosis/tiptap/compare/v2.2.2...v2.2.3) (2024-02-15)


### Bug Fixes

* fix test path ([21aa96d](https://github.com/ueberdosis/tiptap/commit/21aa96dee8deab1f439b7f655b8ed266a516a4cd))





## [2.2.2](https://github.com/ueberdosis/tiptap/compare/v2.2.1...v2.2.2) (2024-02-07)


### Bug Fixes

* **react:** use ref instead of state in useEditor to prevent rerenders ([#4856](https://github.com/ueberdosis/tiptap/issues/4856)) ([56a5737](https://github.com/ueberdosis/tiptap/commit/56a5737ed102ee75ec72f9cc2847e3c977f431bd))





## [2.2.1](https://github.com/ueberdosis/tiptap/compare/v2.2.0...v2.2.1) (2024-01-31)

**Note:** Version bump only for package tiptap





# [2.2.0](https://github.com/ueberdosis/tiptap/compare/v2.1.16...v2.2.0) (2024-01-29)


### Bug Fixes

* **core:** fix new lines being added via elementFromString ([#4767](https://github.com/ueberdosis/tiptap/issues/4767)) ([b7a2504](https://github.com/ueberdosis/tiptap/commit/b7a2504f16f46563537c890930cb2c332c256175))
* fix bug [#4785](https://github.com/ueberdosis/tiptap/issues/4785) ([#4836](https://github.com/ueberdosis/tiptap/issues/4836)) ([f3cba1e](https://github.com/ueberdosis/tiptap/commit/f3cba1e0b0288156c1427437e5a0b9e03cd67e63))
* fix imports, fix demos, unpin y-prosemirror ([681aa57](https://github.com/ueberdosis/tiptap/commit/681aa577bff500015c3f925e300c55a71c73efaf))
* fix newline stripping via insertContent ([8954007](https://github.com/ueberdosis/tiptap/commit/8954007b2b92b040d69b26a0866ae58fabf5e512))



# [2.2.0-rc.8](https://github.com/ueberdosis/tiptap/compare/v2.1.14...v2.2.0-rc.8) (2024-01-08)


### Bug Fixes

* **core:** fix options now being empty ([fc67cb1](https://github.com/ueberdosis/tiptap/commit/fc67cb1b7166c1ab6b6e0174539c9e29c364eace))



# [2.2.0-rc.7](https://github.com/ueberdosis/tiptap/compare/v2.2.0-rc.6...v2.2.0-rc.7) (2023-11-27)


### Bug Fixes

* **core:** set defaultOptions to undefined by default ([448b433](https://github.com/ueberdosis/tiptap/commit/448b433ee7847bfba4cd803d8c8820763ceedafc))



# [2.2.0-rc.6](https://github.com/ueberdosis/tiptap/compare/v2.2.0-rc.5...v2.2.0-rc.6) (2023-11-23)


### Reverts

* Revert "fix/react-renderer-node-attrs (#4321)" ([a4af83c](https://github.com/ueberdosis/tiptap/commit/a4af83ca52c8e020f88990af53981591559205a9)), closes [#4321](https://github.com/ueberdosis/tiptap/issues/4321)
* Revert "autolink improvement" ([ef10ae5](https://github.com/ueberdosis/tiptap/commit/ef10ae53b2a3854fceefc2999e166ed1fe4e9b32))



# [2.2.0-rc.4](https://github.com/ueberdosis/tiptap/compare/v2.1.11...v2.2.0-rc.4) (2023-10-10)


### Bug Fixes

* add missing attributes in extension-link ([#4429](https://github.com/ueberdosis/tiptap/issues/4429)) ([0578265](https://github.com/ueberdosis/tiptap/commit/0578265bfe548a7f574cdbe055ef07b9029d8797))
* **history:** use correct shortcuts for undo/redo ([520ce79](https://github.com/ueberdosis/tiptap/commit/520ce790c3dff2d0774211fe30fdce1905655b09))


### Features

* **extension/youtube:** Allow youtube shorts urls to be embedded ([4d79cb8](https://github.com/ueberdosis/tiptap/commit/4d79cb85c93353cdb5ead518da63cf8f9fa71497))



# [2.2.0-rc.3](https://github.com/ueberdosis/tiptap/compare/v2.2.0-rc.2...v2.2.0-rc.3) (2023-08-18)



# [2.2.0-rc.1](https://github.com/ueberdosis/tiptap/compare/v2.2.0-rc.0...v2.2.0-rc.1) (2023-08-18)



# [2.2.0-rc.0](https://github.com/ueberdosis/tiptap/compare/v2.1.5...v2.2.0-rc.0) (2023-08-18)


### Features

* **placeholder:** allow editor-is-empty class on any node ([#4335](https://github.com/ueberdosis/tiptap/issues/4335)) ([ff929b1](https://github.com/ueberdosis/tiptap/commit/ff929b179de930619005a773bb4186ae2aa2ec58))





## [2.1.16](https://github.com/ueberdosis/tiptap/compare/v2.1.15...v2.1.16) (2024-01-10)


### Bug Fixes

* **core:** fix new lines being added via elementFromString ([#4767](https://github.com/ueberdosis/tiptap/issues/4767)) ([2235908](https://github.com/ueberdosis/tiptap/commit/2235908c28f388eda041d1d5d017554d513fe909))


### Reverts

* Revert "fix(extension-link): fix link not being kept when pasting url with link (#3975)" ([1b34271](https://github.com/ueberdosis/tiptap/commit/1b34271edfdd6e81f670f9ddb15cd6838d986e9f)), closes [#3975](https://github.com/ueberdosis/tiptap/issues/3975)





## [2.1.15](https://github.com/ueberdosis/tiptap/compare/v2.1.14...v2.1.15) (2024-01-08)


### Bug Fixes

* **core:** fix insertContentAt keeping new lines in html content ([#4465](https://github.com/ueberdosis/tiptap/issues/4465)) ([135a12f](https://github.com/ueberdosis/tiptap/commit/135a12f7aa2df839a0b619704110a360b980c738))
* **link:** fix tests ([d495d92](https://github.com/ueberdosis/tiptap/commit/d495d92a1f7b1c51e09ac8f4934e15a2d1cf070d))


### Reverts

* Revert "update package-lock" ([faead69](https://github.com/ueberdosis/tiptap/commit/faead6987337ea8471619fdc3124437954772a1a))





## [2.1.14](https://github.com/ueberdosis/tiptap/compare/v2.1.13...v2.1.14) (2024-01-08)


### Bug Fixes

* **typography:** require spaces after divisions to not break date formats ([#4696](https://github.com/ueberdosis/tiptap/issues/4696)) ([f6d7e00](https://github.com/ueberdosis/tiptap/commit/f6d7e00a746a67fa440a3fa0f5362295959873d2))





## [2.1.13](https://github.com/ueberdosis/tiptap/compare/v2.1.12...v2.1.13) (2023-11-30)

### Bug Fixes
* **react:** fix performance regression because of select/deselect ([#4661](https://github.com/ueberdosis/tiptap/issues/4661)) ([ad7f659](https://github.com/ueberdosis/tiptap/commit/ad7f659ed08a6a7c57056b78edbded014549f2dc))





## [2.1.12](https://github.com/ueberdosis/tiptap/compare/v2.1.11...v2.1.12) (2023-10-11)


### Bug Fixes

* **link:** restore pasteHandler and add existing url check ([#4523](https://github.com/ueberdosis/tiptap/issues/4523)) ([1a7b428](https://github.com/ueberdosis/tiptap/commit/1a7b4280d2f9c334d14b16016c29e9f4862716a0))





## [2.1.11](https://github.com/ueberdosis/tiptap/compare/v2.1.10...v2.1.11) (2023-09-20)


### Reverts

* Revert "v2.2.11" ([6aa755a](https://github.com/ueberdosis/tiptap/commit/6aa755a04b9955fc175c7ab33dee527d0d5deef0))





## [2.1.10](https://github.com/ueberdosis/tiptap/compare/v2.1.9...v2.1.10) (2023-09-15)

**Note:** Version bump only for package tiptap





## [2.1.9](https://github.com/ueberdosis/tiptap/compare/v2.1.8...v2.1.9) (2023-09-14)


### Bug Fixes

* add missing attributes in extension-link ([#4429](https://github.com/ueberdosis/tiptap/issues/4429)) ([74b6444](https://github.com/ueberdosis/tiptap/commit/74b644438829d6ee9b0795bc70c55f2755d7438c))





## [2.1.8](https://github.com/ueberdosis/tiptap-workspace/compare/v2.1.7...v2.1.8) (2023-09-04)

**Note:** Version bump only for package tiptap





## [2.1.7](https://github.com/ueberdosis/tiptap-workspace/compare/v2.1.6...v2.1.7) (2023-09-04)


### Bug Fixes

* **horizontal-rule:** fix insertion being broken on empty docs ([#4375](https://github.com/ueberdosis/tiptap-workspace/issues/4375)) ([2a83166](https://github.com/ueberdosis/tiptap-workspace/commit/2a83166a46f97a9fc42ae23ce5367bb58bcdab74))





## [2.1.6](https://github.com/ueberdosis/tiptap/compare/v2.1.5...v2.1.6) (2023-08-18)


### Bug Fixes

* **core:** fix broken export ([4227f32](https://github.com/ueberdosis/tiptap/commit/4227f324a5bfd4f0905c70ac8ea68903352f911b))





## [2.1.5](https://github.com/ueberdosis/tiptap/compare/v2.1.4...v2.1.5) (2023-08-18)


### Bug Fixes

* **list-key-map:** fix broken imports ([#4350](https://github.com/ueberdosis/tiptap/issues/4350)) ([e40ac25](https://github.com/ueberdosis/tiptap/commit/e40ac2584e813893a61c91a456bdcd2cf6652b50))





## [2.1.4](https://github.com/ueberdosis/tiptap/compare/v2.1.3...v2.1.4) (2023-08-18)


### Bug Fixes

* replace the whole node in nodeInputRule ([#4341](https://github.com/ueberdosis/tiptap/issues/4341)) ([ffeefe2](https://github.com/ueberdosis/tiptap/commit/ffeefe21ff3c1f951a5a4f9ae9697317ddd1c5ad))





## [2.1.3](https://github.com/ueberdosis/tiptap/compare/v2.1.2...v2.1.3) (2023-08-18)


### Bug Fixes

* fix autolink when code is not enabled for editor ([#4344](https://github.com/ueberdosis/tiptap/issues/4344)) ([f2ac7b9](https://github.com/ueberdosis/tiptap/commit/f2ac7b90912a78b90216a7d7d084c86f0c0eef48))





## [2.1.2](https://github.com/ueberdosis/tiptap/compare/v2.1.1...v2.1.2) (2023-08-17)


### Bug Fixes

* **core:** fix error when merging class attributes ([#4340](https://github.com/ueberdosis/tiptap/issues/4340)) ([a251946](https://github.com/ueberdosis/tiptap/commit/a2519468589e2baa44901a66a3a06b24dc8626d6))





## [2.1.1](https://github.com/ueberdosis/tiptap/compare/v2.1.0...v2.1.1) (2023-08-16)

**Note:** Version bump only for package tiptap





# [2.1.0](https://github.com/ueberdosis/tiptap-workspace/compare/v2.1.0-rc.14...v2.1.0) (2023-08-16)

**Note:** Version bump only for package tiptap





# [2.1.0-rc.14](https://github.com/ueberdosis/tiptap-workspace/compare/v2.1.0-rc.13...v2.1.0-rc.14) (2023-08-11)

**Note:** Version bump only for package tiptap





# [2.1.0-rc.13](https://github.com/ueberdosis/tiptap-workspace/compare/v2.0.4...v2.1.0-rc.13) (2023-08-11)


### Bug Fixes

* **demos:** add missing extensions ([6383fd5](https://github.com/ueberdosis/tiptap-workspace/commit/6383fd54080b2ad555286cd0e7c4ad880200200f))
* **demos:** update deps ([05a2edf](https://github.com/ueberdosis/tiptap-workspace/commit/05a2edfc16e297effa86d1583fb1680be0320f25))
* **link:** Fix autolinking and pasting ([#4292](https://github.com/ueberdosis/tiptap-workspace/issues/4292)) ([a2ce734](https://github.com/ueberdosis/tiptap-workspace/commit/a2ce734d681039fd61d402987e0842ddef6af595))
* **strikethrough:** update strikethrough shortcut ([#4288](https://github.com/ueberdosis/tiptap-workspace/issues/4288)) ([fd35db4](https://github.com/ueberdosis/tiptap-workspace/commit/fd35db4d090d9fdfef1196fb1f6f858f13cf53d1))



# [2.1.0-rc.12](https://github.com/ueberdosis/tiptap-workspace/compare/v2.1.0-rc.11...v2.1.0-rc.12) (2023-07-14)



# [2.1.0-rc.11](https://github.com/ueberdosis/tiptap-workspace/compare/v2.1.0-rc.10...v2.1.0-rc.11) (2023-07-07)


### Bug Fixes

* **core:** fix cut and insertContentAt functions ([#4187](https://github.com/ueberdosis/tiptap-workspace/issues/4187)) ([6b65af8](https://github.com/ueberdosis/tiptap-workspace/commit/6b65af8fc31ffbbcf79b89bfdaceee7aadbf3f27))
* **tests:** fix link rel tests ([c1d1854](https://github.com/ueberdosis/tiptap-workspace/commit/c1d18543b03b1fb6b99a2f3546aa5da10c919920))



# [2.1.0-rc.10](https://github.com/ueberdosis/tiptap-workspace/compare/v2.1.0-rc.9...v2.1.0-rc.10) (2023-07-07)


### Bug Fixes

* do not use window.open for links in readonly mode ([#4073](https://github.com/ueberdosis/tiptap-workspace/issues/4073)) ([4bca77e](https://github.com/ueberdosis/tiptap-workspace/commit/4bca77e4e9c96596d584cf71b8d831dc2ab0a421))
* **extension-link:** fixes link going to wrong url ([#4078](https://github.com/ueberdosis/tiptap-workspace/issues/4078)) ([3053865](https://github.com/ueberdosis/tiptap-workspace/commit/30538654752ab3ded6e56c869745ccacc8cdeabc))
* **link:** Prevent auto-linking when typing URL inside inline code mark ([#4160](https://github.com/ueberdosis/tiptap-workspace/issues/4160)) ([b24df3a](https://github.com/ueberdosis/tiptap-workspace/commit/b24df3aa4c2f3fdb2ed6122d2d32fb7c4e07f2af))
* **react:** check props.clientRect before creating ReactRenderer ([#4138](https://github.com/ueberdosis/tiptap-workspace/issues/4138)) ([d710846](https://github.com/ueberdosis/tiptap-workspace/commit/d710846ecb6a3059dfbc21300b9a4b887a8defa3))
* **react:** update select state when text selection is around node ([#4148](https://github.com/ueberdosis/tiptap-workspace/issues/4148)) ([5bd5bd4](https://github.com/ueberdosis/tiptap-workspace/commit/5bd5bd4ecdbe1f952b23d5f5efad16b6ed5cc44f))


### Features

* **docs:** added cdn installation guide ([#4045](https://github.com/ueberdosis/tiptap-workspace/issues/4045)) ([8536508](https://github.com/ueberdosis/tiptap-workspace/commit/853650885b7c4f2217a4b37bc42ee65b4cd6026a))



# [2.1.0-rc.9](https://github.com/ueberdosis/tiptap-workspace/compare/v2.1.0-rc.8...v2.1.0-rc.9) (2023-06-15)



# [2.1.0-rc.8](https://github.com/ueberdosis/tiptap-workspace/compare/v2.1.0-rc.7...v2.1.0-rc.8) (2023-05-25)



# [2.1.0-rc.7](https://github.com/ueberdosis/tiptap-workspace/compare/v2.1.0-rc.6...v2.1.0-rc.7) (2023-05-25)



# [2.1.0-rc.5](https://github.com/ueberdosis/tiptap-workspace/compare/v2.1.0-rc.4...v2.1.0-rc.5) (2023-05-25)


### Bug Fixes

* **extension-link:** fix paste handling ([d19267e](https://github.com/ueberdosis/tiptap-workspace/commit/d19267ecefabf08e4bd27c52424ed83991ce7270))
* typo in commands.md ([a2a9822](https://github.com/ueberdosis/tiptap-workspace/commit/a2a9822f240df2301932a67225d9adcac2f18807))


### Features

* add tiptap class ([614fc80](https://github.com/ueberdosis/tiptap-workspace/commit/614fc8082c376bf3c40a05c23ceda6b4a6fbf8d0))



# [2.1.0-rc.4](https://github.com/ueberdosis/tiptap-workspace/compare/v2.1.0-rc.3...v2.1.0-rc.4) (2023-04-27)


### Bug Fixes

* **link:** fix links autolinking when not needed ([#3989](https://github.com/ueberdosis/tiptap-workspace/issues/3989)) ([71946c1](https://github.com/ueberdosis/tiptap-workspace/commit/71946c18accf8a2e8192951de870f84e25f58ed5))



# [2.1.0-rc.3](https://github.com/ueberdosis/tiptap-workspace/compare/v2.1.0-rc.2...v2.1.0-rc.3) (2023-04-26)


### Bug Fixes

* **core:** remove configure from extend functionality ([4af54da](https://github.com/ueberdosis/tiptap-workspace/commit/4af54da3e09c69c0b5326f9952d456436855914d))



# [2.1.0-rc.2](https://github.com/ueberdosis/tiptap-workspace/compare/v2.0.3...v2.1.0-rc.2) (2023-04-26)


### Bug Fixes

* **extension-link:** fix link not being kept when pasting url with link ([#3975](https://github.com/ueberdosis/tiptap-workspace/issues/3975)) ([e7d7d49](https://github.com/ueberdosis/tiptap-workspace/commit/e7d7d496376c8c11e24c342e20bd179a6ea7dcee))



# [2.1.0-rc.1](https://github.com/ueberdosis/tiptap-workspace/compare/v2.1.0-rc.0...v2.1.0-rc.1) (2023-04-12)


### Bug Fixes

* **bubble-menu:** fix debounce not working with collab/collaboration cursor ([#3956](https://github.com/ueberdosis/tiptap-workspace/issues/3956)) ([e8cef04](https://github.com/ueberdosis/tiptap-workspace/commit/e8cef0404b5039ec2657536976b8b31931afd337))



# [2.1.0-rc.0](https://github.com/ueberdosis/tiptap-workspace/compare/v2.0.2...v2.1.0-rc.0) (2023-04-05)


### Bug Fixes

* clear nodes when cursor at start of empty isolating parent ([#3943](https://github.com/ueberdosis/tiptap-workspace/issues/3943)) ([7278ee2](https://github.com/ueberdosis/tiptap-workspace/commit/7278ee2b05de2f96efddf3b1dc3bfd3d52262cbb))
* **list-item:** improve delete behaviour ([09782a5](https://github.com/ueberdosis/tiptap-workspace/commit/09782a5b066b2f9f52f0ef1d8701d6e5b063dc63))
* **lists:** improve list behaviour ([684e48a](https://github.com/ueberdosis/tiptap-workspace/commit/684e48a4a7778a0140c94f0c5345db868174ad81))
* Update peerDependencies to fix lerna version tasks ([#3914](https://github.com/ueberdosis/tiptap-workspace/issues/3914)) ([0c1bba3](https://github.com/ueberdosis/tiptap-workspace/commit/0c1bba3137b535776bcef95ff3c55e13f5a2db46))





# [2.1.0-rc.12](https://github.com/ueberdosis/tiptap-workspace/compare/v2.1.0-rc.11...v2.1.0-rc.12) (2023-07-14)

**Note:** Version bump only for package tiptap





# [2.1.0-rc.11](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.10...v2.1.0-rc.11) (2023-07-07)


### Bug Fixes

* **core:** fix cut and insertContentAt functions ([#4187](https://github.com/ueberdosis/tiptap/issues/4187)) ([6b65af8](https://github.com/ueberdosis/tiptap/commit/6b65af8fc31ffbbcf79b89bfdaceee7aadbf3f27))
* **tests:** fix link rel tests ([c1d1854](https://github.com/ueberdosis/tiptap/commit/c1d18543b03b1fb6b99a2f3546aa5da10c919920))





# [2.1.0-rc.10](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.9...v2.1.0-rc.10) (2023-07-07)


### Bug Fixes

* do not use window.open for links in readonly mode ([#4073](https://github.com/ueberdosis/tiptap/issues/4073)) ([4bca77e](https://github.com/ueberdosis/tiptap/commit/4bca77e4e9c96596d584cf71b8d831dc2ab0a421))
* **extension-link:** fixes link going to wrong url ([#4078](https://github.com/ueberdosis/tiptap/issues/4078)) ([3053865](https://github.com/ueberdosis/tiptap/commit/30538654752ab3ded6e56c869745ccacc8cdeabc))
* **link:** Prevent auto-linking when typing URL inside inline code mark ([#4160](https://github.com/ueberdosis/tiptap/issues/4160)) ([b24df3a](https://github.com/ueberdosis/tiptap/commit/b24df3aa4c2f3fdb2ed6122d2d32fb7c4e07f2af))
* **react:** check props.clientRect before creating ReactRenderer ([#4138](https://github.com/ueberdosis/tiptap/issues/4138)) ([d710846](https://github.com/ueberdosis/tiptap/commit/d710846ecb6a3059dfbc21300b9a4b887a8defa3))
* **react:** update select state when text selection is around node ([#4148](https://github.com/ueberdosis/tiptap/issues/4148)) ([5bd5bd4](https://github.com/ueberdosis/tiptap/commit/5bd5bd4ecdbe1f952b23d5f5efad16b6ed5cc44f))


### Features

* **docs:** added cdn installation guide ([#4045](https://github.com/ueberdosis/tiptap/issues/4045)) ([8536508](https://github.com/ueberdosis/tiptap/commit/853650885b7c4f2217a4b37bc42ee65b4cd6026a))





# [2.1.0-rc.9](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.8...v2.1.0-rc.9) (2023-06-15)


### Bug Fixes

* **list-item:** improve delete behaviour ([09782a5](https://github.com/ueberdosis/tiptap/commit/09782a5b066b2f9f52f0ef1d8701d6e5b063dc63))
* **lists:** improve list behaviour ([684e48a](https://github.com/ueberdosis/tiptap/commit/684e48a4a7778a0140c94f0c5345db868174ad81))





# [2.1.0-rc.8](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.7...v2.1.0-rc.8) (2023-05-25)

**Note:** Version bump only for package tiptap





# [2.1.0-rc.7](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.6...v2.1.0-rc.7) (2023-05-25)

**Note:** Version bump only for package tiptap





# [2.1.0-rc.6](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.5...v2.1.0-rc.6) (2023-05-25)

**Note:** Version bump only for package tiptap





# [2.1.0-rc.5](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.4...v2.1.0-rc.5) (2023-05-25)


### Bug Fixes

* **extension-link:** fix paste handling ([d19267e](https://github.com/ueberdosis/tiptap/commit/d19267ecefabf08e4bd27c52424ed83991ce7270))
* typo in commands.md ([a2a9822](https://github.com/ueberdosis/tiptap/commit/a2a9822f240df2301932a67225d9adcac2f18807))


### Features

* add tiptap class ([614fc80](https://github.com/ueberdosis/tiptap/commit/614fc8082c376bf3c40a05c23ceda6b4a6fbf8d0))





# [2.1.0-rc.4](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.3...v2.1.0-rc.4) (2023-04-27)


### Bug Fixes

* **link:** fix links autolinking when not needed ([#3989](https://github.com/ueberdosis/tiptap/issues/3989)) ([71946c1](https://github.com/ueberdosis/tiptap/commit/71946c18accf8a2e8192951de870f84e25f58ed5))





# [2.1.0-rc.3](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.2...v2.1.0-rc.3) (2023-04-26)


### Bug Fixes

* **core:** remove configure from extend functionality ([4af54da](https://github.com/ueberdosis/tiptap/commit/4af54da3e09c69c0b5326f9952d456436855914d))





# [2.1.0-rc.2](https://github.com/ueberdosis/tiptap/compare/v2.0.3...v2.1.0-rc.2) (2023-04-26)


### Bug Fixes

* **extension-link:** fix link not being kept when pasting url with link ([#3975](https://github.com/ueberdosis/tiptap/issues/3975)) ([e7d7d49](https://github.com/ueberdosis/tiptap/commit/e7d7d496376c8c11e24c342e20bd179a6ea7dcee))



# [2.1.0-rc.1](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.0...v2.1.0-rc.1) (2023-04-12)


### Bug Fixes

* **bubble-menu:** fix debounce not working with collab/collaboration cursor ([#3956](https://github.com/ueberdosis/tiptap/issues/3956)) ([e8cef04](https://github.com/ueberdosis/tiptap/commit/e8cef0404b5039ec2657536976b8b31931afd337))



# [2.1.0-rc.0](https://github.com/ueberdosis/tiptap/compare/v2.0.2...v2.1.0-rc.0) (2023-04-05)


### Bug Fixes

* clear nodes when cursor at start of empty isolating parent ([#3943](https://github.com/ueberdosis/tiptap/issues/3943)) ([7278ee2](https://github.com/ueberdosis/tiptap/commit/7278ee2b05de2f96efddf3b1dc3bfd3d52262cbb))
* Update peerDependencies to fix lerna version tasks ([#3914](https://github.com/ueberdosis/tiptap/issues/3914)) ([0c1bba3](https://github.com/ueberdosis/tiptap/commit/0c1bba3137b535776bcef95ff3c55e13f5a2db46))






# [2.1.0-rc.0](https://github.com/ueberdosis/tiptap/compare/v2.0.2...v2.1.0-rc.0) (2023-04-05)


### Bug Fixes

* clear nodes when cursor at start of empty isolating parent ([#3943](https://github.com/ueberdosis/tiptap/issues/3943)) ([7278ee2](https://github.com/ueberdosis/tiptap/commit/7278ee2b05de2f96efddf3b1dc3bfd3d52262cbb))
* Update peerDependencies to fix lerna version tasks ([#3914](https://github.com/ueberdosis/tiptap/issues/3914)) ([0c1bba3](https://github.com/ueberdosis/tiptap/commit/0c1bba3137b535776bcef95ff3c55e13f5a2db46))
* **bubble-menu:** fix debounce not working with collab/collaboration cursor ([#3956](https://github.com/ueberdosis/tiptap/issues/3956)) ([a78f8cd](https://github.com/ueberdosis/tiptap/commit/a78f8cd9646008e4db938fa3c22b0714c8bb5849))





## [2.0.3](https://github.com/ueberdosis/tiptap/compare/v2.0.2...v2.0.3) (2023-04-13)

### Bug Fixes

* **bubble-menu:** fix debounce not working with collab/collaboration cursor ([#3956](https://github.com/ueberdosis/tiptap/issues/3956)) ([e8cef04](https://github.com/ueberdosis/tiptap/commit/e8cef0404b5039ec2657536976b8b31931afd337))




## [2.0.2](https://github.com/ueberdosis/tiptap/compare/v2.0.1...v2.0.2) (2023-04-03)


### Bug Fixes

* **react:** fix rebinding events not overwriting editor.on ([#3935](https://github.com/ueberdosis/tiptap/issues/3935)) ([64ab357](https://github.com/ueberdosis/tiptap/commit/64ab3570c1e86a65f5022793acb0292d8972dcd7))


### Features

* add box-shadow to collab demo ([c5496c1](https://github.com/ueberdosis/tiptap/commit/c5496c1b27783150dafb5ebdf6bda43648a46316))
* landingpage demo ([#3925](https://github.com/ueberdosis/tiptap/issues/3925)) ([958925f](https://github.com/ueberdosis/tiptap/commit/958925f2560ca786cd0cf52b83b7ae51deb7dd77))
* Tiptap collab demo styling ([87840b0](https://github.com/ueberdosis/tiptap/commit/87840b0f0821ca65d9f104d9c90512021aa70113))





## [2.0.1](https://github.com/ueberdosis/tiptap/compare/v2.0.0...v2.0.1) (2023-03-30)


### Bug Fixes

* Update peerDependencies to fix lerna version tasks ([#3914](https://github.com/ueberdosis/tiptap/issues/3914)) ([0534f76](https://github.com/ueberdosis/tiptap/commit/0534f76401bf5399c01ca7f39d87f7221d91b4f7))

## [2.0.0](https://github.com/ueberdosis/tiptap/compare/tiptap@1.32.2...v2.0.0) (2023-03-29)

## What's Changed
* Fix sending of emptystring class for Prosemirror decoration by @ascott18 in https://github.com/ueberdosis/tiptap/pull/1004
* build(deps): bump actions/cache from v2.1.4 to v2.1.5 by @dependabot in https://github.com/ueberdosis/tiptap/pull/1024
* build(deps): bump actions/upload-artifact from v2.2.2 to v2.2.3 by @dependabot in https://github.com/ueberdosis/tiptap/pull/1025
* Add install instructions by @MarcelloTheArcane in https://github.com/ueberdosis/tiptap/pull/1196
* Fix a small typo by @swanson in https://github.com/ueberdosis/tiptap/pull/1211
* Add missing word by @swanson in https://github.com/ueberdosis/tiptap/pull/1216
* Clarify table header documentation by @swanson in https://github.com/ueberdosis/tiptap/pull/1215
* Typo fix by @swanson in https://github.com/ueberdosis/tiptap/pull/1217
* Make Horizontal Rule compatible with Typography extension by @chrisarmstrong in https://github.com/ueberdosis/tiptap/pull/1241
* Fix returning true/false in can().chain().run() by @Markario in https://github.com/ueberdosis/tiptap/pull/1252
* [Docs] Improve example integration with Laravel Livewire by @iksaku in https://github.com/ueberdosis/tiptap/pull/1255
* feat: better types for Vue 2 by @zcuric in https://github.com/ueberdosis/tiptap/pull/1253
* Fix typo by @DannyFeliz in https://github.com/ueberdosis/tiptap/pull/1262
* HorizontalRule is included in defaultExtensions by @Duncank in https://github.com/ueberdosis/tiptap/pull/1267
* VueRenderer's ref is undefined when in production mode by @thechrisoshow in https://github.com/ueberdosis/tiptap/pull/1271
* feat: expose node helpers  by @zcuric in https://github.com/ueberdosis/tiptap/pull/1278
* New Feature: Generate JSON from HTML by @hanspagel in https://github.com/ueberdosis/tiptap/pull/1273
* feat: export mark helpers by @zcuric in https://github.com/ueberdosis/tiptap/pull/1301
* When text align is default, don't add a style attribute by @robguthrie in https://github.com/ueberdosis/tiptap/pull/1251
* docs: complete list of extensions with changed name by @Deckluhm in https://github.com/ueberdosis/tiptap/pull/1305
* fix(core): Increment `i` in `defaultBlockAt` by @andreavaccari in https://github.com/ueberdosis/tiptap/pull/1315
* Fix text-align extension url by @ralbear in https://github.com/ueberdosis/tiptap/pull/1325
* docs: fix typo by @Priestch in https://github.com/ueberdosis/tiptap/pull/1339
* Allow passing of DependencyList to useEditor by @YousefED in https://github.com/ueberdosis/tiptap/pull/1376
* a small clerical error? by @akirarika in https://github.com/ueberdosis/tiptap/pull/1380
* Make HTML in docs valid by @MoPaMo in https://github.com/ueberdosis/tiptap/pull/1381
* Wording improvement by @jonathanmach in https://github.com/ueberdosis/tiptap/pull/1389
* Prevent tiptap from creating duplicate style tags when injecting css by @mmachatschek in https://github.com/ueberdosis/tiptap/pull/1399
* Adding type definition for result and removing the ts-nocheck by @sereneinserenade in https://github.com/ueberdosis/tiptap/pull/1419
* Fix name of FloatingMenu by @shadow-light in https://github.com/ueberdosis/tiptap/pull/1429
* New extensions: add subscript and superscript extensions (including docs and tests) by @hanspagel in https://github.com/ueberdosis/tiptap/pull/1404
* Exclude superscript from subscript, and vice versa. by @BrianHung in https://github.com/ueberdosis/tiptap/pull/1436
* Add keyboard shortcuts to toggle superscript and subscript marks. by @BrianHung in https://github.com/ueberdosis/tiptap/pull/1437
* Make drop cursor default to regular caret color by @shadow-light in https://github.com/ueberdosis/tiptap/pull/1444
* use forwardRef for react wrappers by @YousefED in https://github.com/ueberdosis/tiptap/pull/1452
* Mention: Add text attribute by @tomhrtly in https://github.com/ueberdosis/tiptap/pull/1322
* Fix removal of textStyle mark when any style resets by @bttger in https://github.com/ueberdosis/tiptap/pull/1465
* Fix parsing of mention nodes by @shadow-light in https://github.com/ueberdosis/tiptap/pull/1471
* Correct default for dropcursor color in docs by @shadow-light in https://github.com/ueberdosis/tiptap/pull/1479
* Improve gapcursor docs by @carlobeltrame in https://github.com/ueberdosis/tiptap/pull/1497
* VueRenderer documentation with version 3 by @Tazi0 in https://github.com/ueberdosis/tiptap/pull/1491
* Update introduction.md by @phillduffy in https://github.com/ueberdosis/tiptap/pull/1509
* Link to contribution guidelines in CONTRIBUTING.md by @robertvanhoesel in https://github.com/ueberdosis/tiptap/pull/1541
* build(deps): bump actions/setup-node from 2.1.5 to 2.2.0 by @dependabot in https://github.com/ueberdosis/tiptap/pull/1544
* export createTable by @YousefED in https://github.com/ueberdosis/tiptap/pull/1469
* doc update: onSelection → onSelectionUpdate by @forresto in https://github.com/ueberdosis/tiptap/pull/1555
* update task-item.ts nodeview to update data-checked by @BrianHung in https://github.com/ueberdosis/tiptap/pull/1567
* Fix typo by @JavierMartinz in https://github.com/ueberdosis/tiptap/pull/1587
* Replace node-sass with dart sass and fix deprecation warning by @mmachatschek in https://github.com/ueberdosis/tiptap/pull/1590
* Readd russian history shortcuts by @mmachatschek in https://github.com/ueberdosis/tiptap/pull/1589
* Fix custom start for ordered lists by @mmachatschek in https://github.com/ueberdosis/tiptap/pull/1594
* Doc fix: Remove braces from isEmpty & isEditable by @WilliamIPark in https://github.com/ueberdosis/tiptap/pull/1599
* Export NodeViewRendererOptions by @sibiraj-s in https://github.com/ueberdosis/tiptap/pull/1607
* Update hostic-dom to fix style attributes by @sibiraj-s in https://github.com/ueberdosis/tiptap/pull/1618
* fix: export text align extension options by @iamursky in https://github.com/ueberdosis/tiptap/pull/1592
* fix: export starter kit extension options by @iamursky in https://github.com/ueberdosis/tiptap/pull/1593
* Adding types to Linter and making the structure a bit easier by @sereneinserenade in https://github.com/ueberdosis/tiptap/pull/1492
* Additional input rules for typography by @arthurmcgregor in https://github.com/ueberdosis/tiptap/pull/1624
* chore: add repository for all packages.json by @iamandrewluca in https://github.com/ueberdosis/tiptap/pull/1628
* Fix typo by @ValentaTomas in https://github.com/ueberdosis/tiptap/pull/1634
* Change TextAlignOptions to interface (not type) by @arthurmcgregor in https://github.com/ueberdosis/tiptap/pull/1623
* Allow a rule to be skipped from the getAttributes callback by @joevallender in https://github.com/ueberdosis/tiptap/pull/1625
* Fix multi character suggest by @flaviouk in https://github.com/ueberdosis/tiptap/pull/1620
* Provide more context to update function to enable fewer re-renders by @philippkuehn in https://github.com/ueberdosis/tiptap/pull/1648
* Examples: Syntax highlighting for React by @hanspagel in https://github.com/ueberdosis/tiptap/pull/1583
* Apply the correct regex in markPasteRule by @joevallender in https://github.com/ueberdosis/tiptap/pull/1671
* Fix typo by @Spone in https://github.com/ueberdosis/tiptap/pull/1693
* build(deps): bump actions/setup-node from 2.2.0 to 2.4.0 by @dependabot in https://github.com/ueberdosis/tiptap/pull/1697
* fix: use correct state when doc changed externally by @dkrym in https://github.com/ueberdosis/tiptap/pull/1646
* ✨ Add CreateNodeFromContentOptions to insertContent by @castroCrea in https://github.com/ueberdosis/tiptap/pull/1678
* Use correct reference for options.editorProps by @robertvanhoesel in https://github.com/ueberdosis/tiptap/pull/1540
* ✨ Add typography trademark by @castroCrea in https://github.com/ueberdosis/tiptap/pull/1699
* Menu improvements by @philippkuehn in https://github.com/ueberdosis/tiptap/pull/1714
* Docs: Disable history demo buttons when commands are not available by @domnantas in https://github.com/ueberdosis/tiptap/pull/1721
* fix some react focus issues by @philippkuehn in https://github.com/ueberdosis/tiptap/pull/1724
* Update alpine docs by @sibiraj-s in https://github.com/ueberdosis/tiptap/pull/1733
* Packages: Add a new `Color` extension to set the text color by @hanspagel in https://github.com/ueberdosis/tiptap/pull/1744
* docs: add color picker to color extension demo by @domnantas in https://github.com/ueberdosis/tiptap/pull/1790
* Fix Editor Reactivity by @nVitius in https://github.com/ueberdosis/tiptap/pull/1804
* Add missing comma in example by @carlobeltrame in https://github.com/ueberdosis/tiptap/pull/1849
* Allow triggering suggestions without prefix space by @jkosir in https://github.com/ueberdosis/tiptap/pull/1826
* fix: change `this.value` to `value` in the vue examples with v-model by @MiloLug in https://github.com/ueberdosis/tiptap/pull/1813
* Fix: Don’t initialize tippy on requestAnimationFrame to avoid race conditions by @enriquecastl in https://github.com/ueberdosis/tiptap/pull/1820
* ✨ Follow Ref on ForwardRef component in reactRenderer by @castroCrea in https://github.com/ueberdosis/tiptap/pull/1690
* feat: add extendEmptyMarkRange option to mark commands by @philippkuehn in https://github.com/ueberdosis/tiptap/pull/1859
* Include children in placeholder plugin by @nickdbush in https://github.com/ueberdosis/tiptap/pull/1416
* Horizontal rule demo: add selected style by @cadars in https://github.com/ueberdosis/tiptap/pull/1848
* feat: add getText() and generateText() methods (fix #1428) by @philippkuehn in https://github.com/ueberdosis/tiptap/pull/1875
* Fix usage example of CollaborationCursor by @carlobeltrame in https://github.com/ueberdosis/tiptap/pull/1911
* Add type for async items on suggestions (fix TS strict types complain) by @d8vjork in https://github.com/ueberdosis/tiptap/pull/1912
* Fix: code-block-lowlight child extensions do not highlight code by @enriquecastl in https://github.com/ueberdosis/tiptap/pull/1917
* Use pasteRegex in addPasteRules by @jvissers in https://github.com/ueberdosis/tiptap/pull/1922
* Docs: Clear up Prosemirror EditorProps usage by @domnantas in https://github.com/ueberdosis/tiptap/pull/1918
* Add enableCoreExtensions flag by @flaviouk in https://github.com/ueberdosis/tiptap/pull/1923
* Docs: Update command names in upgrade guide by @jakedolan in https://github.com/ueberdosis/tiptap/pull/1906
* Fix: nodeInputRule() support for group match by @nokola in https://github.com/ueberdosis/tiptap/pull/1574
* Fix "destory" method in view plugins. by @KaneCohen in https://github.com/ueberdosis/tiptap/pull/1882
* Fix 'Edit on Github' link url for examples in docs by @mmachatschek in https://github.com/ueberdosis/tiptap/pull/1929
* New example for custom documents (to force a heading on the top) by @hanspagel in https://github.com/ueberdosis/tiptap/pull/1948
* Added better types for event emitter by @HuiiBuh in https://github.com/ueberdosis/tiptap/pull/1959
* Use ref to move contentDOM by @philippkuehn in https://github.com/ueberdosis/tiptap/pull/1960
* fix: compatibility with lowlight v2 by @fengzilong in https://github.com/ueberdosis/tiptap/pull/1939
* build(deps): bump actions/setup-node from 2.4.0 to 2.4.1 by @dependabot in https://github.com/ueberdosis/tiptap/pull/1978
* Fix typo in hard-break.md by @davidkrijgsman in https://github.com/ueberdosis/tiptap/pull/1988
* Added Next.js installation guide & express setup for React by @alb in https://github.com/ueberdosis/tiptap/pull/1984
* Fixed typo in React installation guide by @alb in https://github.com/ueberdosis/tiptap/pull/1989
* docs: update styling by @hzpeng57 in https://github.com/ueberdosis/tiptap/pull/1998
* React collaboration demo by @svenadlung in https://github.com/ueberdosis/tiptap/pull/1991
* Integrate input rules and paste rules into the core by @philippkuehn in https://github.com/ueberdosis/tiptap/pull/1997
* Changing use of InputRule to textInputRule for Savvy example by @jakedolan in https://github.com/ueberdosis/tiptap/pull/2007
* docs: correct the wording by @mittalyashu in https://github.com/ueberdosis/tiptap/pull/2012
* Fix #2016 Image input rule by @nokola in https://github.com/ueberdosis/tiptap/pull/2020
* Improve `ReactRenderer` types by @rfgamaral in https://github.com/ueberdosis/tiptap/pull/2011
* Add `editor` dependency when registering `BubbleMenuPlugin` by @ValentaTomas in https://github.com/ueberdosis/tiptap/pull/2018
* Allow to use commands within InputRule and PasteRule by @philippkuehn in https://github.com/ueberdosis/tiptap/pull/2035
* build(deps): bump actions/checkout from 2.3.4 to 2.3.5 by @dependabot in https://github.com/ueberdosis/tiptap/pull/2051
* Add extension storage by @philippkuehn in https://github.com/ueberdosis/tiptap/pull/2069
* Separate drags from drops in stopEvent by @thatsjonsense in https://github.com/ueberdosis/tiptap/pull/2070
* Add editor to items prop in suggestion plugin by @philippkuehn in https://github.com/ueberdosis/tiptap/pull/2082
* Check node type above custom update fn by @thatsjonsense in https://github.com/ueberdosis/tiptap/pull/2081
* Add savvy example tests by @donovanglover in https://github.com/ueberdosis/tiptap/pull/2043
* Add unit tests for demos/src/Examples/Minimal/Vue by @AlexandruValeanu in https://github.com/ueberdosis/tiptap/pull/2047
* Added tests for Menus example by @alb in https://github.com/ueberdosis/tiptap/pull/2052
* Docs: Fixing onUpdate example by @chris-sev in https://github.com/ueberdosis/tiptap/pull/2084
* Fix menu example in doc by @phoenixgao in https://github.com/ueberdosis/tiptap/pull/2089
* Replace `defaultOptions` with `addOptions` by @philippkuehn in https://github.com/ueberdosis/tiptap/pull/2088
* docs: fix typo by @Deckluhm in https://github.com/ueberdosis/tiptap/pull/2093
* Use the new storage feature for the `CollaborationCursor` extension by @hanspagel in https://github.com/ueberdosis/tiptap/pull/2096
* Improve behavior when using insertContent by @philippkuehn in https://github.com/ueberdosis/tiptap/pull/2147
* build(deps): bump actions/checkout from 2.3.5 to 2.4.0 by @dependabot in https://github.com/ueberdosis/tiptap/pull/2145
* Switch from hostic dom to zeed dom by @philippkuehn in https://github.com/ueberdosis/tiptap/pull/2151
* fix typo in events.md by @millerrafi in https://github.com/ueberdosis/tiptap/pull/2152
* update getJSON return type to JSONContent by @lecstor in https://github.com/ueberdosis/tiptap/pull/2153
* Update image.md by @georgemandis in https://github.com/ueberdosis/tiptap/pull/2154
* update zeed dom by @floriankrueger in https://github.com/ueberdosis/tiptap/pull/2155
* Floating menu - remove composition check by @dkrym in https://github.com/ueberdosis/tiptap/pull/2137
* Remove console.log statement from codeblock-lowlight-plugin file by @enriquecastl in https://github.com/ueberdosis/tiptap/pull/2168
* Ignore iOS mutations when unfocused by @thatsjonsense in https://github.com/ueberdosis/tiptap/pull/2170
* feat: Allow array of extensions for `enableInputRules` and `enablePasteRules` by @aguingand in https://github.com/ueberdosis/tiptap/pull/2119
* Export type ColorOptions by @apaar97 in https://github.com/ueberdosis/tiptap/pull/2180
* Split vue and react variant for interactivity demo by @svenadlung in https://github.com/ueberdosis/tiptap/pull/2186
* Add `setEditable` to the Editor documentation by @floriankrueger in https://github.com/ueberdosis/tiptap/pull/2199
* Bump actions/cache from 2.1.5 to 2.1.7 by @dependabot in https://github.com/ueberdosis/tiptap/pull/2207
* Bump actions/setup-node from 2.4.1 to 2.5.0 by @dependabot in https://github.com/ueberdosis/tiptap/pull/2208
* feat(ReactNodeViewRenderer): Add `as` option and pass through to ReactRenderer by @jessicalc in https://github.com/ueberdosis/tiptap/pull/2213
* Add support for autolink by @philippkuehn in https://github.com/ueberdosis/tiptap/pull/2226
* initialize autofocus selection in `createView` by @BrianHung in https://github.com/ueberdosis/tiptap/pull/2212
* Use named exports instead of default exports by @philippkuehn in https://github.com/ueberdosis/tiptap/pull/2238
* Svelte Example: remove wrong `type="context"` tag by @duruer in https://github.com/ueberdosis/tiptap/pull/2240
* A brand new `CharacterCount` extension by @philippkuehn in https://github.com/ueberdosis/tiptap/pull/2256
* join lists on toggleList by @philippkuehn in https://github.com/ueberdosis/tiptap/pull/2260
* build(deps): bump actions/upload-artifact from 2.2.3 to 2.3.0 by @dependabot in https://github.com/ueberdosis/tiptap/pull/2269
* fix: show FloatingMenu by default only if focused by @jaulz in https://github.com/ueberdosis/tiptap/pull/2275
* Improve backspace handling by @philippkuehn in https://github.com/ueberdosis/tiptap/pull/2284
* Make sure editor is available on first render by @ryanto in https://github.com/ueberdosis/tiptap/pull/2282
* fix typo in floating menu docs by @nucleartux in https://github.com/ueberdosis/tiptap/pull/2290
* Add setup for plain js demos by @philippkuehn in https://github.com/ueberdosis/tiptap/pull/2288
* build(deps): bump actions/upload-artifact from 2.3.0 to 2.3.1 by @dependabot in https://github.com/ueberdosis/tiptap/pull/2300
* Remove `element.current` from `useEffect` in `BubbleMenu` and `FloatingMenu` by @ValentaTomas in https://github.com/ueberdosis/tiptap/pull/2297
* Using vue 2 and 3 when passing props to VueRenderer in Mention plugin by @domstrueboy in https://github.com/ueberdosis/tiptap/pull/2319
* Fix typo in readme by @stijndcl in https://github.com/ueberdosis/tiptap/pull/2333
* Fix typos in typescript.md by @hatefrad in https://github.com/ueberdosis/tiptap/pull/2339
* typo in docs/api/editor.md by @milahu in https://github.com/ueberdosis/tiptap/pull/2338
* Added setup script syntax to Vue 3 install docs by @NuroDev in https://github.com/ueberdosis/tiptap/pull/2324
* build(deps): bump actions/setup-node from 2.5.0 to 2.5.1 by @dependabot in https://github.com/ueberdosis/tiptap/pull/2343
* change reactrenderer component type definition by @lukesmurray in https://github.com/ueberdosis/tiptap/pull/2327
* Export type FontFamilyOptions by @apaar97 in https://github.com/ueberdosis/tiptap/pull/2345
* Update vue3.md Grammar Error In Docs by @Aiyush-G in https://github.com/ueberdosis/tiptap/pull/2349
* Fix typo in contributing.md by @webri in https://github.com/ueberdosis/tiptap/pull/2352
* Vue3 CLI doesn't have "npm run dev" by @Aiyush-G in https://github.com/ueberdosis/tiptap/pull/2350
* fix: export type `Level` for external use by @webri in https://github.com/ueberdosis/tiptap/pull/2354
* add way to cancel inputrules and pasterules by @philippkuehn in https://github.com/ueberdosis/tiptap/pull/2368
* Mark `@tiptap/react` and `@tiptap/core` as side effect free by @dcastil in https://github.com/ueberdosis/tiptap/pull/2361
* Nuxt specific corrections by @gsqrt2 in https://github.com/ueberdosis/tiptap/pull/2410
* build(deps): bump nanoid from 3.1.30 to 3.2.0 by @dependabot in https://github.com/ueberdosis/tiptap/pull/2419
* build(deps): bump node-fetch from 2.6.6 to 2.6.7 by @dependabot in https://github.com/ueberdosis/tiptap/pull/2424
* fix: use toggleHeader from prosemirror-tables by @jpobley in https://github.com/ueberdosis/tiptap/pull/2412
* docs(nodes/image/react): remove v-if by @strdr4605 in https://github.com/ueberdosis/tiptap/pull/2461
* Fix: Typo in Focus Command Documentation of Editor by @AngadSethi in https://github.com/ueberdosis/tiptap/pull/2476
* expose hasAnchor to custom placeholder function by @YousefED in https://github.com/ueberdosis/tiptap/pull/2470
* Add key bindings for uppercase letters for bold, italic and underline by @mejo- in https://github.com/ueberdosis/tiptap/pull/2478
* Allow individual Typography rules to be disabled by @rfgamaral in https://github.com/ueberdosis/tiptap/pull/2449
* Docs/toc undo fix by @codemzy in https://github.com/ueberdosis/tiptap/pull/2484
* build(deps): bump nanoid from 3.1.30 to 3.2.0 in /demos by @dependabot in https://github.com/ueberdosis/tiptap/pull/2480
* chore: added visual studio code debugging launch options by @bdbch in https://github.com/ueberdosis/tiptap/pull/2695
* fix: don't override behaviour of Home / End in pc keymap by @scottsidwell in https://github.com/ueberdosis/tiptap/pull/2691
* fix: Mark the bubble/floating menu extensions as side effect free by @rfgamaral in https://github.com/ueberdosis/tiptap/pull/2677
* build(deps-dev): bump minimist from 1.2.5 to 1.2.6 by @dependabot in https://github.com/ueberdosis/tiptap/pull/2667
* build(deps): bump minimist from 1.2.5 to 1.2.6 in /demos by @dependabot in https://github.com/ueberdosis/tiptap/pull/2672
* fix: prevent suggestions from being active when editor is readonly by @scottsidwell in https://github.com/ueberdosis/tiptap/pull/2692
* fix: Allow tippyOptions.getReferenceClientRect in bubble menu to be overridden by @fleon in https://github.com/ueberdosis/tiptap/pull/2668
* fix: allow [] as a prefix for task items by @bdbch in https://github.com/ueberdosis/tiptap/pull/2698
* fix: improve Vue nodeViewProps typing by @DanSnow in https://github.com/ueberdosis/tiptap/pull/2681
* fix: remove extension-text-style from character-cout peer dependencies by @pradel in https://github.com/ueberdosis/tiptap/pull/2696
* fix(extension-link): prevent parsing `javascript:` pseudo-protocol by @phenax in https://github.com/ueberdosis/tiptap/pull/2646
* build(deps): bump actions/cache from 2.1.7 to 3.0.2 by @dependabot in https://github.com/ueberdosis/tiptap/pull/2701
* build(deps): bump actions/checkout from 2.4.0 to 3.0.0 by @dependabot in https://github.com/ueberdosis/tiptap/pull/2699
* build(deps): bump actions/upload-artifact from 2.3.1 to 3.0.0 by @dependabot in https://github.com/ueberdosis/tiptap/pull/2700
* build(deps): bump actions/setup-node from 2.5.1 to 3.1.1 by @dependabot in https://github.com/ueberdosis/tiptap/pull/2705
* Add support for React 18 by @dcastil in https://github.com/ueberdosis/tiptap/pull/2676
* fix broken GuideContent demos not rendering because of unexpected use… by @bdbch in https://github.com/ueberdosis/tiptap/pull/2709
* Docs: fix file names in PHP installation by @aguingand in https://github.com/ueberdosis/tiptap/pull/2644
* Add support for CSS Modules by @XAHTEP26 in https://github.com/ueberdosis/tiptap/pull/2723
* Use vitejs/plugin-react and include react dependencies by @svenadlung in https://github.com/ueberdosis/tiptap/pull/2732
* build(deps-dev): bump minimist from 1.2.5 to 1.2.6 by @dependabot in https://github.com/ueberdosis/tiptap/pull/2725
* build(deps): bump actions/checkout from 3.0.0 to 3.0.2 by @dependabot in https://github.com/ueberdosis/tiptap/pull/2727
* feat: Add `onBeforeStart` and `onBeforeUpdate` handlers to the render function by @rfgamaral in https://github.com/ueberdosis/tiptap/pull/2628
* feat: Add a generic type for suggestion items by @rfgamaral in https://github.com/ueberdosis/tiptap/pull/2610
* Reduce bundle size of @tiptap/extension-table package by @enriquecastl in https://github.com/ueberdosis/tiptap/pull/2622
* Update Suggestion package.json by @dphuang2 in https://github.com/ueberdosis/tiptap/pull/2739
* fix: Support inline nodes with content in @tiptap/suggestion by @thatsjonsense in https://github.com/ueberdosis/tiptap/pull/2648
* Allow class attribute through setLink() by @Ken-vdE in https://github.com/ueberdosis/tiptap/pull/2758
* update people by @patrickbaber in https://github.com/ueberdosis/tiptap/pull/2776
* fix: properly calculate setDragImage position by @dilizarov in https://github.com/ueberdosis/tiptap/pull/2768
* Ensure VueNodeViewRenderer will use Editor's Global Vue Instance by @ralphschindler in https://github.com/ueberdosis/tiptap/pull/2604
* refactor(global): remove yarn in favor for npm by @bdbch in https://github.com/ueberdosis/tiptap/pull/2775
* add support for CSP nonces in createStyleTag by @fekle in https://github.com/ueberdosis/tiptap/pull/2601
* add validate option to link extension by @bdbch in https://github.com/ueberdosis/tiptap/pull/2781
* Cypress tests for examples by @bdbch in https://github.com/ueberdosis/tiptap/pull/2777
* build(deps): bump actions/setup-node from 3.1.1 to 3.2.0 by @dependabot in https://github.com/ueberdosis/tiptap/pull/2793
* fix: extendMarkRange doesn't work when cursor is at end of mark, despite isActive() returning true for that mark by @JDinABox in https://github.com/ueberdosis/tiptap/pull/2717
* Expose "range" to textSerializer. Used in "getTextBetween" by @panta82 in https://github.com/ueberdosis/tiptap/pull/2684
* Export `getTextSerializersFromSchema` helper, and fix typo in its name by @sjdemartini in https://github.com/ueberdosis/tiptap/pull/2750
* fix: disable broken tests for experiements with further todo message by @bdbch in https://github.com/ueberdosis/tiptap/pull/2808
* Add `className` option and pass through to ReactRenderer by @anton-liubushkin in https://github.com/ueberdosis/tiptap/pull/2794
* Fix InputRule regex matcher ignoring non-text leaflets in textBefore by @bdbch in https://github.com/ueberdosis/tiptap/pull/2807
* Add option to allow task items to be checkable (uncontrolled) by @kaspnilsson in https://github.com/ueberdosis/tiptap/pull/2474
* feat: Required attributes by @thatsjonsense in https://github.com/ueberdosis/tiptap/pull/2640
* Update team by @montapro in https://github.com/ueberdosis/tiptap/pull/2791
* fix: Only trigger image input rule at the start or with a preceding space by @rfgamaral in https://github.com/ueberdosis/tiptap/pull/2830
* In Vue 2 VueRenderer, only Vue.extend() non-VueConstructor arguments by @ralphschindler in https://github.com/ueberdosis/tiptap/pull/2824
* fix(suggestion): :bug: make clientrect prop optional by @bdbch in https://github.com/ueberdosis/tiptap/pull/2813
* build(deps): bump actions/cache from 3.0.2 to 3.0.3 by @dependabot in https://github.com/ueberdosis/tiptap/pull/2851
* Fixed(vue-2): `Avoid mutating a prop directly` error message to reproduce by @HondryTravis in https://github.com/ueberdosis/tiptap/pull/2834
* Add support for custom protocols in extension-link by @shaunabanana in https://github.com/ueberdosis/tiptap/pull/2832
* fix(textStyle): Null-safe parseHTML getting no color/fontFamily from HTMLElement styles by @d8vjork in https://github.com/ueberdosis/tiptap/pull/2825
* build(deps): bump actions/upload-artifact from 3.0.0 to 3.1.0 by @dependabot in https://github.com/ueberdosis/tiptap/pull/2820
* Declare lowlight as a peerDependency in `@tiptap/extension-code-block-lowlight` by @enriquecastl in https://github.com/ueberdosis/tiptap/pull/2625
* add precommit hook for linting and automatic eslint fixes + update eslint packages by @bdbch in https://github.com/ueberdosis/tiptap/pull/2862
* Adding missing extensions to docs in https://tiptap.dev/api/extensions by @Lior539 in https://github.com/ueberdosis/tiptap/pull/2856
* docs(docs): add missing documentation for commands by @bdbch in https://github.com/ueberdosis/tiptap/pull/2861
* refactor: use index files for imports to simplify the export flow by @bdbch in https://github.com/ueberdosis/tiptap/pull/2870
* feat(extension/youtube): :sparkles: new youtube embed extension by @bdbch in https://github.com/ueberdosis/tiptap/pull/2814
* build(deps): bump actions/cache from 3.0.3 to 3.0.4 by @dependabot in https://github.com/ueberdosis/tiptap/pull/2877
* build(deps): bump actions/setup-node from 3.2.0 to 3.3.0 by @dependabot in https://github.com/ueberdosis/tiptap/pull/2878
* chore: migrate to new versions of prosemirror packages by @bdbch in https://github.com/ueberdosis/tiptap/pull/2854
* docs: improve docs for youtube extension by @svenadlung in https://github.com/ueberdosis/tiptap/pull/2902
* Allow setting `whiteSpace` style for `NodeViewWrapper` & `NodeViewContent` by @EvitanRelta in https://github.com/ueberdosis/tiptap/pull/2884
* refactor(maintainment): set dependency versions for prosemirror and y… by @bdbch in https://github.com/ueberdosis/tiptap/pull/2904
* feat: Allow multiple prefix characters to trigger a suggestion by @rfgamaral in https://github.com/ueberdosis/tiptap/pull/2896
* fix: editor don't has contentComponent attribute when suggestion onUp… by @Young6118 in https://github.com/ueberdosis/tiptap/pull/2916
* Fix state update after component unmounted by @SavKS in https://github.com/ueberdosis/tiptap/pull/2857
* docs: fix livewire attribute by @ccchapman in https://github.com/ueberdosis/tiptap/pull/2928
* build(deps): bump parse-url from 6.0.0 to 6.0.2 by @dependabot in https://github.com/ueberdosis/tiptap/pull/2961
* fix(core): only respect text of node before current position (#2937) by @svenadlung in https://github.com/ueberdosis/tiptap/pull/2941
* chore: lint only staged files by @ahhshm in https://github.com/ueberdosis/tiptap/pull/2957
* fix(core): dont use selection for setContent replacement by @bdbch in https://github.com/ueberdosis/tiptap/pull/2934
* refactor: remove duplicated function by @ahhshm in https://github.com/ueberdosis/tiptap/pull/2956
* docs(figure): pass an object to `nodeInputRule` by @ahhshm in https://github.com/ueberdosis/tiptap/pull/2954
* docs: update alpine installation by @patrickbaber in https://github.com/ueberdosis/tiptap/pull/3081
* docs(extensions): mention community extensions and discussion thread by @sereneinserenade in https://github.com/ueberdosis/tiptap/pull/2991
* build(deps-dev): bump svelte from 3.48.0 to 3.49.0 in /demos by @dependabot in https://github.com/ueberdosis/tiptap/pull/2992
* build(deps-dev): bump svelte from 3.48.0 to 3.49.0 by @dependabot in https://github.com/ueberdosis/tiptap/pull/2993
* fix(core): isNodeSelection, isTextSelection not always false by @kivikakk in https://github.com/ueberdosis/tiptap/pull/3089
* build(deps): bump actions/setup-node from 3.3.0 to 3.4.1 by @dependabot in https://github.com/ueberdosis/tiptap/pull/2998
* build(deps): bump terser from 5.14.1 to 5.14.2 by @dependabot in https://github.com/ueberdosis/tiptap/pull/3009
* build(deps): bump actions/cache from 3.0.4 to 3.0.7 by @dependabot in https://github.com/ueberdosis/tiptap/pull/3087
* Fix pasteRulesPlugin always adding one extra character to text range by @Billiam in https://github.com/ueberdosis/tiptap/pull/2968
* fix: let StarterKit be imported as common js module via named import by @sipec in https://github.com/ueberdosis/tiptap/pull/2967
* fix(core): createCan command props shouldn't try dispatch (#3025) by @kivikakk in https://github.com/ueberdosis/tiptap/pull/3026
* build(deps): bump actions/cache from 3.0.7 to 3.0.8 by @dependabot in https://github.com/ueberdosis/tiptap/pull/3112
* fix(core): setNodeSelection should not clamp pos by Selection.atStart/atEnd by @kivikakk in https://github.com/ueberdosis/tiptap/pull/3091
* Make Suggestion extension use view.dom instead of document by @Faleij in https://github.com/ueberdosis/tiptap/pull/3093
* fix(core): make setEditable trigger onUpdate function by @bdbch in https://github.com/ueberdosis/tiptap/pull/2935
* fix: fix React Node View render problem in React 18 by @Darmody in https://github.com/ueberdosis/tiptap/pull/2985
* feature(core): add exit handling for marks by @bdbch in https://github.com/ueberdosis/tiptap/pull/2925
* build(deps-dev): bump vite from 2.9.12 to 2.9.13 in /demos by @dependabot in https://github.com/ueberdosis/tiptap/pull/3141
* build(deps-dev): bump vite from 2.9.12 to 2.9.13 by @dependabot in https://github.com/ueberdosis/tiptap/pull/3145
* fix: vue inject grammar warning by @zhxqc in https://github.com/ueberdosis/tiptap/pull/3144
* fix(core): make setEditable trigger all 'update' listeners by @Rhys-T in https://github.com/ueberdosis/tiptap/pull/3140
* fix: Typo by @NagariaHussain in https://github.com/ueberdosis/tiptap/pull/3132
* docs: fix naming by @masl in https://github.com/ueberdosis/tiptap/pull/3151
* Include bubble menu element when checking if the editor view still has focus by @StefKors in https://github.com/ueberdosis/tiptap/pull/3150
* Fix typo in docs by @carlobeltrame in https://github.com/ueberdosis/tiptap/pull/3162
* fix(extension-code-block-lowlight): Bump lowlight to 2.7.0, remove outdated @types by @tarngerine in https://github.com/ueberdosis/tiptap/pull/3002
* fix(core): insert PasteRule Node at matched position (#2942) by @edlb in https://github.com/ueberdosis/tiptap/pull/2943
* add-empty-editor-class-to-root-div by @BrianHung in https://github.com/ueberdosis/tiptap/pull/2665
* build(deps): bump parse-path from 4.0.4 to 5.0.0 by @dependabot in https://github.com/ueberdosis/tiptap/pull/3178
* fix: move React `flushSync` to microtask by @sampi in https://github.com/ueberdosis/tiptap/pull/3188
* Fix bubble menu and floating menu being available when editor is not editable by @bdbch in https://github.com/ueberdosis/tiptap/pull/3195
* feat: Add alias condition to code-block-lowlight by @dngwoodo in https://github.com/ueberdosis/tiptap/pull/3155
* feat(extension-typography): add servicemark input rule by @svenadlung in https://github.com/ueberdosis/tiptap/pull/3220
* fix(types): fix link and table type errors by @johnfraney in https://github.com/ueberdosis/tiptap/pull/3208
* test: fix failing test by @svenadlung in https://github.com/ueberdosis/tiptap/pull/3230
* feat(extension-link): Change autolink to only apply after breaking a word by @C-Hess in https://github.com/ueberdosis/tiptap/pull/3232
* chore(maintainment): :rocket: update prosemirror packages by @bdbch in https://github.com/ueberdosis/tiptap/pull/3237
* fix(core): Can() does not work for setting marks by @C-Hess in https://github.com/ueberdosis/tiptap/pull/3223
* Ensure text blocks exist before referencing them by @ScopeyNZ in https://github.com/ueberdosis/tiptap/pull/3251
* fix(core): InputRules does not work for ranges containing multiple text nodes by @hamflx in https://github.com/ueberdosis/tiptap/pull/3205
* fix(core) - support attributes being null/undefined  by @albertogiunta in https://github.com/ueberdosis/tiptap/pull/3245
* fix: set default allowedPrefixes null by @Matrixbirds in https://github.com/ueberdosis/tiptap/pull/3239
* fix(extension/link): fix last word value being undefined by @bdbch in https://github.com/ueberdosis/tiptap/pull/3258
* build(deps): bump d3-color from 3.0.1 to 3.1.0 in /demos by @dependabot in https://github.com/ueberdosis/tiptap/pull/3260
* docs: link YouTube node docs to proper GitHub url by @nielslanting in https://github.com/ueberdosis/tiptap/pull/3283
* fix: typo in docs by @danielyuenhx in https://github.com/ueberdosis/tiptap/pull/3265
* Fixed dragged text not being deleted after drop on another editor by @LuchoCateura in https://github.com/ueberdosis/tiptap/pull/3279
* Fixed using both color and highlight together  by @nkonev in https://github.com/ueberdosis/tiptap/pull/3311
* Cleanup linkifyjs when the editor is destroyed by @educastellano in https://github.com/ueberdosis/tiptap/pull/3316
* Feature/youtube parameters by @LuchoCateura in https://github.com/ueberdosis/tiptap/pull/3307
* Fix installation and examples link by @catalinmiron in https://github.com/ueberdosis/tiptap/pull/3298
* fix(docs): typo by @Calvein in https://github.com/ueberdosis/tiptap/pull/3362
* fix(extension/placeholder): Resolve placeholder performance issues by @C-Hess in https://github.com/ueberdosis/tiptap/pull/3361
* build(deps): bump parse-url from 7.0.2 to 8.1.0 by @dependabot in https://github.com/ueberdosis/tiptap/pull/3384
* refactor(extension/bubble-menu): add debounce to bubble menu updates by @bdbch in https://github.com/ueberdosis/tiptap/pull/3385
* build(deps): bump actions/setup-node from 3.4.1 to 3.5.1 by @dependabot in https://github.com/ueberdosis/tiptap/pull/3318
* docs: Fix typos in CHANGELOG.md by @rvrvrv in https://github.com/ueberdosis/tiptap/pull/3328
* build(deps): bump actions/cache from 3.0.8 to 3.0.11 by @dependabot in https://github.com/ueberdosis/tiptap/pull/3317
* fix: remove blur event listener from tippy element (#3365) by @MihirGH in https://github.com/ueberdosis/tiptap/pull/3366
* fixes typo in  suggestion.ts by @alejandrogarciasalas in https://github.com/ueberdosis/tiptap/pull/3386
* docs(svelte): fix link to get started with svelte by @taismassaro in https://github.com/ueberdosis/tiptap/pull/3396
* build(deps): bump loader-utils from 2.0.2 to 2.0.3 by @dependabot in https://github.com/ueberdosis/tiptap/pull/3395
* Update jobs.md by @montapro in https://github.com/ueberdosis/tiptap/pull/3432
* extension/table: Fix prosemirror-tables dependency not using a correct namespace by @bdbch in https://github.com/ueberdosis/tiptap/pull/3448
* typo: custom-extensions.md completely by @williamsk91 in https://github.com/ueberdosis/tiptap/pull/3447
* Fix #3435 - CommonJS and ESM loading confusion by @tomi-bigpi in https://github.com/ueberdosis/tiptap/pull/3436
* build(deps): bump loader-utils from 2.0.3 to 2.0.4 by @dependabot in https://github.com/ueberdosis/tiptap/pull/3426
* Fix cursor not following to new node when using a react node view by @ruipserra in https://github.com/ueberdosis/tiptap/pull/3331
* fix(core): implement deleteCurrentNode command & fix node joining on Delete key by @bdbch in https://github.com/ueberdosis/tiptap/pull/3192
* fix(link): allow to unset target attribute by @dargmuesli in https://github.com/ueberdosis/tiptap/pull/3425
* feat(commands): add joinUp and joinDown command & refactor join command code by @bdbch in https://github.com/ueberdosis/tiptap/pull/3455
* docs: rotate demo rooms by @patrickbaber in https://github.com/ueberdosis/tiptap/pull/3475
* Draft: Moves all prosemirror deps to peerDependencies & devDependencies by @janthurau in https://github.com/ueberdosis/tiptap/pull/3487
* fix(extension-bubble-menu): don't debounce without valid selection by @svenadlung in https://github.com/ueberdosis/tiptap/pull/3501
* refactor(extension-youtube): rename utility function name by @svenadlung in https://github.com/ueberdosis/tiptap/pull/3498
* Check if url is valid before creating YouTube player by @umgustavo in https://github.com/ueberdosis/tiptap/pull/3484
* Fix docs menus.md missing word by @kandros in https://github.com/ueberdosis/tiptap/pull/3457
* build(deps): bump minimatch from 3.0.4 to 3.1.2 in /demos by @dependabot in https://github.com/ueberdosis/tiptap/pull/3489
* Fix: custom text serializers should override text serializers defined in the schema by @tovaschreier in https://github.com/ueberdosis/tiptap/pull/3546
* Update sink-list-item.md by @vuau in https://github.com/ueberdosis/tiptap/pull/3629
* 🧹 Allow `editor.setEditable` to omit updates by @ZaymonFC in https://github.com/ueberdosis/tiptap/pull/3301
* Change Build Process to Lerna + tsup & prepare for prosemirror-meta package by @bdbch in https://github.com/ueberdosis/tiptap/pull/3555
* fix(typo): typescript.md by @N0N1m3 in https://github.com/ueberdosis/tiptap/pull/3657
* Update schema.md by @matrei in https://github.com/ueberdosis/tiptap/pull/3645
* New Feature: Prosemirror Meta Package by @bdbch in https://github.com/ueberdosis/tiptap/pull/3556
* Added CSS Required for Setup by @james-william-r in https://github.com/ueberdosis/tiptap/pull/3711
* Update installation guides by @svenadlung in https://github.com/ueberdosis/tiptap/pull/3698
* Make y-prosemirror a peer dependency (extension-collaboration) by @svenadlung in https://github.com/ueberdosis/tiptap/pull/3697
* Remove lodash types, replace pm deps (extension-bubble-menu) by @svenadlung in https://github.com/ueberdosis/tiptap/pull/3696
* Remove lodash dependencies in extension-floating-menu by @svenadlung in https://github.com/ueberdosis/tiptap/pull/3695
* build(deps): bump cypress-io/github-action from 4.2.0 to 5.0.8 by @dependabot in https://github.com/ueberdosis/tiptap/pull/3707
* build(deps): bump http-cache-semantics from 4.1.0 to 4.1.1 by @dependabot in https://github.com/ueberdosis/tiptap/pull/3687
* Move back from tsup/esbuild to rollup by @bdbch in https://github.com/ueberdosis/tiptap/pull/3720
* fix: Draggable nodes should respect drag handles by @matthewmullin01 in https://github.com/ueberdosis/tiptap/pull/3677
* build(deps): bump actions/cache from 3.0.11 to 3.2.5 by @dependabot in https://github.com/ueberdosis/tiptap/pull/3741
* build(deps): bump act10ns/slack from 1 to 2 by @dependabot in https://github.com/ueberdosis/tiptap/pull/3404
* build(deps): bump json5 from 1.0.1 to 1.0.2 by @dependabot in https://github.com/ueberdosis/tiptap/pull/3605
* build(deps): bump json5 from 2.2.1 to 2.2.3 in /demos by @dependabot in https://github.com/ueberdosis/tiptap/pull/3607
* build(deps): bump actions/checkout from 3.0.2 to 3.3.0 by @dependabot in https://github.com/ueberdosis/tiptap/pull/3609
* build(deps): bump actions/upload-artifact from 3.1.0 to 3.1.2 by @dependabot in https://github.com/ueberdosis/tiptap/pull/3610
* build(deps): bump actions/setup-node from 3.5.1 to 3.6.0 by @dependabot in https://github.com/ueberdosis/tiptap/pull/3613
* Update regex to exclude channel URL unfurling by @JustMaier in https://github.com/ueberdosis/tiptap/pull/3750
* Fix type for BubbleMenu prop pluginKey by @rumbcam in https://github.com/ueberdosis/tiptap/pull/3678
* Extend `nodePasteRule` `find` type to most generic `PasteRuleFinder` by @jiegillet in https://github.com/ueberdosis/tiptap/pull/3759
* fix(extension-link): Click handler opens selected link instead of clicked link by @jmtaber129 in https://github.com/ueberdosis/tiptap/pull/3732
* fix(typography): dont create fractions in the middle of a string by @bdbch in https://github.com/ueberdosis/tiptap/pull/3762
* Use Tailwind CDN direclty? by @RicoTrevisan in https://github.com/ueberdosis/tiptap/pull/3643
* fix: override schema text serializers if provided in getText options by @harrisonlo in https://github.com/ueberdosis/tiptap/pull/3672
* chore: add eslintcache by @Simon-He95 in https://github.com/ueberdosis/tiptap/pull/3525
* document removing or overriding link attributes by @epelc in https://github.com/ueberdosis/tiptap/pull/3576
* Add onFirstRender callback option by @Flamenco in https://github.com/ueberdosis/tiptap/pull/3600
* Add Plugin Key to placeholder component. by @tazirahmb in https://github.com/ueberdosis/tiptap/pull/3652
* Export `createNodeFromContent` and other missing helpers by @jacksleight in https://github.com/ueberdosis/tiptap/pull/3558
* fix: Queue flushSync call by @kylealwyn in https://github.com/ueberdosis/tiptap/pull/3533
* build(deps): bump cypress-io/github-action from 5.0.8 to 5.0.9 by @dependabot in https://github.com/ueberdosis/tiptap/pull/3766
* feat: #3540 Ability to preserve marks on lists by @gethari in https://github.com/ueberdosis/tiptap/pull/3541
* Move y-prosemirror to peer-deps by @svenadlung in https://github.com/ueberdosis/tiptap/pull/3763
* fix: #3773 - Array for content breaks editor by @gethari in https://github.com/ueberdosis/tiptap/pull/3786
* Docs Update for Installation instructions for PHP Livewire by @peterfox in https://github.com/ueberdosis/tiptap/pull/3618
* add optionalSlashSlash to protocol options by @taras-turchenko-moc in https://github.com/ueberdosis/tiptap/pull/3675
* fix(core): allow insertContentAt and insertContent text node arrays by @bdbch in https://github.com/ueberdosis/tiptap/pull/3790
* chore: allow new ReactComponentContent components to be created by @bdbch in https://github.com/ueberdosis/tiptap/pull/3782
* fix(react): reset initialized when editorcontent is unmounting by @bdbch in https://github.com/ueberdosis/tiptap/pull/3781
* docs: add extension cli note to contributing docs by @bdbch in https://github.com/ueberdosis/tiptap/pull/3793
* fix: update typings for node view decorations by @bdbch in https://github.com/ueberdosis/tiptap/pull/3783
* build(deps): bump actions/cache from 3.2.5 to 3.2.6 by @dependabot in https://github.com/ueberdosis/tiptap/pull/3795
* Fix destroyed view causing errors on dispatchTransaction by @bdbch in https://github.com/ueberdosis/tiptap/pull/3799
* Only allow left mouse button to open links by @thecodrr in https://github.com/ueberdosis/tiptap/pull/3777
* Optimize empty document detection in `documentClear` plugin by @thecodrr in https://github.com/ueberdosis/tiptap/pull/3778
* fix: use prose-base class for sm screens  by @cstrnt in https://github.com/ueberdosis/tiptap/pull/3810
* Adds attributes to toggleList by @katerlouis in https://github.com/ueberdosis/tiptap/pull/3776
* fix(tests): add assertion for each valid/invalid link by @bdbch in https://github.com/ueberdosis/tiptap/pull/3815
* feat(react): allow html attrs in react renderer by @bdbch in https://github.com/ueberdosis/tiptap/pull/3812
* fix(react): allow updating event handlers on editor by @bdbch in https://github.com/ueberdosis/tiptap/pull/3811
* Improve Cypress Test runner performance with parallelization by @bdbch in https://github.com/ueberdosis/tiptap/pull/3817
* build(deps): bump cypress-io/github-action from 5.0.9 to 5.2.0 by @dependabot in https://github.com/ueberdosis/tiptap/pull/3835
* fix: Ordered list start support broke in #3541 by @gethari in https://github.com/ueberdosis/tiptap/pull/3833
* Refactor typings (extension-youtube) by @svenadlung in https://github.com/ueberdosis/tiptap/pull/3842
* build(deps): bump actions/checkout from 3.3.0 to 3.4.0 by @dependabot in https://github.com/ueberdosis/tiptap/pull/3864
* build(deps): bump cypress-io/github-action from 5.2.0 to 5.5.0 by @dependabot in https://github.com/ueberdosis/tiptap/pull/3863
* build(deps-dev): bump webpack from 5.73.0 to 5.76.0 by @dependabot in https://github.com/ueberdosis/tiptap/pull/3855
* Docs: consistent naming of Tiptap by @svenadlung in https://github.com/ueberdosis/tiptap/pull/3882
* [PROPOSAL] dynamic default attributes by @mylesj in https://github.com/ueberdosis/tiptap/pull/3379
* style(core): fix linting issues by @bdbch in https://github.com/ueberdosis/tiptap/pull/3884
* Handle NodeViews in BubbleMenu positioning by @bdbch in https://github.com/ueberdosis/tiptap/pull/3881
* chore: add Dev demo folder by @bdbch in https://github.com/ueberdosis/tiptap/pull/3887
* CI: Remove slack notifications by @svenadlung in https://github.com/ueberdosis/tiptap/pull/3885
* Docs: Update nodes and extensions lists by @svenadlung in https://github.com/ueberdosis/tiptap/pull/3886
* Docs: Remove pro extension callout from collab docs by @svenadlung in https://github.com/ueberdosis/tiptap/pull/3883
* Fixing reoccurring issue #3331 and improving related PR #3533 by @KentoMoriwaki in https://github.com/ueberdosis/tiptap/pull/3862
* Release Candidate Preparation by @bdbch in https://github.com/ueberdosis/tiptap/pull/3890
* chore: add new release and prerelease actions by @bdbch in https://github.com/ueberdosis/tiptap/pull/3836
* Updates @hocuspocus/provider, moves demo to TiptapCollab by @janthurau in https://github.com/ueberdosis/tiptap/pull/3895
* Merge pull request #3895 from ueberdosis/feature/ttCollabProvider by @janthurau in https://github.com/ueberdosis/tiptap/pull/3897
* Collaboration: Fix history after late-registering plugins by @svenadlung in https://github.com/ueberdosis/tiptap/pull/3901
* ci: remove slack notifications by @svenadlung in https://github.com/ueberdosis/tiptap/pull/3898
* build(deps): bump actions/checkout from 3.4.0 to 3.5.0 by @dependabot in https://github.com/ueberdosis/tiptap/pull/3889
* build(deps): bump cypress-io/github-action from 5.5.0 to 5.5.1 by @dependabot in https://github.com/ueberdosis/tiptap/pull/3888
* build(deps): bump actions/cache from 3.2.6 to 3.3.1 by @dependabot in https://github.com/ueberdosis/tiptap/pull/3846
* docs: prepare for stable release by @svenadlung in https://github.com/ueberdosis/tiptap/pull/3892
* New Issue & Discussion Templates by @bdbch in https://github.com/ueberdosis/tiptap/pull/3907
* feat(core): add editor to this context in schema functions by @bdbch in https://github.com/ueberdosis/tiptap/pull/3909
