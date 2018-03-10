<template>
  <div class="ui raised segments" v-if="burstData && !burstData.error">
    <div :class="getHeaderClass()"><b>{{ burstType }}: </b>{{ burstData.name }}</div>
    <div class="ui segment" id="burst-content">
      <div class="ui top attached tabular menu">
        <div class="active item" :data-tab="descriptionTabId">Description</div>
        <div class="item" :data-tab="jsonTabId">JSON</div>
      </div>
      <div class="ui bottom attached active tab segment" :data-tab="descriptionTabId">
        {{ burstData.desc }}
      </div>
      <div class="ui bottom attached tab segment" :data-tab="jsonTabId">
        <pre><code>{{ jsonData }}</code></pre>
      </div>
    </div>
  </div>
</template>

<script>
/* global $ */
export default {
  props: ['burstData', 'burstType'],
  mounted() {
    $(this.$el).find('.menu .item').tab()
      .tab('change tab', this.descriptionTabId);
  },
  data() {
    return {
      typeColorMapping: {
        BB: 'grey',
        SBB: 'yellow',
        UBB: 'red',
      },
    };
  },
  computed: {
    descriptionTabId() {
      return `desc-${this.burstType}`;
    },
    jsonTabId() {
      return `json-${this.burstType}`;
    },
    jsonData() {
      return JSON.stringify(this.burstData, null, 2);
    },
  },
  methods: {
    getHeaderClass() {
      const classObject = { ui: true, inverted: true, segment: true };
      classObject[this.typeColorMapping[this.burstType]] = true;
      return classObject;
    },
  },
};
</script>

<style>
#burst-content pre {
  max-height: 50vh;
}
</style>
