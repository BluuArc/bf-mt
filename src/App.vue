<template>
  <multidex-data-wrapper :isMain="true">
    <v-app :dark="!lightMode" slot-scope="{ stateInfo, loadingState, linkInfo }">
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
            :value="currentPageName === subItem.title"
            :to="typeof (subItem.link) === 'function' ? subItem.link(linkInfo) : subItem.link"
            @click="($vuetify.breakpoint.mdAndDown) ? (showDrawer = false) : (showDrawer = showDrawer)"
            active-class="primary white--text"
          >
            <v-list-tile-action>
              <v-progress-circular v-if="stateInfo[subItem.name] && stateInfo[subItem.name].isLoading" indeterminate/>
              <v-badge
                v-else-if="group.subheader === 'General' && subItem.title === 'Home' && numNewCommits > 0"
                :color="currentPageName === subItem.title ? 'secondary' : 'primary'"
              >
                <span slot="badge">{{ numNewCommits > 10 ? '10+' : numNewCommits }}</span>
                <img v-if="subItem.image" :src="subItem.image" style="width: 30px; vertical-align: middle;"/>
                <v-icon v-else v-html="subItem.icon"/>
              </v-badge>
              <v-badge
                v-else-if="group.subheader === 'General' && subItem.title === 'Settings' && numSettingsUpdates > 0"
                :color="currentPageName === subItem.title ? 'secondary' : 'primary'"
              >
                <span slot="badge">{{ numSettingsUpdates }}</span>
                <img v-if="subItem.image" :src="subItem.image" style="width: 30px; vertical-align: middle;"/>
                <v-icon v-else v-html="subItem.icon"/>
              </v-badge>
              <template v-else>
                <img v-if="subItem.image" :src="subItem.image" style="width: 30px; vertical-align: middle;"/>
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
          <v-btn title="GitHub Repository" flat icon href="https://github.com/BluuArc/bf-mt" rel="noopener" target="_blank">
            <v-icon>fab fa-github</v-icon>
          </v-btn>
          <v-btn title="Discord Server" flat icon href="https://discord.gg/8rUdRfr" rel="noopener" target="_blank">
            <v-icon>fab fa-discord</v-icon>
          </v-btn>
          <v-spacer/>
          <span class="mx-auto pr-3">&copy; {{ new Date().getUTCFullYear() }}</span>
        </v-footer>
      </v-navigation-drawer>
      <v-toolbar clipped-right app>
        <v-toolbar-side-icon @click.stop="showDrawer = !showDrawer"/>
        <v-badge left v-if="numUpdates > 0">
          <span slot="badge">{{ numUpdates > 10 ? '10+' : numUpdates }}</span>
          <v-toolbar-title v-text="currentPageName || 'Unknown Page'"/>
        </v-badge>
        <v-toolbar-title v-else v-text="currentPageName || 'Unknown Page'"/>
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
      <!-- HACK: stateInfo is computed by wrapper, saved to app state here on page update -->
      <span style="display: none;">
        {{ setDataIsLoading(loadingState) }}
        {{ onStateUpdate(stateInfo, linkInfo) }}
      </span>
      <site-trackers/>
    </v-app>
  </multidex-data-wrapper>
</template>

<script>
import logger from '@/modules/Logger';
import { servers } from '@/modules/constants';
import { ensureContentPadding } from '@/modules/utils';
import { mapActions, mapState, mapGetters } from 'vuex';
import MultidexDataWrapper from '@/components/MultidexDataWrapper';
import SiteTrackers from '@/components/SiteTrackers';

import { moduleInfo } from '@/store';
const multidexModules = moduleInfo.filter(m => m.type === 'multidex');

