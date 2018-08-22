<template>
	<div class="navigation">

		<div class="navigation__header">
			<h1 class="navigation__logo">
				tiptap
			</h1>
			<a href="https://github.com/heyscrumpy/tiptap" target="_blank">
				<icon class="navigation__icon" name="github" />
			</a>
		</div>

		<div class="navigation__links">
			<router-link class="navigation__link" to="/">
				Menu Bar
			</router-link>
			<router-link class="navigation__link" to="/menu-bubble">
				Menu Bubble
			</router-link>
			<router-link class="navigation__link" to="/links">
				Links
			</router-link>
			<router-link class="navigation__link" to="/hiding-menu-bar">
				Hiding Menu Bar
			</router-link>
			<router-link class="navigation__link" to="/todo-list">
				Todo List
			</router-link>
			<router-link class="navigation__link" to="/markdown-shortcuts">
				Markdown Shortcuts
			</router-link>
		</div>

	</div>
</template>

<script>
import Icon from 'Components/Icon'

export default {
	components: {
		Icon,
	},
}
</script>

<style lang="scss" src="./style.scss" scoped></style>