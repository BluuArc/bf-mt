<template>
  <div id="app">
    <router-view/>
    <navbar></navbar>
  </div>
</template>

<script>
import Navbar from '@/components/Navbar';

export default {
  name: 'App',
  components: {
    navbar: Navbar,
  },
};
</script>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  height: calc(100% - 42px);
}

.fixed.menu.bottom {
  top: auto;
  bottom: 0
}
</style>
