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
        <json-viewer :json="lsData"/>
      </div>
    </div>
  </div>
</template>

<script>
import JsonViewer from '@/components/JsonViewer';
/* global $ */
export default {
  props: ['lsData'],
  components: {
    'json-viewer': JsonViewer,
  },
  computed: {
  },
  mounted() {
    $(this.$el).find('.menu .item')
      .tab({ context: $(this.$el) })
      .tab('change tab', 'desc-ls');
  },
};
</script>
