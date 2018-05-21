<template>
  <v-app :dark="isDarkMode">
    <v-navigation-drawer
      persistent
      v-model="showDrawer"
      enable-resize-watcher
      fixed
      app>
      <v-list v-for="(group, i) in menuItems" :key="i" subheader>
        <v-subheader v-text="group.subheader"/>
        <v-list-tile
          v-for="(subItem, j) in group.items"
          :key="`${i}-${j}`"
          exact
          :value="currentPage === subItem.link"
          :to="subItem.link">
          <v-list-tile-action>
            <v-icon v-html="subItem.icon"/>
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
      <v-toolbar-title v-text="title"/>
      <v-spacer/>
      <v-btn flat icon @click.stop="isDarkMode = !isDarkMode">
        <v-icon>invert_colors</v-icon>
      </v-btn>
    </v-toolbar>
    <v-content>
      <v-slide-y-transition mode="in-out">
        <router-view/>
      </v-slide-y-transition>
    </v-content>
  </v-app>
</template>

<script>
export default {
  computed: {
    currentPage () {
      return this.$route.path;
    },
  },
  data () {
    return {
      showDrawer: true,
      isDarkMode: false,
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
              link: '/multidex/units',
            },
            {
              icon: 'group_work',
              title: 'Items',
              link: '/multidex/items',
            },
            {
              icon: 'gavel',
              title: 'Brave Bursts',
              link: '/multidex/bursts',
            },
            {
              icon: 'extension',
              title: 'Extra Skills',
              link: '/multidex/extraskills',
            },
          ],
        },
      ],
      title: 'BF-MT',
    };
  },
  name: 'App',
};
</script>

<style>
html {
  overflow-y: auto;
}
</style>
