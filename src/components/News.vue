<template>
  <div id="news-content">
    <div class="fluid ui button" @click="updateNews">
      Refresh News
    </div>
    <iframe id="news-frame" src="http://api.bravefrontier.gumi.sg/bf/web/notice/indexCtrl.php"></iframe>
  </div>
</template>

<script>
export default {
  methods: {
    updateNews() {
      const frame = document.getElementById('news-frame');
      frame.src += '';
    },
  },
};
</script>

<style>
#news-content {
  height: inherit;
}
#news-content iframe {
  width: 100%;
  height: calc(100% - 42px);
  display: block;
}

#news-content .button {
  height: 2.75em;
}
</style>
