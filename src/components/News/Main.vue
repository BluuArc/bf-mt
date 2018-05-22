<template>
  <v-container>
    <v-layout row>
      <v-flex xs12>
        <v-btn block @click="updateNews">
          Refresh News
        </v-btn>
      </v-flex>
    </v-layout>
    <v-layout row id="iframe-container">
      <v-flex xs12>
        <iframe src="https://api.bravefrontier.gumi.sg/bf/web/notice/indexCtrl.php"/>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  methods: {
    updateNews () {
      const frame = Array.from(this.$el.getElementsByTagName('iframe'))[0];
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
