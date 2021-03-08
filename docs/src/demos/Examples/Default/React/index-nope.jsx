// export default () => {
//   const editor = useEditor({
//     content: '<p>hello react</p>',
//     onTransaction() {
//       // console.log('update', this)
//     },
//     extensions: [
//       ...defaultExtensions(),
//       // Paragraph.extend({
//       //   addNodeView() {
//       //     return reactNodeView(() => {
//       //       // useEffect(() => {
//       //       //   console.log('effect')
//       //       // }, []);

//       //       return (
//       //         <p className="jooo" data-node-view-wrapper>
//       //           <span data-node-view-content></span>
//       //         </p>
//       //       )
//       //     })
//       //     return ReactNodeViewRenderer(() => {
//       //       // useEffect(() => {
//       //       //   console.log('effect')
//       //       // }, []);

//       //       return (
//       //         <p className="jooo" data-node-view-wrapper>
//       //           <span data-node-view-content></span>
//       //         </p>
//       //       )
//       //     })
//       //   },
//       // }),
//     ]
//   })

//   return (
//     <>
//       { editor &&
//         <button
//           onClick={() => editor.chain().focus().toggleBold().run()}
//           className={editor.isActive('bold') ? 'is-active' : ''}
//         >
//           bold
//         </button>
//       }
//       <EditorContent editor={editor} />
//     </>
//   )
// }
