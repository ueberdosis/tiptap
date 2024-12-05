# Tiptap Editor
The Tiptap Editor is a headless, framework-agnostic rich text editor that's customizable and extendable through extensions. Its headless nature means it comes without a set user interface, offering full design freedom (for a jumpstart, see linked [UI templates](#examples-codesandbox-and-ui-templates) below). Tiptap is based on the highly reliable [ProseMirror](https://github.com/ProseMirror/prosemirror) library.

Tiptap Editor is complemented by the collaboration open-source backend [Hocuspocus](https://github.com/ueberdosis/hocuspocus). Both the Editor and Hocuspocus form the foundation of the [Tiptap Suite](https://tiptap.dev/).

[![Build Status](https://github.com/ueberdosis/tiptap/actions/workflows/build.yml/badge.svg)](https://github.com/ueberdosis/tiptap/actions/workflows/build.yml)
[![Version](https://img.shields.io/npm/v/@tiptap/core.svg?label=version)](https://www.npmjs.com/package/@tiptap/core)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/core.svg)](https://npmcharts.com/compare/@tiptap/core?minimal=true)
[![License](https://img.shields.io/npm/l/@tiptap/core.svg)](https://www.npmjs.com/package/@tiptap/core)
[![Chat](https://img.shields.io/badge/chat-on%20discord-7289da.svg?sanitize=true)](https://discord.gg/WtJ49jGshW)
[![Sponsor](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub)](https://github.com/sponsors/ueberdosis)

### How does the Tiptap Editor work?

- **Headless Framework:** Tiptap does not rely on a user interface. So there is no need for class overrides or code hacks. If you do need an example UI feel free to browse our [UI templates](#examples-codesandbox-and-ui-templates) linked below.
- **Framework-agnostic:** The Tiptap Editor is designed to work across different frontend frameworks. This means whether you're using Vue, React, or plain JavaScript, Tiptap integrates  without compatibility issues.
- **Extension based:** Extensions in Tiptap allow for a tailored editing experience, from simple text styling to advanced features like drag-and-drop block editing. You have the option to choose from over 100 extensions available in the [documentation](https://tiptap.dev/docs/editor/extensions) and [community](https://github.com/ueberdosis/awesome-tiptap/#community-extensions) to enhance your editor's functionality.
- **Customize your UX:** The editor was built to give you control to define your own [extensions](https://tiptap.dev/docs/editor/guide/custom-extensions) and [nodes](https://tiptap.dev/docs/editor/api/nodes).


### Editor Pro Extensions
The **Pro Extensions** are a set of advanced functionalities that enhance the capabilities of the Tiptap Editor. They are additional features that can be integrated into the base editor to provide more sophisticated editing options.

Key functionalities include collaborative editing, which allows multiple users to edit documents simultaneously, drag-and-drop file management for easier handling of documents and media, and unique node ID assignment. Review the docs right [here](https://tiptap.dev/docs/editor/extensions).

Pro Extensions are free with a [Tiptap account](https://cloud.tiptap.dev/pro-extensions). Once signed up, review the guide in your account.

### Make your editor collaborative
Interested in collaborative editing? Check out our open-source package [Hocuspocus](https://github.com/ueberdosis/hocuspocus) - a collaboration backend built around the CRDT power of [Yjs](https://github.com/yjs/yjs). Hocuspocus serves as the backbone for the [Tiptap Suite](https://tiptap.dev/).

## Documentation
For more detailed information, make sure to check out our [documentation](https://tiptap.dev/docs/editor/installation). If you encounter any problems or have suggestions for our system, please open an issue.

### Examples, CodeSandbox and UI Templates
Have a look at the [examples to see Tiptap in action](https://tiptap.dev/examples) or review and fork our codesandboxes.
- [Basic example of the Tiptap editor.](https://codesandbox.io/p/devbox/editor-9x9dkd?embed=1&file=%2Fsrc%2FApp.js)
- [Collaboration ready Tiptap CodeSandbox](https://codesandbox.io/p/devbox/collaboration-4stk94)
- React notion-like block editor template: [Demo](https://templates.tiptap.dev/)

## About Tiptap
Tiptap is a collection of developer components based on open-source technology, forming the basis of our advanced, paid features. It includes the open-source editor component, collaboration features, Content AI, and Tiptap Cloud. We are developing open-source products that also shape our paid features. We're committed to improving both, ensuring quality and reliability in every update.

For more details, visit the Tiptap [documentation](https://tiptap.dev/docs/editor/introduction) or [website](https://tiptap.dev/).

### Community
For help, discussion about best practices, or any other conversation that would benefit from being searchable:

[Discuss Tiptap on GitHub](https://github.com/ueberdosis/tiptap/discussions)

### Sponsors 💖
<table>
  <tr>
    <td align="center">
      <a href="https://www.complish.app/">
        <img src="https://uploads-ssl.webflow.com/5fa93d27380666789a1cbbd3/5fae50824b4d2d06f3d2898f_Frame%20374.png" width="25"><br>
        <strong>Complish</strong>
      </a>
    </td>
    <td align="center">
      <a href="https://www.storyblok.com/">
        <img src="https://unavatar.io/github/storyblok" width="25"><br>
        <strong>Storyblok</strong>
      </a>
    </td>
    <td align="center">
      <a href="https://posthog.com/">
        <img src="https://unavatar.io/github/posthog" width="25"><br>
        <strong>PostHog</strong>
      </a>
    </td>
    <td align="center" width="100">
      <a href="https://reflect.app/">
        <img src="https://unavatar.io/reflect.app" width="25"><br>
        <strong>Reflect</strong>
      </a>
    </td>
    <td align="center" width="100">
      <a href="https://ziffmedia.com/">
        <img src="https://unavatar.io/github/ziffmedia" width="25"><br>
        <strong>Ziff Media</strong>
      </a>
    </td>
    <td align="center" width="100">
      <a href="https://www.basewell.com/">
        <img src="https://unavatar.io/github/Basewell" width="25"><br>
        <strong>Basewell</strong>
      </a>
    </td>
    <td align="center" width="100">
      <a href="https://poggio.io">
        <img src="https://unavatar.io/github/poggiolabs" width="25"><br>
        <strong>Poggio</strong>
      </a>
    </td>
  </tr>
</table>

<table>

</table>

[iFixit](https://www.ifixit.com/), [ApostropheCMS](https://apostrophecms.com/), [Novadiscovery](http://www.novadiscovery.com/), [Omics Data Automation](https://www.omicsautomation.com), [Flow Mobile](https://www.flowmobile.app/), [DocIQ](https://www.dociq.io/) and [hundreds of awesome individuals](https://github.com/sponsors/ueberdosis).

### Contributing
Feel like adding some magic of your own to Tiptap Editor Core? We welcome contributions! Please see our [CONTRIBUTING](CONTRIBUTING.md) guidelines for how to get started.

### Contributors
[Sam Willis](https://github.com/samwillis),
[Brian Hung](https://github.com/BrianHung),
[Dirk Holtwick](https://github.com/holtwick),
[Sam Duvall](https://github.com/SamDuvall),
[Christoph Flathmann](https://github.com/Chrissi2812),
[Erick Wilder](https://github.com/erickwilder),
[Marius Tolzmann](https://github.com/mariux),
[jjangga0214](https://github.com/jjangga0214),
[Maya Nedeljkovich](https://github.com/mayacoda),
[Ryan Bliss](https://github.com/ryanbliss),
[Gregor](https://github.com/gambolputty) and [many more](../../contributors).

## License
The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
