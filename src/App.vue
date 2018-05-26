<template>
  <v-app :dark="darkMode">
    <v-navigation-drawer
      persistent
      v-model="showDrawer"
      enable-resize-watcher
      fixed
      app>
      <h3 class="headline pl-3 pt-3" v-text="title"/>
      <v-list v-for="(group, i) in menuItems" :key="i" subheader>
        <v-subheader v-text="group.subheader"/>
        <v-list-tile
          v-for="(subItem, j) in group.items"
          :key="`${i}-${j}`"
          exact
          :value="currentPage === subItem.link"
          :to="subItem.link">
          <v-list-tile-action>
            <v-progress-circular v-if="subItem.module && loadingStates[subItem.module]" indeterminate/>
            <v-icon v-else v-html="subItem.icon"/>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="subItem.title"/>
          </v-list-tile-content>
        </v-list-tile>
        <v-divider/>
      </v-list>
      <v-footer>
        <v-btn href="https://github.com/BluuArc/bf-mt" rel="noopener" target="_blank" icon>
          <v-icon>fab fa-github</v-icon>
        </v-btn>
        <v-spacer/>
        <span class="mx-auto pr-3">&copy; {{ new Date().getUTCFullYear() }}</span>
      </v-footer>
    </v-navigation-drawer>
    <v-toolbar app>
      <v-toolbar-side-icon @click.stop="showDrawer = !showDrawer"/>
      <v-toolbar-title v-text="currentPageName"/>
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
  </v-app>
</template>

<script>
import { mapActions, mapState } from 'vuex';

export default {
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
      const modules = ['units', 'items', 'bursts', 'extraSkills', 'leaderSkills'];
      return modules.map(name => this[`${name}Loading`]).some(val => !!val);
    },
    loadingStates () {
      const modules = ['units', 'items', 'bursts', 'extraSkills', 'leaderSkills'];
      const state = {};
      modules.forEach(name => {
        state[name] = this[`${name}Loading`];
      });
      return state;
    },
    ...mapState('settings', ['darkMode', 'activeServer']),
    ...mapState('units', { unitsLoading: 'isLoading' }),
    ...mapState('items', { itemsLoading: 'isLoading' }),
    ...mapState('bursts', { burstsLoading: 'isLoading' }),
    ...mapState('extraSkills', { extraSkillsLoading: 'isLoading' }),
    ...mapState('leaderSkills', { leaderSkillsLoading: 'isLoading' }),
  },
  data () {
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
          items: [
            {
              icon: 'local_library',
              title: 'Overview',
              link: '/multidex',
            },
            {
              icon: 'people',
              title: 'Units',
              module: 'units',
              link: '/multidex/units',
            },
            {
              icon: 'group_work',
              title: 'Items',
              module: 'items',
              link: '/multidex/items',
            },
            {
              icon: 'gavel',
              title: 'Brave Bursts',
              module: 'bursts',
              link: '/multidex/bursts',
            },
            {
              icon: 'extension',
              title: 'Extra Skills',
              module: 'extraSkills',
              link: '/multidex/extraskills',
            },
            {
              icon: 'extension',
              title: 'Leader Skills',
              module: 'leaderSkills',
              link: '/multidex/leaderskills',
            },
          ],
        },
      ],
      title: 'Brave Frontier Multi Tool',
      pageActiveServer: '',
    };
  },
  methods: {
    ...mapActions(['init', 'setActiveServer']),
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
  },
  mounted () {
    this.init();
    this.pageActiveServer = this.activeServer;
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

.vertical-align-parent {
  position: relative;
}

.vertical-align-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
}
</style>
