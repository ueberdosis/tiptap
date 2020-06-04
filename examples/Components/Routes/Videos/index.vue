<template>
    <div class="editor">
        <editor-menu-bar :editor="editor" v-slot="{ commands }">
            <div class="menubar">
                <button class="menubar__button" @click="showVideoPrompt(commands.video)">
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
        `,
            }),
        }
    },
    methods: {
        showVideoPrompt(command) {
            const src = prompt('Enter the url of your video here')
            if (src !== null) {
                command({ src })
            }
        },
    },
}
</script>
