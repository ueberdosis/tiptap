# CDN
:::warning
There’s [an issue with skypack](https://github.com/skypackjs/skypack-cdn/issues/159), which causes trouble every now and then. We can’t do much about that for now.
:::

For testing purposes or demos, use our [Skypack](https://www.skypack.dev/) CDN builds. Here are the few lines of code you need to get started:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body>
  <div class="element"></div>
  <script type="module">
    import { Editor } from 'https://cdn.skypack.dev/@tiptap/core?min'
    import StarterKit from 'https://cdn.skypack.dev/@tiptap/starter-kit?min'
    const editor = new Editor({
      element: document.querySelector('.element'),
      extensions: [
        StarterKit,
      ],
      content: '<p>Hello World!</p>',
    })
  </script>
</body>
</html>
```

You should now see Tiptap in your browser. Time to give yourself a pat on the back! :)
