<template>
  <div class="ui fixed menu bottom">
    <div @click="resetHeader" class="ui secondary menu">
      <router-link class="item" to="/">Home</router-link>
      <router-link class="item" to="/news">News</router-link>
      <router-link class="item" to="/multidex">Multidex</router-link>
      <router-link class="item" to="/squad">Squad</router-link>
      <router-link class="item" to="/summoner">Summoner</router-link>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    resetHeader() {
      const defaultHeader = { content: 'Home', href: '/' };
      // eslint-disable-next-line
      console.log("emitting new header", defaultHeader);
      this.$emit('updateheader', defaultHeader);
    },
  },
};
</script>


<style>
.ui.secondary.menu {
  margin: 0 auto;
}
</style>
