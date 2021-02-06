<template>
  <ul class="demos-page">
    <li v-for="(demo, index) in $context.demos" :key="index">
      <g-link :to="`/demos/${demo}`">
        {{ demo }}
      </g-link>
    </li>
  </ul>
</template>

<style lang="scss" src="./style.scss" scoped></style>
