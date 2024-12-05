# Change Log

## 2.5.1

### Patch Changes

- 7619215: The link extension's `validate` option now applies to both auto-linking and XSS mitigation. While, the new `shouldAutoLink` option is used to disable auto linking on an otherwise valid url.

## 2.5.0

### Minor Changes

- 6834a7f: Bundling of packages no longer includes tiptap dependency type definitions

## 2.4.2

### Patch Changes

- d6e56c4: declare lowlight to be a peer dep of extension-code-block-lowlight, update usage to v3

## 2.4.1

### Patch Changes

- 85d21ca: Updated demos and reverted vue specific performance enhancements until we know they work

  > in commit ff04353b3ee0e6fc63733a673e2b27d2272a3355 revert: "fix(vue-3): faster component rendering (#5206)"
  > This reverts commit 31f37464912b7b21f3a565ca63222b9f5b6cce00.

  and

  > in commit dbab8e42eac893a0237566fb30c14b4ed0f3674a revert: "fix(vue-3): fix editor.state updating too late during a transaction due to reactiveState fixes #4870 (#5252)"
  > This reverts commit 509676ed4a63b84b904a98c1e34d18449d25c2a7.

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.4.0](https://github.com/ueberdosis/tiptap/compare/v2.3.2...v2.4.0) (2024-05-14)

**Note:** Version bump only for package tiptap-demos

## [2.3.2](https://github.com/ueberdosis/tiptap/compare/v2.3.1...v2.3.2) (2024-05-08)

### Bug Fixes

- NodePos querySelectorAll function ([#5094](https://github.com/ueberdosis/tiptap/issues/5094)) ([4900a27](https://github.com/ueberdosis/tiptap/commit/4900a27c5389d9a2d0d69f407ca3db0155304315))

## [2.3.1](https://github.com/ueberdosis/tiptap/compare/v2.3.0...v2.3.1) (2024-04-30)

**Note:** Version bump only for package tiptap-demos

# [2.3.0](https://github.com/ueberdosis/tiptap/compare/v2.2.6...v2.3.0) (2024-04-09)

### Bug Fixes

- **core:** fix nodepos child lookup ([#5038](https://github.com/ueberdosis/tiptap/issues/5038)) ([22ced31](https://github.com/ueberdosis/tiptap/commit/22ced318723003365fbfd8f59b8dac79c7563017))

### Features

- **core:** apply input and paste rules when using insertContent methods ([#5046](https://github.com/ueberdosis/tiptap/issues/5046)) ([96b6abc](https://github.com/ueberdosis/tiptap/commit/96b6abcf6edbc6cac03a391130d9feebb6de3a04))

## [2.2.6](https://github.com/ueberdosis/tiptap/compare/v2.2.5...v2.2.6) (2024-04-06)

**Note:** Version bump only for package tiptap-demos

## [2.2.5](https://github.com/ueberdosis/tiptap/compare/v2.2.4...v2.2.5) (2024-04-05)

**Note:** Version bump only for package tiptap-demos

## [2.2.4](https://github.com/ueberdosis/tiptap/compare/v2.2.3...v2.2.4) (2024-02-23)

**Note:** Version bump only for package tiptap-demos

## [2.2.3](https://github.com/ueberdosis/tiptap/compare/v2.2.2...v2.2.3) (2024-02-15)

### Bug Fixes

- fix test path ([21aa96d](https://github.com/ueberdosis/tiptap/commit/21aa96dee8deab1f439b7f655b8ed266a516a4cd))

## [2.2.2](https://github.com/ueberdosis/tiptap/compare/v2.2.1...v2.2.2) (2024-02-07)

**Note:** Version bump only for package tiptap-demos

## [2.2.1](https://github.com/ueberdosis/tiptap/compare/v2.2.0...v2.2.1) (2024-01-31)

**Note:** Version bump only for package tiptap-demos

# [2.2.0](https://github.com/ueberdosis/tiptap/compare/v2.1.16...v2.2.0) (2024-01-29)

### Bug Fixes

- **core:** fix new lines being added via elementFromString ([#4767](https://github.com/ueberdosis/tiptap/issues/4767)) ([b7a2504](https://github.com/ueberdosis/tiptap/commit/b7a2504f16f46563537c890930cb2c332c256175))
- fix imports, fix demos, unpin y-prosemirror ([681aa57](https://github.com/ueberdosis/tiptap/commit/681aa577bff500015c3f925e300c55a71c73efaf))
- fix newline stripping via insertContent ([8954007](https://github.com/ueberdosis/tiptap/commit/8954007b2b92b040d69b26a0866ae58fabf5e512))

# [2.2.0-rc.8](https://github.com/ueberdosis/tiptap/compare/v2.1.14...v2.2.0-rc.8) (2024-01-08)

# [2.2.0-rc.7](https://github.com/ueberdosis/tiptap/compare/v2.2.0-rc.6...v2.2.0-rc.7) (2023-11-27)

# [2.2.0-rc.6](https://github.com/ueberdosis/tiptap/compare/v2.2.0-rc.5...v2.2.0-rc.6) (2023-11-23)

# [2.2.0-rc.4](https://github.com/ueberdosis/tiptap/compare/v2.1.11...v2.2.0-rc.4) (2023-10-10)

# [2.2.0-rc.3](https://github.com/ueberdosis/tiptap/compare/v2.2.0-rc.2...v2.2.0-rc.3) (2023-08-18)

# [2.2.0-rc.1](https://github.com/ueberdosis/tiptap/compare/v2.2.0-rc.0...v2.2.0-rc.1) (2023-08-18)

# [2.2.0-rc.0](https://github.com/ueberdosis/tiptap/compare/v2.1.5...v2.2.0-rc.0) (2023-08-18)

### Features

- **placeholder:** allow editor-is-empty class on any node ([#4335](https://github.com/ueberdosis/tiptap/issues/4335)) ([ff929b1](https://github.com/ueberdosis/tiptap/commit/ff929b179de930619005a773bb4186ae2aa2ec58))

## [2.1.16](https://github.com/ueberdosis/tiptap/compare/v2.1.15...v2.1.16) (2024-01-10)

### Bug Fixes

- **core:** fix new lines being added via elementFromString ([#4767](https://github.com/ueberdosis/tiptap/issues/4767)) ([2235908](https://github.com/ueberdosis/tiptap/commit/2235908c28f388eda041d1d5d017554d513fe909))

## [2.1.15](https://github.com/ueberdosis/tiptap/compare/v2.1.14...v2.1.15) (2024-01-08)

### Bug Fixes

- **core:** fix insertContentAt keeping new lines in html content ([#4465](https://github.com/ueberdosis/tiptap/issues/4465)) ([135a12f](https://github.com/ueberdosis/tiptap/commit/135a12f7aa2df839a0b619704110a360b980c738))
- **link:** fix tests ([d495d92](https://github.com/ueberdosis/tiptap/commit/d495d92a1f7b1c51e09ac8f4934e15a2d1cf070d))

## [2.1.14](https://github.com/ueberdosis/tiptap/compare/v2.1.13...v2.1.14) (2024-01-08)

### Bug Fixes

- **typography:** require spaces after divisions to not break date formats ([#4696](https://github.com/ueberdosis/tiptap/issues/4696)) ([f6d7e00](https://github.com/ueberdosis/tiptap/commit/f6d7e00a746a67fa440a3fa0f5362295959873d2))

## [2.1.13](https://github.com/ueberdosis/tiptap/compare/v2.1.12...v2.1.13) (2023-11-30)

**Note:** Version bump only for package tiptap-demos

## [2.1.12](https://github.com/ueberdosis/tiptap/compare/v2.1.11...v2.1.12) (2023-10-11)

**Note:** Version bump only for package tiptap-demos

## [2.1.11](https://github.com/ueberdosis/tiptap/compare/v2.1.10...v2.1.11) (2023-09-20)

### Reverts

- Revert "v2.2.11" ([6aa755a](https://github.com/ueberdosis/tiptap/commit/6aa755a04b9955fc175c7ab33dee527d0d5deef0))

## [2.1.10](https://github.com/ueberdosis/tiptap/compare/v2.1.9...v2.1.10) (2023-09-15)

**Note:** Version bump only for package tiptap-demos

## [2.1.9](https://github.com/ueberdosis/tiptap/compare/v2.1.8...v2.1.9) (2023-09-14)

**Note:** Version bump only for package tiptap-demos

## [2.1.8](https://github.com/ueberdosis/tiptap-workspace/compare/v2.1.7...v2.1.8) (2023-09-04)

**Note:** Version bump only for package tiptap-demos

## [2.1.7](https://github.com/ueberdosis/tiptap-workspace/compare/v2.1.6...v2.1.7) (2023-09-04)

**Note:** Version bump only for package tiptap-demos

## [2.1.6](https://github.com/ueberdosis/tiptap/compare/v2.1.5...v2.1.6) (2023-08-18)

**Note:** Version bump only for package tiptap-demos

# [2.2.0-rc.2](https://github.com/ueberdosis/tiptap/compare/v2.1.6...v2.2.0-rc.2) (2023-08-18)

# [2.2.0-rc.1](https://github.com/ueberdosis/tiptap/compare/v2.2.0-rc.0...v2.2.0-rc.1) (2023-08-18)

# [2.2.0-rc.0](https://github.com/ueberdosis/tiptap/compare/v2.1.5...v2.2.0-rc.0) (2023-08-18)

### Features

- **placeholder:** allow editor-is-empty class on any node ([#4335](https://github.com/ueberdosis/tiptap/issues/4335)) ([ff929b1](https://github.com/ueberdosis/tiptap/commit/ff929b179de930619005a773bb4186ae2aa2ec58))

# [2.2.0-rc.1](https://github.com/ueberdosis/tiptap/compare/v2.2.0-rc.0...v2.2.0-rc.1) (2023-08-18)

**Note:** Version bump only for package tiptap-demos

# [2.2.0-rc.0](https://github.com/ueberdosis/tiptap/compare/v2.1.5...v2.2.0-rc.0) (2023-08-18)

### Features

- **placeholder:** allow editor-is-empty class on any node ([#4335](https://github.com/ueberdosis/tiptap/issues/4335)) ([ff929b1](https://github.com/ueberdosis/tiptap/commit/ff929b179de930619005a773bb4186ae2aa2ec58))

## [2.1.6](https://github.com/ueberdosis/tiptap/compare/v2.1.5...v2.1.6) (2023-08-18)

**Note:** Version bump only for package tiptap-demos

## [2.1.5](https://github.com/ueberdosis/tiptap/compare/v2.1.4...v2.1.5) (2023-08-18)

**Note:** Version bump only for package tiptap-demos

## [2.1.4](https://github.com/ueberdosis/tiptap/compare/v2.1.3...v2.1.4) (2023-08-18)

**Note:** Version bump only for package tiptap-demos

## [2.1.3](https://github.com/ueberdosis/tiptap/compare/v2.1.2...v2.1.3) (2023-08-18)

**Note:** Version bump only for package tiptap-demos

## [2.1.2](https://github.com/ueberdosis/tiptap/compare/v2.1.1...v2.1.2) (2023-08-17)

### Bug Fixes

- **core:** fix error when merging class attributes ([#4340](https://github.com/ueberdosis/tiptap/issues/4340)) ([a251946](https://github.com/ueberdosis/tiptap/commit/a2519468589e2baa44901a66a3a06b24dc8626d6))

## [2.1.1](https://github.com/ueberdosis/tiptap/compare/v2.1.0...v2.1.1) (2023-08-16)

**Note:** Version bump only for package tiptap-demos

# [2.1.0](https://github.com/ueberdosis/tiptap-workspace/compare/v2.1.0-rc.14...v2.1.0) (2023-08-16)

**Note:** Version bump only for package tiptap-demos

# [2.1.0-rc.14](https://github.com/ueberdosis/tiptap-workspace/compare/v2.1.0-rc.13...v2.1.0-rc.14) (2023-08-11)

**Note:** Version bump only for package tiptap-demos

# [2.1.0-rc.13](https://github.com/ueberdosis/tiptap-workspace/compare/v2.0.4...v2.1.0-rc.13) (2023-08-11)

### Bug Fixes

- **demos:** add missing extensions ([6383fd5](https://github.com/ueberdosis/tiptap-workspace/commit/6383fd54080b2ad555286cd0e7c4ad880200200f))
- **demos:** update deps ([05a2edf](https://github.com/ueberdosis/tiptap-workspace/commit/05a2edfc16e297effa86d1583fb1680be0320f25))
- **strikethrough:** update strikethrough shortcut ([#4288](https://github.com/ueberdosis/tiptap-workspace/issues/4288)) ([fd35db4](https://github.com/ueberdosis/tiptap-workspace/commit/fd35db4d090d9fdfef1196fb1f6f858f13cf53d1))

# [2.1.0-rc.12](https://github.com/ueberdosis/tiptap-workspace/compare/v2.1.0-rc.11...v2.1.0-rc.12) (2023-07-14)

# [2.1.0-rc.11](https://github.com/ueberdosis/tiptap-workspace/compare/v2.1.0-rc.10...v2.1.0-rc.11) (2023-07-07)

### Bug Fixes

- **tests:** fix link rel tests ([c1d1854](https://github.com/ueberdosis/tiptap-workspace/commit/c1d18543b03b1fb6b99a2f3546aa5da10c919920))

# [2.1.0-rc.10](https://github.com/ueberdosis/tiptap-workspace/compare/v2.1.0-rc.9...v2.1.0-rc.10) (2023-07-07)

### Bug Fixes

- **react:** check props.clientRect before creating ReactRenderer ([#4138](https://github.com/ueberdosis/tiptap-workspace/issues/4138)) ([d710846](https://github.com/ueberdosis/tiptap-workspace/commit/d710846ecb6a3059dfbc21300b9a4b887a8defa3))

# [2.1.0-rc.9](https://github.com/ueberdosis/tiptap-workspace/compare/v2.1.0-rc.8...v2.1.0-rc.9) (2023-06-15)

# [2.1.0-rc.8](https://github.com/ueberdosis/tiptap-workspace/compare/v2.1.0-rc.7...v2.1.0-rc.8) (2023-05-25)

# [2.1.0-rc.5](https://github.com/ueberdosis/tiptap-workspace/compare/v2.1.0-rc.4...v2.1.0-rc.5) (2023-05-25)

### Features

- add tiptap class ([614fc80](https://github.com/ueberdosis/tiptap-workspace/commit/614fc8082c376bf3c40a05c23ceda6b4a6fbf8d0))

# [2.1.0-rc.4](https://github.com/ueberdosis/tiptap-workspace/compare/v2.1.0-rc.3...v2.1.0-rc.4) (2023-04-27)

# [2.1.0-rc.3](https://github.com/ueberdosis/tiptap-workspace/compare/v2.1.0-rc.2...v2.1.0-rc.3) (2023-04-26)

# [2.1.0-rc.2](https://github.com/ueberdosis/tiptap-workspace/compare/v2.0.3...v2.1.0-rc.2) (2023-04-26)

### Bug Fixes

- **extension-link:** fix link not being kept when pasting url with link ([#3975](https://github.com/ueberdosis/tiptap-workspace/issues/3975)) ([e7d7d49](https://github.com/ueberdosis/tiptap-workspace/commit/e7d7d496376c8c11e24c342e20bd179a6ea7dcee))

# [2.1.0-rc.1](https://github.com/ueberdosis/tiptap-workspace/compare/v2.1.0-rc.0...v2.1.0-rc.1) (2023-04-12)

### Bug Fixes

- **bubble-menu:** fix debounce not working with collab/collaboration cursor ([#3956](https://github.com/ueberdosis/tiptap-workspace/issues/3956)) ([e8cef04](https://github.com/ueberdosis/tiptap-workspace/commit/e8cef0404b5039ec2657536976b8b31931afd337))

# [2.1.0-rc.0](https://github.com/ueberdosis/tiptap-workspace/compare/v2.0.2...v2.1.0-rc.0) (2023-04-05)

### Bug Fixes

- clear nodes when cursor at start of empty isolating parent ([#3943](https://github.com/ueberdosis/tiptap-workspace/issues/3943)) ([7278ee2](https://github.com/ueberdosis/tiptap-workspace/commit/7278ee2b05de2f96efddf3b1dc3bfd3d52262cbb))
- Update peerDependencies to fix lerna version tasks ([#3914](https://github.com/ueberdosis/tiptap-workspace/issues/3914)) ([0c1bba3](https://github.com/ueberdosis/tiptap-workspace/commit/0c1bba3137b535776bcef95ff3c55e13f5a2db46))

# [2.1.0-rc.12](https://github.com/ueberdosis/tiptap-workspace/compare/v2.1.0-rc.11...v2.1.0-rc.12) (2023-07-14)

**Note:** Version bump only for package tiptap-demos

# [2.1.0-rc.11](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.10...v2.1.0-rc.11) (2023-07-07)

### Bug Fixes

- **tests:** fix link rel tests ([c1d1854](https://github.com/ueberdosis/tiptap/commit/c1d18543b03b1fb6b99a2f3546aa5da10c919920))

# [2.1.0-rc.10](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.9...v2.1.0-rc.10) (2023-07-07)

### Bug Fixes

- **react:** check props.clientRect before creating ReactRenderer ([#4138](https://github.com/ueberdosis/tiptap/issues/4138)) ([d710846](https://github.com/ueberdosis/tiptap/commit/d710846ecb6a3059dfbc21300b9a4b887a8defa3))

# [2.1.0-rc.9](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.8...v2.1.0-rc.9) (2023-06-15)

**Note:** Version bump only for package tiptap-demos

# [2.1.0-rc.8](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.7...v2.1.0-rc.8) (2023-05-25)

**Note:** Version bump only for package tiptap-demos

# [2.1.0-rc.7](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.6...v2.1.0-rc.7) (2023-05-25)

**Note:** Version bump only for package tiptap-demos

# [2.1.0-rc.6](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.5...v2.1.0-rc.6) (2023-05-25)

**Note:** Version bump only for package tiptap-demos

# [2.1.0-rc.5](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.4...v2.1.0-rc.5) (2023-05-25)

### Features

- add tiptap class ([614fc80](https://github.com/ueberdosis/tiptap/commit/614fc8082c376bf3c40a05c23ceda6b4a6fbf8d0))

# [2.1.0-rc.4](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.3...v2.1.0-rc.4) (2023-04-27)

**Note:** Version bump only for package tiptap-demos

# [2.1.0-rc.3](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.2...v2.1.0-rc.3) (2023-04-26)

**Note:** Version bump only for package tiptap-demos

# [2.1.0-rc.2](https://github.com/ueberdosis/tiptap/compare/v2.0.3...v2.1.0-rc.2) (2023-04-26)

### Bug Fixes

- **extension-link:** fix link not being kept when pasting url with link ([#3975](https://github.com/ueberdosis/tiptap/issues/3975)) ([e7d7d49](https://github.com/ueberdosis/tiptap/commit/e7d7d496376c8c11e24c342e20bd179a6ea7dcee))

# [2.1.0-rc.1](https://github.com/ueberdosis/tiptap/compare/v2.1.0-rc.0...v2.1.0-rc.1) (2023-04-12)

### Bug Fixes

- **bubble-menu:** fix debounce not working with collab/collaboration cursor ([#3956](https://github.com/ueberdosis/tiptap/issues/3956)) ([e8cef04](https://github.com/ueberdosis/tiptap/commit/e8cef0404b5039ec2657536976b8b31931afd337))

# [2.1.0-rc.0](https://github.com/ueberdosis/tiptap/compare/v2.0.2...v2.1.0-rc.0) (2023-04-05)

### Bug Fixes

- clear nodes when cursor at start of empty isolating parent ([#3943](https://github.com/ueberdosis/tiptap/issues/3943)) ([7278ee2](https://github.com/ueberdosis/tiptap/commit/7278ee2b05de2f96efddf3b1dc3bfd3d52262cbb))
- Update peerDependencies to fix lerna version tasks ([#3914](https://github.com/ueberdosis/tiptap/issues/3914)) ([0c1bba3](https://github.com/ueberdosis/tiptap/commit/0c1bba3137b535776bcef95ff3c55e13f5a2db46))

# [2.1.0-rc.0](https://github.com/ueberdosis/tiptap/compare/v2.0.2...v2.1.0-rc.0) (2023-04-05)

### Bug Fixes

- clear nodes when cursor at start of empty isolating parent ([#3943](https://github.com/ueberdosis/tiptap/issues/3943)) ([7278ee2](https://github.com/ueberdosis/tiptap/commit/7278ee2b05de2f96efddf3b1dc3bfd3d52262cbb))
- **bubble-menu:** fix debounce not working with collab/collaboration cursor ([#3956](https://github.com/ueberdosis/tiptap/issues/3956)) ([a78f8cd](https://github.com/ueberdosis/tiptap/commit/a78f8cd9646008e4db938fa3c22b0714c8bb5849))

## [2.0.3](https://github.com/ueberdosis/tiptap/compare/v2.0.2...v2.0.3) (2023-04-13)

### Bug Fixes

- **bubble-menu:** fix debounce not working with collab/collaboration cursor ([#3956](https://github.com/ueberdosis/tiptap/issues/3956)) ([e8cef04](https://github.com/ueberdosis/tiptap/commit/e8cef0404b5039ec2657536976b8b31931afd337))

## [2.0.2](https://github.com/ueberdosis/tiptap/compare/v2.0.1...v2.0.2) (2023-04-03)

### Features

- add box-shadow to collab demo ([c5496c1](https://github.com/ueberdosis/tiptap/commit/c5496c1b27783150dafb5ebdf6bda43648a46316))
- landingpage demo ([#3925](https://github.com/ueberdosis/tiptap/issues/3925)) ([958925f](https://github.com/ueberdosis/tiptap/commit/958925f2560ca786cd0cf52b83b7ae51deb7dd77))
- Tiptap collab demo styling ([87840b0](https://github.com/ueberdosis/tiptap/commit/87840b0f0821ca65d9f104d9c90512021aa70113))

## [2.0.1](https://github.com/ueberdosis/tiptap/compare/v2.0.0...v2.0.1) (2023-03-30)

### Bug Fixes

- Update peerDependencies to fix lerna version tasks ([#3914](https://github.com/ueberdosis/tiptap/issues/3914)) ([0534f76](https://github.com/ueberdosis/tiptap/commit/0534f76401bf5399c01ca7f39d87f7221d91b4f7))

# [2.0.0-beta.220](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.219...v2.0.0-beta.220) (2023-02-28)

### Bug Fixes

- **core:** fix destroyed view causing errors on dispatchTransaction ([#3799](https://github.com/ueberdosis/tiptap/issues/3799)) ([3c07ca0](https://github.com/ueberdosis/tiptap/commit/3c07ca0b9c48cef60d56acdd44812e20e05fc928))
- **tests:** fix tests for lists ([02eec8a](https://github.com/ueberdosis/tiptap/commit/02eec8aaefc2709dc20f91c3c8f9eca84cddc12d))

# [2.0.0-beta.219](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.218...v2.0.0-beta.219) (2023-02-27)

### Bug Fixes

- **core:** allow insertContentAt and insertContent text node arrays ([#3790](https://github.com/ueberdosis/tiptap/issues/3790)) ([0300630](https://github.com/ueberdosis/tiptap/commit/0300630a5b04b61d4eef8155f24ca0ef2d683966))

### Features

- [#3540](https://github.com/ueberdosis/tiptap/issues/3540) Ability to preserve marks on lists ([#3541](https://github.com/ueberdosis/tiptap/issues/3541)) ([36bb1e1](https://github.com/ueberdosis/tiptap/commit/36bb1e1041f91da6437272e7196702df868eae0f))

# [2.0.0-beta.218](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.217...v2.0.0-beta.218) (2023-02-18)

**Note:** Version bump only for package tiptap-demos

# [2.0.0-beta.217](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.216...v2.0.0-beta.217) (2023-02-09)

**Note:** Version bump only for package tiptap-demos

# [2.0.0-beta.216](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.215...v2.0.0-beta.216) (2023-02-08)

**Note:** Version bump only for package tiptap-demos

# [2.0.0-beta.215](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.214...v2.0.0-beta.215) (2023-02-08)

**Note:** Version bump only for package tiptap-demos

# [2.0.0-beta.214](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.213...v2.0.0-beta.214) (2023-02-08)

**Note:** Version bump only for package tiptap-demos

# [2.0.0-beta.213](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.212...v2.0.0-beta.213) (2023-02-07)

**Note:** Version bump only for package tiptap-demos

# [2.0.0-beta.212](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.211...v2.0.0-beta.212) (2023-02-03)

**Note:** Version bump only for package tiptap-demos

# [2.0.0-beta.211](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.210...v2.0.0-beta.211) (2023-02-02)

**Note:** Version bump only for package tiptap-demos

# [2.0.0-beta.210](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.209...v2.0.0-beta.210) (2023-02-02)

### Features

- **pm:** new prosemirror package for dependency resolving ([f387ad3](https://github.com/ueberdosis/tiptap/commit/f387ad3dd4c2b30eaea33fb0ba0b42e0cd39263b))

# [2.0.0-beta.209](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.208...v2.0.0-beta.209) (2022-12-16)

**Note:** Version bump only for package tiptap-demos

# [2.0.0-beta.208](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.207...v2.0.0-beta.208) (2022-12-16)

**Note:** Version bump only for package tiptap-demos

# [2.0.0-beta.207](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.206...v2.0.0-beta.207) (2022-12-08)

**Note:** Version bump only for package tiptap-demos

# [2.0.0-beta.206](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.205...v2.0.0-beta.206) (2022-12-08)

**Note:** Version bump only for package tiptap-demos

# [2.0.0-beta.205](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.204...v2.0.0-beta.205) (2022-12-05)

**Note:** Version bump only for package tiptap-demos

# [2.0.0-beta.204](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.203...v2.0.0-beta.204) (2022-11-25)

### Bug Fixes

- **tests:** fix autolink validation test ([5150095](https://github.com/ueberdosis/tiptap/commit/5150095c6b510c080f4aa35f54d2387543f86da8))

# [2.0.0-beta.203](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.202...v2.0.0-beta.203) (2022-11-24)

### Bug Fixes

- **extension/table:** move dependency from @\_ueberdosis to [@tiptap](https://github.com/tiptap) ([#3448](https://github.com/ueberdosis/tiptap/issues/3448)) ([31c3a9a](https://github.com/ueberdosis/tiptap/commit/31c3a9aad9eb37f445eadcd27135611291178ca6))

# [2.0.0-beta.202](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.201...v2.0.0-beta.202) (2022-11-04)

**Note:** Version bump only for package tiptap-demos

# [2.0.0-beta.201](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.200...v2.0.0-beta.201) (2022-11-04)

**Note:** Version bump only for package tiptap-demos

# [2.0.0-beta.200](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.199...v2.0.0-beta.200) (2022-11-04)

**Note:** Version bump only for package tiptap-demos

# [2.0.0-beta.199](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.198...v2.0.0-beta.199) (2022-09-30)

**Note:** Version bump only for package tiptap-demos

# [2.0.0-beta.198](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.197...v2.0.0-beta.198) (2022-09-29)

**Note:** Version bump only for package tiptap-demos

# [2.0.0-beta.197](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.196...v2.0.0-beta.197) (2022-09-26)

### Bug Fixes

- **core:** Can() does not work for setting marks ([#3223](https://github.com/ueberdosis/tiptap/issues/3223)) ([17a41da](https://github.com/ueberdosis/tiptap/commit/17a41da5a7a14879cf490c81914084791c4c494c))

# [2.0.0-beta.196](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.195...v2.0.0-beta.196) (2022-09-20)

**Note:** Version bump only for package tiptap-demos

# [2.0.0-beta.195](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.194...v2.0.0-beta.195) (2022-09-14)

### Bug Fixes

- **extension/bubble-menu:** :bug: fix bubble menu and floating menu being available when editor not editable ([#3195](https://github.com/ueberdosis/tiptap/issues/3195)) ([fa96749](https://github.com/ueberdosis/tiptap/commit/fa96749ce22ec67125da491cfeeb38623b9f0d6e))

# [2.0.0-beta.194](https://github.com/ueberdosis/tiptap/compare/v2.0.0-beta.193...v2.0.0-beta.194) (2022-09-11)

**Note:** Version bump only for package tiptap-demos

# [2.0.0-beta.193](https://github.com/ueberdosis/tiptap/compare/v0.1.2...v2.0.0-beta.193) (2022-09-10)

### Bug Fixes

- bump documents ([43611ea](https://github.com/ueberdosis/tiptap/commit/43611ea2e70d3dc66ff907ba7ca377bf74814543))
- disable broken tests for experiements with further todo message ([b8ae9e2](https://github.com/ueberdosis/tiptap/commit/b8ae9e27622857093c6ca539901956da5cc291e5))
- don’t check for active node in wrapIn command, fix [#1059](https://github.com/ueberdosis/tiptap/issues/1059) ([170ec4b](https://github.com/ueberdosis/tiptap/commit/170ec4be5b3c8362890ca3100a223b505f788381))
- **extension/collaboration:** :ambulance: pin y-prosemirror version to 1.0.20 to fix broken functionality with vue ([5989f3b](https://github.com/ueberdosis/tiptap/commit/5989f3b780bb64b2884d81dcd41a95d98a0714b2))
- fix RangeError bug when selecting all text, fix [#2490](https://github.com/ueberdosis/tiptap/issues/2490) ([70422dd](https://github.com/ueberdosis/tiptap/commit/70422dd107ed1ecdd8dfe41a8a93297124d2f1e0))
- **maintainment:** fix cjs issues with prosemirror-tables ([eb92597](https://github.com/ueberdosis/tiptap/commit/eb925976038fbf59f6ba333ccc57ea84113da00e))
- remove some magic strings ([6c34dec](https://github.com/ueberdosis/tiptap/commit/6c34dec33ac39c9f037a0a72e4525f3fc6d422bf))
- **suggestion:** :bug: make clientrect prop optional as it can potentially be undefined ([#2813](https://github.com/ueberdosis/tiptap/issues/2813)) ([f019f70](https://github.com/ueberdosis/tiptap/commit/f019f70a19c34715e2d5c3921d348e11c7ac51a3)), closes [#2795](https://github.com/ueberdosis/tiptap/issues/2795)
- temp fix collaboration demo ([4528756](https://github.com/ueberdosis/tiptap/commit/45287563f3cfb389095a2794cb2001d65e56d633))

### Features

- Add extension storage ([#2069](https://github.com/ueberdosis/tiptap/issues/2069)) ([7ffabf2](https://github.com/ueberdosis/tiptap/commit/7ffabf251c408a652eec1931cc78a8bd43cccb67))
- add getText() and generateText() methods (fix [#1428](https://github.com/ueberdosis/tiptap/issues/1428)) ([#1875](https://github.com/ueberdosis/tiptap/issues/1875)) ([fe6a3e7](https://github.com/ueberdosis/tiptap/commit/fe6a3e7491f6a42123d3d8a92ab588f2a40d7799))
- add some improvements to `CharacterCount` extension ([#2256](https://github.com/ueberdosis/tiptap/issues/2256)), fix [#1049](https://github.com/ueberdosis/tiptap/issues/1049), fix [#1550](https://github.com/ueberdosis/tiptap/issues/1550), fix [#1839](https://github.com/ueberdosis/tiptap/issues/1839), fix [#2245](https://github.com/ueberdosis/tiptap/issues/2245) ([5daa870](https://github.com/ueberdosis/tiptap/commit/5daa870b0906f0387fe07041681bc6f5b3774617))
- Add support for autolink ([#2226](https://github.com/ueberdosis/tiptap/issues/2226)) ([3d68981](https://github.com/ueberdosis/tiptap/commit/3d68981b47d087fff40549d2143eb952fc9e0a50))
- **extension-link:** :sparkles: add validate option to link extension ([23e67ad](https://github.com/ueberdosis/tiptap/commit/23e67adfa730df7364bc31220d0ed0e8ea522593)), closes [#2779](https://github.com/ueberdosis/tiptap/issues/2779)
- **extension/youtube:** :sparkles: new youtube embed extension ([#2814](https://github.com/ueberdosis/tiptap/issues/2814)) ([1c0554b](https://github.com/ueberdosis/tiptap/commit/1c0554b7c06d80145274353e58d56608b097fbe4))
- Integrate input rules and paste rules into the core ([#1997](https://github.com/ueberdosis/tiptap/issues/1997)) ([723b955](https://github.com/ueberdosis/tiptap/commit/723b955cecc5c92c8aad897ce16c60fb62976571))
- parseHTML for attributes should return the value instead of an object now, fix [#1863](https://github.com/ueberdosis/tiptap/issues/1863) ([8a3b47a](https://github.com/ueberdosis/tiptap/commit/8a3b47a529d28b28b50d634c6ff69b8e5aad3080))
