# Examples

## toc

## Introduction
Node views enable you to fully customize your nodes. We are collecting a few different examples here. Feel free to copy them and start building on them.

Keep in mind that those are just examples to get you started, not officially supported extensions. We don’t have tests for them, and don’t plan to maintain them with the same attention as we do with official extensions.

## Drag handles
Drag handles aren’t that easy to add. We are still on the lookout what’s the best way to add them. Official support will come at some point, but there’s no timeline yet.

<demo name="Guide/NodeViews/DragHandle" />

## Table of contents
This one loops through the editor content, gives all headings an ID and renders a Table of Contents with Vue.

<demo name="Guide/NodeViews/TableOfContents" />

## Drawing in the editor
The drawing example shows a SVG that enables you to draw inside the editor.

<demo name="Examples/Drawing" />

It’s not working very well with the Collaboration extension. It’s sending all data on every change, which can get pretty huge with Y.js. If you plan to use those two in combination, you need to improve it or your WebSocket backend will melt.
