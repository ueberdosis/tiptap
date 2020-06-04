<template>
    <div class="editor">
        <editor-menu-bar :editor="editor" v-slot="{ commands }">
            <div class="menubar">
                <button class="menubar__button" @click="showImagePrompt(commands.video)">
                    <icon name="image" />
                </button>
            </div>
        </editor-menu-bar>

        <editor-content class="editor__content" :editor="editor" />
    </div>
</template>

<script>
import Icon from 'Components/Icon'
import { Editor, EditorContent, EditorMenuBar } from 'tiptap'
import {
    HardBreak,
    Heading,
    Video,
    Bold,
    Code,
    Italic,
} from 'tiptap-extensions'

export default {
    components: {
        Icon,
        EditorContent,
        EditorMenuBar,
    },
    data() {
        return {
            editor: new Editor({
                extensions: [
                    new HardBreak(),
                    new Heading({ levels: [1, 2, 3] }),
                    new Video(),
                    new Bold(),
                    new Code(),
                    new Italic(),
                ],
                content: `
          <h2>
            Videos
          </h2>
          <p>
            This is basic example of implementing videos. Try to drop new videos here. Reordering also works.
          </p>
          <video controls style="width: 100%;"><source src="https://sscmscontent.s3-us-west-2.amazonaws.com/videos/js+Else+If+Statements.mov"></video>
        `,
            }),
        }
    },
    methods: {
        showImagePrompt(command) {
            const src = prompt('Enter the url of your image here')
            if (src !== null) {
                command({ src })
            }
        },
    },
}
</script>
