<template>
  <div id="app">
    <header-bar :href="headerHref" :content="headerContent"></header-bar>
    <dynamic-router
      :fullUnitData="fullUnitData"
      :fullItemData="fullItemData"
      :fullExtraSkillData="fullExtraSkillData"
      :fullBurstData="fullBurstData"
      v-on:updateheader="updateHeader">
    </dynamic-router>
    <navbar v-on:updateheader="updateHeader"></navbar>
    <noscript>
      <div class="statcounter">
        <a title="shopify site analytics" target="_blank" href="http://statcounter.com/shopify/">
          <img class="statcounter" alt="shopify site analytics"
            src="//c.statcounter.com/11034084/0/3e7dba9f/1/">
        </a>
      </div>
    </noscript>
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
      fullItemData: undefined,
      fullExtraSkillData: undefined,
      fullBurstData: undefined,
      headerHref: undefined,
      headerContent: undefined,
    };
  },
  mounted() {
    this.loadTracker();
    this.loadAllData();
  },
  methods: {
    getData(url) {
      return new Promise((fulfill, reject) => {
        $.get(url)
          .done(data => fulfill(data))
          .fail(() => reject({ error: 'Error getting data' }));
      });
    },
    async loadAllData() {
      const defaultObject = { error: 'Not implemented yet' };
      await this.loadUnitData();

      this.fullItemData = defaultObject;
      this.fullExtraSkillData = defaultObject;
      this.fullBurstData = defaultObject;
    },
    async loadUnitData() {
      const debugMode = location.hostname === 'localhost';
      let url = (debugMode) ? 'http://127.0.0.1/bf-data/' : './bf-data/';
      url += 'info-gl.json';
      try {
        this.fullUnitData = await this.getData(url);
        if (debugMode) {
          // eslint-disable-next-line
          console.log(location.hostname, debugMode, url, this.fullUnitData);
        }
      } catch (err) {
        this.fullUnitData = err;
      }
    },
    updateHeader(newContent = {}) {
      this.headerHref = newContent.href;
      this.headerContent = newContent.content;
    },
    /* eslint-disable */
    loadTracker() {
      //globals for statcounter tracker
      window.sc_project = 11034084;
      window.sc_invisible = 1;
      window.sc_security = '3e7dba9f';
      window.scJsHost = (('https:' == document.location.protocol) ? 'https://secure.' : 'http://www.');

      //pure javascript version of appending a script
      //based off of https://howchoo.com/g/mmu0nguznjg/learn-the-slow-and-fast-way-to-append-elements-to-the-dom
      function appendScript(url) {
        return new Promise(function (fulfill, reject) {
          let e = document.createElement('script');
          e.src = url;
          e.onload = () => { fulfill(); };
          e.onerror = reject;
          document.body.appendChild(e);
        });
      }

      appendScript(`${scJsHost}statcounter.com/counter/counter.js`);
    }
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
