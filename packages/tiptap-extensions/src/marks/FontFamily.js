import { Mark } from 'tiptap'
import { toggleMark,  updateMark} from 'tiptap-commands'

export default class FontFamilyMark extends Mark {

	get name() {
		return 'fontFamily'
	}

	get defaultOptions() {
		return {
			fonts: ["Times New Roman", "Courier"],
		}
	}

	get schema() {
		return {
			attrs: {
				font: {
					default: 'Times',
				},
			},
			parseDOM:[{
				
				style: 'font-family',
				getAttrs: value => {
					if(this.options.fonts.length == 0) return null;
					var foundIndex = this.options.fonts.findIndex(font => {
						return font == value;
					});
					if(foundIndex > -1) return value;
					return false;
				},
				
			}],
			toDOM: node => [`span`, {style:'font-family : '+node.attrs.font, 'data-font-family':node.attrs.font}, 0],
		}
	}

	command({ type, attrs}) {
		if(attrs.currentFont && attrs.currentFont != attrs.font){
			return updateMark(type, {font: attrs.font});
		}
		return toggleMark(type, {font: attrs.font});
	}

}