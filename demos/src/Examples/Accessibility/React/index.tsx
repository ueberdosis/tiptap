import "./styles.scss";

import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React from "react";

import { TextMenu } from "./TextMenu";
import { MenuBar } from "./MenuBar.jsx";
import { InsertMenu } from "./InsertMenu";

export default () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Use Alt + F10 to focus the menu bar",
      }),
    ],
    immediatelyRender: false,
    editorProps: {
      attributes: (state): Record<string, string> => {
        return {
          // Make sure the editor is announced as a rich text editor
          "aria-label": "Rich Text Editor",
          // editor accepts multiline input
          "aria-multiline": "true",
          // dynamically set the aria-readonly attribute
          "aria-readonly": editor?.isEditable ? "false" : "true",
        };
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div role="application">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      <TextMenu editor={editor} />
      <InsertMenu editor={editor} />
    </div>
  );
};
