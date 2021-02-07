# CDN
For testing purposes or demos, use our [Skypack](https://www.skypack.dev/) CDN builds. Here are the few lines of code you need to get started:

```html
<!doctype html>
<head>
  <meta charset="utf-8">
</head>
<body>
  <div class="element"></div>
  <script type="module">
    import { Editor } from 'https://cdn.skypack.dev/@tiptap/core?min'
    import { defaultExtensions } from 'https://cdn.skypack.dev/@tiptap/starter-kit?min'
    const editor = new Editor({
      element: document.querySelector('.element'),
      extensions: defaultExtensions(),
      content: '<p>Your content.</p>',
    })
  </script>
</body>
</html>
```