function getMenuItems (linkInfo) {
  const multidexIconMapping = {
    units: {image: require('@/assets/unit_thum.png')},
    items: {image: require('@/assets/sphere_thum_5_5.png')},
    bursts: {image: require('@/assets/battle_meter_current.png')},
    extraSkills: {image: require('@/assets/unit_ills_full_50792_100x103.png')},
    leaderSkills: {image: require('@/assets/battle_leader_skill_icon.png')},
    missions: {image: require('@/assets/achievement_pt_icon.png')},
    dictionary: {image: require('@/assets/challeng_hierarchy_mark_gold.png')},
    default: {icon: 'extension'},
  };
  const generateMultidexEntry = (entry) => {
    return {
      ...entry,
      title: entry.fullName,
      link: () => {
        // attempt to get url from state getter
        const url = this.$store && this.$store.getters &&
          this.$store.getters[`${entry.name}/getMultidexPathTo`] &&
          this.$store.getters[`${entry.name}/getMultidexPathTo`]();
        // logger.debug(url, this);
        return url || entry.link;
      },
      ...(multidexIconMapping[entry.name] || multidexIconMapping.default),
    };
  };

  return [
    {
      subheader: 'General',
      items: [
        {
          icon: 'home',
          title: 'Home',
          link: '/',
          generalHome: true,
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
          generalSettings: true,
        },
      ],
    },
    {
      subheader: 'Multidex',
      items: multidexModules.map(generateMultidexEntry),
    },
    {
      subheader: 'Tools',
      items: [
        {
          title: 'Squads',
          link: '/tools/squads',
          image: require('@/assets/unit_table.png'),
        },
        {
          title: 'Compare',
          link: '/tools/compare',
          image: require('@/assets/tt_icon_m-1.png'),
        },
        {
          title: 'Tier List Creator',
          link: (() => {
            const currentCode = (linkInfo && linkInfo.tierList) || '';
            const baseUrl = '/tools/tier-list-creator';
            return currentCode
              ? `${baseUrl}?code=${currentCode}`
              : baseUrl;
          })(),
          image: require('@/assets/tier-list-icon.png'),
        },
      ],
    },
  ];
}

export default {
  name: 'App',
  components: {
    MultidexDataWrapper,
    SiteTrackers,
  },
  computed: {
    ...mapState('settings', ['lightMode', 'activeServer']),
    ...mapState(['disableHtmlOverflow', 'updateTimes']),
    ...mapGetters('github', ['getNumberOfNewCommits']),
    currentPage () {
      logger.debug('route info', this.$route);
      return this.$route.path;
    },
    currentPageName () {
      return this.$route.name;
    },
    numUpdates () {
      return this.numSettingsUpdates + this.numNewCommits;
    },
    possibleServers: () => servers,
    multidexModules: () => multidexModules,
  },
  data () {
    return {
      showDrawer: false,
      menuItems: getMenuItems.call(this),
      title: 'Brave Frontier Multi Tool',
      pageActiveServer: '',
      dataIsLoading: false,
      numSettingsUpdates: 0,
      numNewCommits: 0,
      lastTierListCode: '',
    };
  },
  methods: {
    ...mapActions(['init', 'setActiveServer', 'fetchUpdateTimes']),
    ...mapActions('github', ['updateCommits', 'setLastSeenTime']),
    htmlOverflowChangeHandler () {
      const page = document.getElementsByTagName('html')[0];
      page.style.overflowY = (this.disableHtmlOverflow) ? 'hidden' : 'auto';
    },
    setDataIsLoading (bool) {
      this.dataIsLoading = !!bool;
    },
    calculateNewSettingsUpdateCount (stateInfo) {
      this.numSettingsUpdates = multidexModules.map(({ name }) => {
        const { hasUpdates, numEntries } = stateInfo[name];
        const serverCount = servers.filter(server => !!hasUpdates[server] && numEntries[server] && numEntries[server] > 0).length;
        return serverCount;
      }).reduce((acc, val) => acc + val, 0);
    },
    onStateUpdate (stateInfo, linkInfo) {
      this.calculateNewSettingsUpdateCount(stateInfo);
      if (linkInfo && this.lastTierListCode !== linkInfo.tierList) {
        this.menuItems = getMenuItems.call(this, linkInfo);
        this.lastTierListCode = linkInfo.tierList;
      }
      this.numNewCommits = this.getNumberOfNewCommits();
    },
  },
  watch: {
    activeServer (newValue) {
      this.pageActiveServer = newValue || 'gl';
    },
    async pageActiveServer (newValue) {
      if (newValue !== this.activeServer && servers.includes(newValue)) {
        const routeQuery = this.$route.query;
        if (routeQuery && routeQuery.server) {
          this.$router.push({
            path: this.$route.path,
            query: {
              ...routeQuery,
              server: newValue,
            },
          });
        }
        await this.setActiveServer(newValue);
      }
    },
    disableHtmlOverflow () {
      this.htmlOverflowChangeHandler();
    },
    async dataIsLoading (newValue) {
      logger.debug('dataIsLoading changed to', newValue);
      if (!newValue) {
        await this.updateCommits();
      }
    },
    async currentPageName (newValue) {
      await this.fetchUpdateTimes();
      if (!this.dataIsLoading) {
        await this.updateCommits();
      }

      if (newValue === 'Home') {
        setTimeout(() => this.setLastSeenTime(new Date()), 10 * 1000);
      }

      ensureContentPadding();
    },
    showDrawer (newValue) {
      if (newValue) {
        this.menuItems = getMenuItems.call(this);
      }
    },
  },
  async created () {
    await this.init();
  },
  async mounted () {
    this.pageActiveServer = this.activeServer;
    this.htmlOverflowChangeHandler();
    await this.fetchUpdateTimes();

    if (typeof window.webpackHotUpdateBFMT === 'function') {
      window.__bfmtContext = this;
    }
  },
};
</script>

