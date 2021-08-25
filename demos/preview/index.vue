<template>
  <ul v-if="$route.path === '/'">
    <li v-for="route in $router.options.routes" :key="route.path">
      <router-link :to="route.path">
        {{ route.path }}
      </router-link>
    </li>
  </ul>
  <router-view v-else />
</template>
