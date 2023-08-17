# CDN

For testing purposes or demos, use our [esm.sh](https://esm.sh.dev/) CDN builds. Here are the few lines of code you need to get started:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body>
  <div class="element"></div>
  <script type="module">
    import { Editor } from 'https://esm.sh/@tiptap/core'
    import StarterKit from 'https://esm.sh/@tiptap/starter-kit'
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


---

You should now see Tiptap in your browser. Time to give yourself a pat on the back! :)

