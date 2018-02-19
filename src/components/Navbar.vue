<template>
  <div class="ui fixed menu bottom" id="navbar">
    <div @click="resetHeader" class="ui small compact center aligned buttons">
      <router-link class="ui white button item" to="/">Home</router-link>
      <router-link class="ui white button item" to="/news">News</router-link>
      <router-link class="ui white button item" to="/multidex">Multidex</router-link>
      <router-link class="ui white button item" to="/squad">Squad</router-link>
      <router-link class="ui white button item" to="/summoner">Summoner</router-link>
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
#navbar .ui.small.compact.buttons {
  margin: 0 auto;
}

#navbar .ui.white.button.item:before {
  background: none;
}
</style>
