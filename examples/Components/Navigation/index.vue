<template>
	<div class="navigation">

		<div class="navigation__header">
			<h1 class="navigation__logo">
				tiptap
			</h1>
			<a href="https://github.com/heyscrumpy/tiptap">
				<icon class="navigation__icon" name="github" />
			</a>
		</div>

		<div class="navigation__links">
			<router-link class="navigation__link" to="/">
				Default
			</router-link>
			<router-link class="navigation__link" to="/bubble-menu">
				Bubble Menu
			</router-link>
			<router-link class="navigation__link" to="/links">
				Links
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