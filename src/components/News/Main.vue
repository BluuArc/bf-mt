<template>
  <v-container class="pl-0 pr-0">
    <v-layout row>
      <v-flex xs12>
        <v-btn block @click="updateNews">
          Refresh News
        </v-btn>
      </v-flex>
    </v-layout>
    <v-layout row id="iframe-container">
      <v-flex xs12>
        <iframe :src="serverUrls[activeServer]"/>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState } from 'vuex';
export default {
  computed: {
    ...mapState('settings', ['activeServer']),
    serverUrls () {
      return {
        gl: 'https://api.bravefrontier.gumi.sg/bf/web/notice/indexCtrl.php',
        eu: 'https://apiv2-bravefrontier.gumi-europe.net/web/notice/index.php',
        jp: 'https://webnotice.ssl.brave.a-lim.jp/news/news.html',
      };
    },
  },
  methods: {
    updateNews () {
      const frame = this.$el.getElementsByTagName('iframe')[0];
      frame.src += '';
    },
  },
};
</script>


<style scoped>
.container {
  height: 100%;
}

#iframe-container {
  /* 48px for button */
  height: calc(100% - 48px);
}

#iframe-container .flex, iframe {
  height: 100%;
}

iframe {
  width: 100%;
}
</style>
