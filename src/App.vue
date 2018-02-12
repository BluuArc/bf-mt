<template>
  <div id="app">
    <dynamic-router :fullUnitData='this.fullUnitData'></dynamic-router>
    <navbar></navbar>
  </div>
</template>

<script>
import Navbar from '@/components/Navbar';
import DynamicRouter from '@/components/DynamicRouter';

/* global $ */

export default {
  name: 'App',
  components: {
    navbar: Navbar,
    'dynamic-router': DynamicRouter,
  },
  data() {
    return {
      fullUnitData: undefined,
    };
  },
  mounted() {
    this.loadUnitData();
  },
  methods: {
    getData(url) {
      return new Promise((fulfill, reject) => {
        $.get(url)
          .done(data => fulfill(data))
          .fail(() => reject('Error getting data'));
      });
    },
    async loadUnitData() {
      this.fullUnitData = await this.getData('http://127.0.0.1/bf-data/info-gl.json');
    },
  },
};
</script>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  height: calc(100% - 42px);
  overflow: auto;
}

.fixed.menu.bottom {
  top: auto;
  bottom: 0
}
</style>