<style lang="less">
html {
  overflow-y: auto;
}

.d-align-self-center {
  align-self: center;
}

.d-align-items-center {
  align-items: center;
}

* {
  .theme--light {
    --background-color-alt--lighten-2: ghostwhite;
    --background-color-alt--lighten-1: lightgrey;
    --background-color-alt: rgba(0, 0, 0, 0.12); /* default color of v-divider */
    --background-color--card: #fff;
    --background-color: #fafafa;
  }

  .theme--dark {
    --background-color-alt--lighten-2: grey;
    --background-color-alt--lighten-1: dimgrey;
    --background-color-alt: hsla(0, 0%, 100%, 0.12); /* default color of v-divider */
    --background-color--card: #424242;
    --background-color: #303030;
  }
}

.d-flex-container {
  display: flex;
  &.items-center {
    align-items: center;
  }

  &.content-flex-end {
    justify-content: flex-end;
  }

  &.content-center {
    justify-content: center;
  }
}

// tree view styling; based off of: https://jsfiddle.net/arvidkahl/kwo6vk9d/11/
.tree-view-item {
  font-family: monospace;
  font-size: 14px;
  margin-left: 18px;

}

.tree-view-wrapper {
  background-color: #f5f5f5;
  color: #bd4147;
  overflow: auto;
  max-height: 45vh;

  .theme--dark & {
    background-color: black;
    color: lightgreen;
  }
}

/* Find the first nested node and override the indentation */
.tree-view-item-root > .tree-view-item-leaf > .tree-view-item {
  margin-left: 0;
}

/* Root node should not be indented */
.tree-view-item-root {
  margin-left: 0;
}

.tree-view-item-node {
  cursor: pointer;
  position: relative;
  white-space: unset!important;
}

.tree-view-item-leaf {
  white-space: unset!important;
}

.tree-view-item-key {
  font-weight: bold;
}

.tree-view-item-key-with-chevron {
  padding-left: 14px;
}


.tree-view-item-key-with-chevron.opened::before {
  top:4px;
  transform: rotate(90deg);
  -webkit-transform: rotate(90deg);
}

.tree-view-item-key-with-chevron::before {
  color: #444;
  content: '\25b6';
  font-size: 10px;
  left: 1px;
  position: absolute;
  top: 3px;
  transition: -webkit-transform .1s ease;
  transition: transform .1s ease;
  transition: transform .1s ease, -webkit-transform .1s ease;
  -webkit-transition: -webkit-transform .1s ease;

  .theme--dark & {
    color: #ccc!important;
  }
}

.tree-view-item-hint {
  color: #555!important;

  .theme--dark & {
    color: #ddd!important;
  }
}
</style>
