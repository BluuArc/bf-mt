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
        <v-toolbar-title v-text="currentPageName"/>
      </v-badge>
      <v-toolbar-title v-else v-text="currentPageName"/>
      <v-spacer/>
      <!-- <v-menu offset-y>
        <v-btn slot="activator" flat :loading="dataIsLoading" :disabled="dataIsLoading">
          Server: {{ pageActiveServer }}
        </v-btn>
        <v-list>
          <v-list-tile v-for="server in possibleServers" :key="server" @click="pageActiveServer = server">
            <v-list-tile-title v-text="server.toUpperCase()"/>
          </v-list-tile>
        </v-list>
      </v-menu> -->
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

export default {
  name: 'App',
  computed: {
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
    lightMode () {
      logger.warn('Using mock light mode');
      return false;
    },
  },
  data () {
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
        // {
        //   subheader: 'Multidex',
        //   items: multidexModules.map(generateMultidexEntry),
        // },
      ],
      title: 'Brave Frontier Multi Tool',
      pageActiveServer: '',
    }
  }
}
</script>
