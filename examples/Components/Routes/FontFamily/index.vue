<template>
	<div>
		<editor class="editor" :extensions="extensions" ref="editor">

			<div class="menubar" slot="menubar" slot-scope="{ marks }">
				<div v-if="marks">
                    <button
                        id="font-family-button"
						class="menubar__button"
						@click="toggleFontList()"
					>
						{{getActiveFonts(marks.fontFamily)}}
					</button>
                    <div class="suggestion-list" v-show="fontListToggled" ref="suggestions">
                        <div 
                            v-for="(font, index) in getFonts()"
                            :key="font+index"
                            class="suggestion-list__item"
                            :class="{ 'is-selected': isActiveFont(marks, font) }"
                            @click="setFont(marks, font)"
                        >
                            {{ font }}
                        </div>
                    </div>
				</div>
			</div>

			<div class="editor__content" slot="content" slot-scope="props">
				<h2>
					Hi there,
				</h2>
				<p>
					this is a very basic example of tiptap.
				</p>
				<p>
					Select text, and click "Font Family" to change the font.
				</p>
			</div>

		</editor>
	</div>
</template>

<script>
import Icon from 'Components/Icon'
import tippy from 'tippy.js'
import { Editor } from 'tiptap'
import {
	HardBreakNode,
	FontFamilyMark,
	ImageNode,
	BoldMark,
	CodeMark,
	ItalicMark,
} from 'tiptap-extensions'
export default {
	components: {
		Icon,
		Editor,
	},
	data() {
		return {
			extensions: [
				new HardBreakNode(),
				new FontFamilyMark({ fonts: this.getFonts()}),
				new ImageNode(),
				new BoldMark(),
				new CodeMark(),
				new ItalicMark(),
            ],
            fontListToggled: false,
		}
    },
	methods: {
        getFonts(){
            return ["Courier", "Times"];
        },
        getActiveFonts(fontFamily){
            const fonts = this.getFonts();
            for(var i = 0; i< fonts.length; i++){
                if(fontFamily.active() && fontFamily.attrs.font
                    && fontFamily.attrs.font === fonts[i]){
                    return fonts[i];
                }
            }
            return "Font Family"
        },
        isActiveFont(marks, font){
            var fontFamily = marks.fontFamily;
            return fontFamily.active() && fontFamily.attrs.font
                    && fontFamily.attrs.font === font;
        },
        setFont(marks, font){
            marks.fontFamily.command({ font: font, currentFont: marks.fontFamily.attrs.font });
            this.fontListToggled = false;
        },
        toggleFontList(){
            if(!this.fontListToggled){
                this.renderPopup()
                this.fontListToggled = true;
            }else{
                this.destroyPopup();
                this.fontListToggled = false;
            }
        },
        // renders a popup with suggestions
		// tiptap provides a virtualNode object for using popper.js (or tippy.js) for popups
		renderPopup() {
			if (this.popup) {
				return
			}

			this.popup = tippy('#font-family-button', {
				content: this.$refs.suggestions,
				trigger: 'click',
				interactive: true,
				theme: 'dark',
				placement: 'bottom-start',
				performance: true,
				inertia: true,
				duration: [400, 200],
				showOnInit: true,
				arrow: false,
				arrowType: 'round',
			})
		},

		destroyPopup() {
			if (this.popup) {
				this.popup.destroyAll()
				this.popup = null
			}
		},
	},
}
</script>
<style lang="scss">
@import "~variables";
@import '~modules/tippy.js/dist/tippy.css';

.mention {
  background: rgba($color-black, 0.1);
  color: rgba($color-black, 0.6);
  font-size: 0.8rem;
  font-weight: bold;
  border-radius: 5px;
  padding: 0.2rem 0.5rem;
	white-space: nowrap;
}

.mention-suggestion {
	color: rgba($color-black, 0.6);
}

.suggestion-list {
	padding: 0.2rem;
	border: 2px solid rgba($color-black, 0.1);
	font-size: 0.8rem;
	font-weight: bold;

	&__no-results {
		padding: 0.2rem 0.5rem;
	}

	&__item {
		border-radius: 5px;
		padding: 0.2rem 0.5rem;
		margin-bottom: 0.2rem;
		cursor: pointer;

		&:last-child {
			margin-bottom: 0;
		}

		&.is-selected,
		&:hover {
			background-color: rgba($color-white, 0.2);
		}

		&.is-empty {
			opacity: 0.5;
		}
	}
}

.tippy-tooltip.dark-theme {
	background-color: $color-black;
	padding: 0;
	font-size: 1rem;
	text-align: inherit;
	color: $color-white;
	border-radius: 5px;

	.tippy-backdrop {
		display: none;
	}

	.tippy-roundarrow {
		fill: $color-black;
	}

	.tippy-popper[x-placement^=top] & .tippy-arrow {
		border-top-color: $color-black;
	}

	.tippy-popper[x-placement^=bottom] & .tippy-arrow {
		border-bottom-color: $color-black;
	}

	.tippy-popper[x-placement^=left] & .tippy-arrow {
		border-left-color: $color-black;
	}

	.tippy-popper[x-placement^=right] & .tippy-arrow {
		border-right-color: $color-black;
	}
}
</style>