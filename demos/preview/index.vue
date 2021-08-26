<template>
  <ul v-if="$route.path === '/'">
    <li
      class="p-5 border-b-2 border-black"
      v-for="route in $router.options.routes"
      :key="route.path"
    >
      <router-link
        class="block mb-2 font-medium"
        :to="route.path"
      >
        {{ route.props.name }}
      </router-link>

      <div class="flex">
        <a
          class="mr-4 text-sm text-gray-300 font-medium"
          v-for="(tab, index) in route.props.tabs"
          :key="index"
          :href="`/src/${route.props.name}/${tab.name}/`"
        >
          {{ tab.name }}
        </a>
      </div>
    </li>
  </ul>
  <router-view v-else />
</template>
