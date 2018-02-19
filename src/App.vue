<template>
  <div id="app">
    <header-bar :href="headerHref" :content="headerContent"></header-bar>
    <dynamic-router :fullUnitData='this.fullUnitData' v-on:updateheader="updateHeader">
    </dynamic-router>
    <navbar v-on:updateheader="updateHeader"></navbar>
  </div>
</template>

<script>
import Navbar from '@/components/Navbar';
import DynamicRouter from '@/components/DynamicRouter';
import HeaderBar from '@/components/HeaderBar';

/* global $ */

export default {
  name: 'App',
  components: {
    navbar: Navbar,
    'dynamic-router': DynamicRouter,
    'header-bar': HeaderBar,
  },
  data() {
    return {
      fullUnitData: undefined,
      headerHref: undefined,
      headerContent: undefined,
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
          .fail(() => reject({ error: 'Error getting data' }));
      });
    },
    async loadUnitData() {
      try {
        this.fullUnitData = await this.getData('http://127.0.0.1/bf-data/info-gl.json');
      } catch (err) {
        this.fullUnitData = err;
      }
    },
    updateHeader(newContent = {}) {
      // eslint-disable-next-line
      console.log("new header content", newContent);
      this.headerHref = newContent.href;
      this.headerContent = newContent.content;
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
  overflow: hidden;
}

.fixed.menu.bottom {
  top: auto;
  bottom: 0
}
</style>
