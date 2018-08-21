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
            <v-progress-circular v-if="loadingStates[subItem.name]" indeterminate/>
            <v-badge v-else-if="group.subheader === 'General' && subItem.title === 'Home' && numNewCommits > 0">
              <span slot="badge">{{ numNewCommits > 10 ? '10+' : numNewCommits }}</span>
              <img v-if="subItem.image" :src="subItem.image" style="width: 30px; vertical-align: middle;"/>
              <v-icon v-else v-html="subItem.icon"/>
            </v-badge>
            <v-badge v-else-if="group.subheader === 'General' && subItem.title === 'Settings' && numSettingsUpdates > 0">
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
    <!-- <site-trackers/> -->
  </v-app>
</template>

<script>
import logger from '@/modules/logger';
import { servers } from '@/modules/constants';
import { mapActions, mapState } from 'vuex';

import { moduleInfo } from '@/store';
const multidexModules = moduleInfo.filter(m => m.type === 'multidex');
export default {
  name: 'App',
  computed: {
    ...mapState('settings', ['lightMode', 'activeServer']),
    ...mapState(['disableHtmlOverflow']),
    loadingStates () {
      logger.warn('Using mock loading states');
      return {};
    },
    currentPage () {
      return this.$route.path;
    },
    currentPageName () {
      return this.$route.name;
    },
    numSettingsUpdates () {
      logger.warn('using mock num settings updates');
      return 1;
    },
    numNewCommits () {
      logger.warn('Using mock num new commits');
      return 1;
    },
    numUpdates () {
      return this.numSettingsUpdates + this.numNewCommits;
    },
    dataIsLoading () {
      logger.warn('Using mock data is loading');
      return false;
    },
    possibleServers: () => servers,
    multidexModules: () => multidexModules,
  },
  data () {
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
        ...(multidexIconMapping[entry.name] || multidexIconMapping.default),
      };
    };
    return {
      showDrawer: true,
       menuItems: [
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
      ],
      title: 'Brave Frontier Multi Tool',
      pageActiveServer: '',
    }
  },
  methods: {
    ...mapActions(['init', 'setActiveServer']),
    htmlOverflowChangeHandler () {
      const page = document.getElementsByTagName('html')[0];
      page.style.overflowY = (this.disableHtmlOverflow) ? 'hidden' : 'auto';
    },
  },
  watch: {
    activeServer (newValue) {
      this.pageActiveServer = newValue || 'gl';
    },
    async pageActiveServer (newValue) {
      if (newValue !== this.activeServer && servers.includes(newValue)) {
        await this.setActiveServer(newValue);
      }
    },
    disableHtmlOverflow () {
      this.htmlOverflowChangeHandler();
    },
  },
  async created () {
    await this.init();
  },
  mounted () {
    this.pageActiveServer = this.activeServer;
    this.htmlOverflowChangeHandler();
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
</style>
