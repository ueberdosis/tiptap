import { Editor } from "@tiptap/core";
import React, { useRef } from "react";

import { NodeTypeDropdown } from "./NodeTypeDropdown.js";
import { useFocusMenubar } from "./useFocusMenubar.js";

/**
 * An accessible menu bar for the editor
 */
export const MenuBar = ({ editor }: { editor: Editor }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useFocusMenubar({
    ref: containerRef,
    editor,
    onKeydown: (event) => {
      // Handle focus on alt + f10
      if (event.altKey && event.key === "F10") {
        event.preventDefault();
        containerRef.current?.querySelector("button")?.focus();
        return;
      }
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="control-group" role="toolbar" aria-orientation="horizontal" ref={containerRef}>
      <div className="button-group">
        <NodeTypeDropdown editor={editor} />
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          tabIndex={-1}
          aria-label="Horizontal rule"
        >
          Horizontal rule
        </button>
        <button
          onClick={() => editor.chain().focus().setHardBreak().run()}
          tabIndex={-1}
          aria-label="Hard break"
        >
          Hard break
        </button>
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          tabIndex={-1}
          aria-label="Undo"
        >
          Undo
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          tabIndex={-1}
          aria-label="Redo"
        >
          Redo
        </button>
      </div>
    </div>
  );
};
