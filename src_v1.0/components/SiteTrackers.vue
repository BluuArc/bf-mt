<template>
  <noscript style="display: none;">Can't load site trackers.</noscript>
</template>

<script>
export default {
  mounted () {
    this.loadGoogleAnalyticsTracker();
    this.loadStatCounterTracker();
  },
  methods: {
    appendScript (url) {
      // pure javascript version of appending a script
      // based off of https://howchoo.com/g/mmu0nguznjg/learn-the-slow-and-fast-way-to-append-elements-to-the-dom
      return new Promise(function (resolve, reject) {
        const e = document.createElement('script');
        e.src = url;
        e.onload = () => { resolve(); };
        e.onerror = reject;
        document.body.appendChild(e);
      });
    },
    async loadGoogleAnalyticsTracker () {
      window.dataLayer = window.dataLayer || [];
      function gtag () {
        window.dataLayer.push(arguments);
      }
      gtag('js', new Date());
      gtag('config', 'UA-80417877-1');
      await this.appendScript('https://www.googletagmanager.com/gtag/js?id=UA-80417877-1');
    },
    async loadStatCounterTracker () {
      window.sc_project = window.sc_project || 11034084;
      window.sc_invisible = window.sc_invisible || 1;
      window.sc_security = window.sc_security || '3e7dba9f';
      await this.appendScript('https://secure.statcounter.com/counter/counter.js');
    },
  },
};
</script>

