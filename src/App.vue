<template>
  <div id="app">
    <header-bar :href="headerHref" :content="headerContent"/>
    <dynamic-router v-on:updateheader="updateHeader"/>
    <navbar v-on:updateheader="updateHeader"/>
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
import { mapMutations } from 'vuex';
import Dexie from 'dexie';

/* global $ PromiseWorker */

export default {
  name: 'App',
  components: {
    navbar: Navbar,
    'dynamic-router': DynamicRouter,
    'header-bar': HeaderBar,
  },
  data() {
    return {
      headerHref: undefined,
      headerContent: undefined,
      worker: undefined,
      debugMode: undefined,
      baseUrl: undefined,
      db: undefined,
    };
  },
  async mounted() {
    this.debugMode = location.hostname === 'localhost';
    this.baseUrl = `${location.origin}${location.pathname}`;
    this.loadTracker();
    try {
      await this.initDexieDb();
      // eslint-disable-next-line no-console
      console.debug('Successfully initialized Dexie');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      this.db = undefined;
    }
    try {
      await this.loadWorker();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
    await this.loadAllData();
  },
  methods: {
    async initDexieDb() {
      const schema = '&server,data,update';
      const db = new Dexie('bfmt_db');
      db.version(1).stores({
        items: schema,
        units: schema,
        bursts: schema,
        extraSkills: schema,
      });

      this.db = db;

      // read data from cache
      const servers = ['gl', 'eu', 'jp'];
      const dataTypes = {
        unit: 'setUnitData',
        item: 'setItemData',
        burst: 'setBraveBurstData',
        extraSkill: 'setExtraSkillData',
      };

      const cachePromises = servers.map(s => Object.keys(dataTypes)
        .map(d => db[`${d}s`]
          .where('server').equals(s)
          .toArray().then((result) => {
            // console.debug(s, d, { result });
            if (result.length > 0) {
              this[dataTypes[d]]({ server: s, data: result[0].data });
            }
            return result;
          }))).reduce((acc, val) => acc.concat(val), []);

      await Promise.all(cachePromises);
    },
    getData(url) {
      if (this.worker) {
        return this.worker.postMessage({
          command: 'getfile',
          url,
        });
      }
      return this.getDataLegacy(url);
    },
    getDataLegacy(url) { // blocking, but doesn't need a worker
      return new Promise((fulfill, reject) => {
        $.get(url)
          .done(data => fulfill(data))
          .fail(() => reject({ error: 'Error getting data' }));
      });
    },
    getJSON(url) {
      if (this.worker) {
        return this.worker.postMessage({
          command: 'getjson',
          url,
        });
      }
      return this.getDataLegacy(url);
    },
    async loadAllData() {
      const defaultObject = { server: 'error', data: 'Not implemented yet' };
      await this.loadUnitData();

      this.setItemData(defaultObject);
      this.setBraveBurstData(defaultObject);
      this.setExtraSkillData(defaultObject);
    },
    async loadUnitData() {
      const unitUrl = `${this.baseUrl}static/bf-data`;
      const servers = ['gl'];
      try {
        servers.forEach(async (server) => {
          const unitDb = {};
          // for every element 1 - 6
          for (let i = 1; i <= 6; i += 1) {
            // eslint-disable-next-line
            const tempData = await this.getJSON(`${unitUrl}/units-${server}-${i}.json`);
            Object.keys(tempData)
              .forEach((id) => {
                unitDb[id] = tempData[id];
              });
          }

          // update entry in Dexie
          if (this.db) {
            await this.db.units.where('server').equals('gl').delete();
            await this.db.units.add({ server: 'gl', data: unitDb, update: new Date().toUTCString() });
          }

          this.setUnitData({ server, data: unitDb });
        });
      } catch (err) {
        // eslint-disable-next-line
        console.error(err);
        this.setUnitData({ server: 'error', data: 'Error loading data' });
      }
    },
    updateHeader(newContent = {}) {
      this.headerHref = newContent.href;
      this.headerContent = newContent.content;
    },
    async loadWorker() {
      const url = `${this.baseUrl}static/js/data-load-worker.js`;
      const regularWorker = new Worker(url);
      this.worker = new PromiseWorker(regularWorker);

      return this.worker.postMessage('register')
        .then((response) => {
          // eslint-disable-next-line
          console.debug('[App] Received response:', response);
        }).catch((error) => {
          // eslint-disable-next-line
          console.error('[App] Received error:', error);
          this.worker = null;
        });
    },
    ...mapMutations([
      'setUnitData',
      'setItemData',
      'setBraveBurstData',
      'setExtraSkillData',
    ]),
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
