<template>
  <generic-settings-card
    :disable-submission="!formHasChanged"
    :form-submit="syncPageToCache"
    :form-reset="syncCacheToPage">
    <h1 class="title" slot="title">General Settings</h1>
    <v-container fluid class="pa-0" slot="body">
      <v-layout row>
        <v-flex>
          <v-switch v-model="pageLightMode" label="Use Light Theme"/>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex>
          <h2 class="subheading">Active Server</h2>
          <v-radio-group v-model="pageActiveServer" row>
            <v-radio
              v-for="server in servers"
              :key="server"
              :label="server.toUpperCase()"
              :value="server"/>
          </v-radio-group>
        </v-flex>
      </v-layout>
    </v-container>
  </generic-settings-card>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { servers } from '@/modules/constants';
import GenericSettingsCard from './GenericSettingsCard';

export default {
  components: {
    GenericSettingsCard,
  },
  computed: {
    ...mapState('settings', ['lightMode', 'activeServer']),
    lightModeHasChanged () {
      return this.pageLightMode !== this.lightMode;
    },
    activeServerHasChanged () {
      return this.pageActiveServer !== this.activeServer;
    },
    formHasChanged () {
      return [this.lightModeHasChanged, this.activeServerHasChanged].some(val => val);
    },
    servers: () => servers,
  },
  data () {
    return {
      pageLightMode: false,
      pageActiveServer: 'gl',
    };
  },
  methods: {
    ...mapActions(['setActiveServer']),
    ...mapActions('settings', ['setLightMode']),
    syncCacheToPage () {
      this.pageLightMode = this.lightMode;
      this.pageActiveServer = this.activeServer;
    },
    async syncPageToCache () {
      if (this.lightModeHasChanged) {
        await this.setLightMode(this.pageLightMode);
      }

      if (this.activeServerHasChanged) {
        await this.setActiveServer(this.pageActiveServer);
      }
    },
  },
  watch: {
    lightMode () {
      this.syncCacheToPage();
    },
    activeServer () {
      this.syncCacheToPage();
    },
  },
  mounted () {
    this.syncCacheToPage();
  },
};
</script>

<style scoped>
.v-input--radio-group .v-radio {
  flex: 1;
}
</style>
