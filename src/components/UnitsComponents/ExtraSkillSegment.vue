<template>
  <div class="ui raised segments" v-if="esData">
    <div class="ui orange inverted segment">
      <b>ES: </b>{{ esData.name }}
    </div>
    <div class="ui segment" id="es-content">
      <div class="ui top attached tabular menu">
        <a class="active item" data-tab="desc-es">Description</a>
        <a class="item" data-tab="json-es">JSON</a>
      </div>
      <div class="ui bottom attached active tab segment" data-tab="desc-es">
        {{ esData.desc }}
      </div>
      <div class="ui bottom attached tab segment" data-tab="json-es">
        <pre><code>{{ jsonData }}</code></pre>
      </div>
    </div>
  </div>
</template>

<script>
/* global $ */
export default {
  props: ['esData'],
  computed: {
    jsonData() {
      return JSON.stringify(this.esData, null, 2);
    },
  },
  mounted() {
    $(this.$el).find('.menu .item')
      .tab({ context: $(this.$el) })
      .tab('change tab', 'desc-es');
  },
};
</script>

<style>
#es-content .bottom.attached.tab.segment {
  max-height: 50vh;
  overflow: auto;
}
</style>
