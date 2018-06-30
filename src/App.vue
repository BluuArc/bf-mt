<template>
  <v-app :dark="!lightMode">
    <v-navigation-drawer
      persistent
      v-model="showDrawer"
      enable-resize-watcher
      style="z-index: 5;"
      fixed
      app>
      <v-btn v-if="$vuetify.breakpoint.xsOnly" block @click="showDrawer = false">
        Close Sidebar
        <v-spacer/>
        <v-icon right>chevron_left</v-icon>
      </v-btn>
      <h3 class="headline pl-3 pt-3" v-text="title"/>
      <h3 class="subheading pl-3">(UNOFFICIAL)</h3>
      <v-list v-for="(group, i) in menuItems" :key="i" subheader>
        <v-subheader v-text="group.subheader"/>
        <v-list-tile
          v-for="(subItem, j) in group.items"
          :key="`${i}-${j}`"
          exact
          :value="currentPage === subItem.link"
          :to="subItem.link"
          @click="($vuetify.breakpoint.mdAndDown) ? (showDrawer = false) : (showDrawer = showDrawer)">
          <v-list-tile-action>
            <v-progress-circular v-if="subItem.module && loadingStates[subItem.module]" indeterminate/>
            <v-badge v-else-if="group.subheader === 'General' && subItem.title === 'Settings' && numUpdates > 0">
              <span slot="badge">{{ numUpdates }}</span>
              <img v-if="subItem.image" :src="subItem.image" style="width: 30px; vertical-align: middle"/>
              <v-icon v-else v-html="subItem.icon"/>
            </v-badge>
            <template v-else>
              <img v-if="subItem.image" :src="subItem.image" style="width: 30px; vertical-align: middle"/>
              <v-icon v-else v-html="subItem.icon"/>
            </template>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="subItem.title"/>
          </v-list-tile-content>
        </v-list-tile>
        <v-divider/>
      </v-list>
      <v-btn flat block href="https://github.com/BluuArc/bf-mt/issues" rel="noopener" target="_blank">Report Issues</v-btn>
      <v-footer>
        <v-btn flat class="pl-0" href="https://github.com/BluuArc/bf-mt" rel="noopener" target="_blank">
          <v-icon left class="pr-2">fab fa-github</v-icon>
          GitHub
        </v-btn>
        <v-spacer/>
        <span class="mx-auto pr-3">&copy; {{ new Date().getUTCFullYear() }}</span>
      </v-footer>
    </v-navigation-drawer>
    <v-toolbar clipped-right app>
      <v-toolbar-side-icon @click.stop="showDrawer = !showDrawer"/>
      <v-badge left v-if="numUpdates > 0">
        <span slot="badge">{{ numUpdates }}</span>
        <v-toolbar-title v-text="currentPageName"/>
      </v-badge>
      <v-toolbar-title v-else v-text="currentPageName"/>
      <v-spacer/>
      <v-menu offset-y>
        <v-btn slot="activator" flat :loading="dataIsLoading" :disabled="dataIsLoading">
          Server: {{ pageActiveServer }}
        </v-btn>
        <v-list>
          <v-list-tile v-for="server in possibleServers" :key="server" @click="pageActiveServer = server">
            <v-list-tile-title v-text="server.toUpperCase()"/>
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-toolbar>
    <v-content>
      <v-slide-y-transition mode="out-in">
        <router-view/>
      </v-slide-y-transition>
    </v-content>
    <site-trackers/>
  </v-app>
</template>

<script>
import { mapActions, mapState, mapMutations } from 'vuex';
import debounce from 'lodash/debounce';
import SiteTrackers from '@/components/SiteTrackers';

