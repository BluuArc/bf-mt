<template>
  <div class="ui raised segments" v-if="lsData">
    <div class="ui inverted segment">
      <b>LS: </b>{{ lsData.name }}
    </div>
    <div class="ui segment" id="ls-content">
      <div class="ui top attached tabular menu">
        <a class="active item" data-tab="desc-ls">Description</a>
        <a class="item" data-tab="json-ls">JSON</a>
      </div>
      <div class="ui bottom attached active tab segment" data-tab="desc-ls">
        {{ lsData.desc }}
      </div>
      <div class="ui bottom attached tab segment" data-tab="json-ls">
        <pre><code>{{ jsonData }}</code></pre>
      </div>
    </div>
  </div>
</template>

<script>
/* global $ */
export default {
  props: ['lsData'],
  computed: {
    jsonData() {
      return JSON.stringify(this.lsData, null, 2);
    },
  },
  mounted() {
    $(this.$el).find('.menu .item')
      .tab({ context: $(this.$el) })
      .tab('change tab', 'desc-ls');
  },
};
</script>

<style>
#ls-content .bottom.attached.tab.segment {
  max-height: 50vh;
  overflow: auto;
}
</style>
