# CDN

It's also possible to run Tiptap directly on the browser by using CDNs like [esm.sh](https://esm.sh). 
(Unfortunately [Skypack](https://skypack.dev) has not been reliable in our testing).

## ESM.SH

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