import { moduleInfo } from '@/store';
const multidexModules = moduleInfo.filter(m => m.type === 'multidex');
export default {
  components: {
    'site-trackers': SiteTrackers,
  },
  computed: {
    currentPage () {
      return this.$route.path;
    },
    currentPageName () {
      return this.$route.name;
    },
    possibleServers () {
      return ['gl', 'eu', 'jp'];
    },
    dataIsLoading () {
      return this.modules.map(name => this[`${name}Loading`]).some(val => !!val);
    },
    loadingStates () {
      const state = {};
      this.modules.forEach(name => {
        state[name] = this[`${name}Loading`];
      });
      return state;
    },
    ...mapState('settings', ['lightMode', 'activeServer']),
    ...mapState(['disableHtmlOverflow', 'modules', 'updateTimes', 'multidexModulesWithUpdates']),
    multidexModules: () => multidexModules.slice(),
    ...(() => {
      // get state for each module
      let result = {};
      multidexModules.map(m => m.name).forEach(m => {
        const stateMapping = {};
        stateMapping[`${m}NumEntries`] = 'numEntries';
        stateMapping[`${m}Loading`] = 'isLoading';
        stateMapping[`${m}CacheTimes`] = 'cacheTimes';
        stateMapping[`${m}UpdateTimes`] = 'updateTimes';

        result = {
          ...result,
          ...mapState(m, stateMapping),
        };
      });
      return result;
    })(),
    numUpdates () {
      return this.possibleServers
        .map(s => this.multidexModulesWithUpdates[s].length)
        .reduce((acc, val) => acc + val, 0);
    },
  },
  data () {
    const multidexIconMapping = {
      // units: {icon: 'people'},
      // items: {icon: 'group_work'},
      // bursts: {icon: 'gavel'},
      units: {image: require('@/assets/unit_thum.png')},
      items: {image: require('@/assets/sphere_thum_5_5.png')},
      bursts: {image: require('@/assets/battle_meter_current.png')},
      extraSkills: {image: require('@/assets/unit_ills_full_50792_100x103.png')},
      leaderSkills: {image: require('@/assets/battle_leader_skill_icon.png')},
      missions: {image: require('@/assets/achievement_pt_icon.png')},
      default: {icon: 'extension'},
    };
    const generateMultidexEntry = (entry) => {
      return {
        ...entry,
        title: entry.fullName,
        ...(multidexIconMapping[entry.name] || multidexIconMapping.default),
      };
    };
    return {
      showDrawer: false,
      menuItems: [
        {
          subheader: 'General',
          items: [
            {
              icon: 'home',
              title: 'Home',
              link: '/',
            },
            {
              icon: 'calendar_today',
              title: 'News & Events',
              link: '/news',
            },
            {
              icon: 'settings',
              title: 'Settings',
              link: '/settings',
            },
          ],
        },
        {
          subheader: 'Multidex',
          items: multidexModules.map(generateMultidexEntry),
        },
      ],
      title: 'Brave Frontier Multi Tool',
      pageActiveServer: '',
    };
  },
  methods: {
    ...mapActions(['init', 'setActiveServer', 'fetchUpdateTimes']),
    ...mapMutations(['setMultidexModulesWithUpdates']),
    htmlOverflowChangeHandler () {
      const page = document.getElementsByTagName('html')[0];
      page.style.overflowY = (this.disableHtmlOverflow) ? 'hidden' : 'auto';
    },
    updateUpdateTimes: debounce(async function () {
      if (!this.dataIsLoading) {
        await this.fetchUpdateTimes();
      }
    }, 500),
    updateModulesWithUpdatesList (freshUpdateTimes) {
      this.possibleServers.forEach(s => {
        const modulesWithUpdates = this.modules.map(moduleName => {
          const updateTimes = this[`${moduleName}UpdateTimes`];
          const numEntries = this[`${moduleName}NumEntries`];
          if (!(!!updateTimes && freshUpdateTimes[moduleName])) {
            return { name: moduleName, hasUpdate: false };
          }
          // console.debug(s, moduleName, !!updateTimes[s], numEntries[s], !!freshUpdateTimes[moduleName][s], new Date(freshUpdateTimes[moduleName][s]) > new Date(updateTimes[s]));
          return { name: moduleName, hasUpdate: updateTimes[s] && numEntries[s] > 0 && new Date(freshUpdateTimes[moduleName][s]) > new Date(updateTimes[s]) };
        }).filter(val => !!val.hasUpdate)
        .map(({ name }) => name);
        const isDifferent = modulesWithUpdates.length !== this.multidexModulesWithUpdates[s] || modulesWithUpdates.filter(name => !this.multidexModulesWithUpdates[s].includes(name)).length > 0;
        console.debug({ server: s, newUpdates: modulesWithUpdates }, isDifferent);
        if (isDifferent) {
          this.setMultidexModulesWithUpdates({ server: s, newUpdates: modulesWithUpdates });
        }
      });
    },
  },
  watch: {
    activeServer (newValue) {
      this.pageActiveServer = newValue;
    },
    async pageActiveServer (newValue) {
      if (newValue !== this.activeServer) {
        await this.setActiveServer(newValue);
      }
    },
    disableHtmlOverflow () {
      this.htmlOverflowChangeHandler();
    },
    dataIsLoading (newValue) {
      if (!newValue) {
        this.updateUpdateTimes();
      }
    },
    updateTimes: {
      deep: true,
      handler (freshUpdateTimes) {
        this.updateModulesWithUpdatesList(freshUpdateTimes);
      },
    },
    currentPageName () {
      if (!this.dataIsLoading) {
        this.updateUpdateTimes();
      }
    },
  },
  async created () {
    await this.init();
    this.updateUpdateTimes();
  },
  mounted () {
    this.pageActiveServer = this.activeServer;
    this.htmlOverflowChangeHandler();
  },
  name: 'App',
};
</script>

<style>
html {
  overflow-y: auto;
}

* {
  /* default color of v-divider */
  --border-color-light: rgba(0, 0, 0, 0.12);
  --border-color-dark: hsla(0, 0%, 100%, 0.12);
}

.theme--light {
  --border-color: var(--border-color-light);
}

.theme--dark {
  --border-color: var(--border-color-dark);
}

.vertical-align-parent, .center-align-parent {
  position: relative;
}

.vertical-align-container {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.center-align-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
