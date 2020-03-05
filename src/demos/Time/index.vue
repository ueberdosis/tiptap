<template>
  <div>
    Time: {{ time }}
  </div>  
</template>

<script>
export default {
  data() {
    return {
      time: new Date()
    }
  },
}
</script>

<style src="./style.css" scoped />