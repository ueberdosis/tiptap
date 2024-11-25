<script setup>
import { ref } from 'vue'

// @ts-nocheck
const showDemoList = process.env.NODE_ENV === 'development'

const searchValue = ref('')

</script>

<template>
  <template v-if="$route.path === '/'">
    <input
      class="w-full p-3 my-3 focus:outline-none border-b"
      type="search"
      placeholder="Search for a demo..."
      autofocus
      v-model="searchValue"
    >
    <ul v-if="showDemoList || listing">
      <li
        class="p-5 border-b-2 border-black"
        v-for="route in $router.options.routes.filter(route => searchValue === ''? true : route.props.name.toLowerCase().includes(searchValue.toLowerCase()))"
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
    <div v-else>Nothing to see here :-)</div>
  </template>
  <router-view v-else />
</template>

<script>
export default {
  methods: {
    fromString(value) {
      if (value === null) {
        return true
      }

      if (value.match(/^\d*(\.\d+)?$/)) {
        return Number(value)
      }

      if (value === 'true') {
        return true
      }

      if (value === 'false') {
        return false
      }

      if (value === 'null') {
        return null
      }

      return value
    },
  },

  computed: {
    query() {
      return Object.fromEntries(Object
        .entries(this.$route.query)
        .map(([key, value]) => [key, this.fromString(value)]))
    },

    listing() {
      return this.query.listing || false
    },
  },
}
</script>
