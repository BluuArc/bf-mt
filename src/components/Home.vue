<template>
  <div class="ui container center aligned">
    <div class="ui segments">
      <div class="ui blue inverted segment left aligned">Description</div>
      <div class="ui segment left aligned">
        <span>The Brave Frontier Multi-Tool is a web application whose goals are as follows:</span>
        <ul>
          <li>Provide up-to-date information on units and items</li>
          <li>Offer tools to help users build squads</li>
          <li>Deliver data in a timely manner</li>
        </ul>
      </div>
    </div>

    <load-status-card
      :fullUnitData="fullUnitData"
      :fullItemData="fullItemData"
      :fullExtraSkillData="fullExtraSkillData"
      :fullBurstData="fullBurstData"/>

    <div class="ui segments">
      <div class="ui gray inverted segment left aligned">Rights/Credits</div>
      <div class="ui segment left aligned">
        <span>Thanks to the following for providing parts used in this tool.
          All images and code belong to their respective owners.
          Unless otherwise specified, this tool is not directly affiliated with
          any of the entities named below.</span>
        <ul>
          <li>Brave Frontier assets by Gumi/Alim</li>
          <li><a href="https://github.com/cheahjs/bravefrontier_data">Brave Frontier Datamine</a> by Deathmax</li>
          <li><a href="https://semantic-ui.com/">Semantic UI</a></li>
          <li><a href="https://vuejs.org/">Vue.js</a> by Evan You</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import LoadStatusCard from '@/components/HomeComponents/LoadStatusCard';

export default {
  props: ['fullUnitData', 'fullItemData', 'fullExtraSkillData', 'fullBurstData'],
  components: {
    'load-status-card': LoadStatusCard,
  },
  mounted() {
    this.$emit('updateheader', { content: 'Settings', href: '/settings' });
  },
};
</script>

<style>
.center.aligned * {
  margin: 0 auto;
}

#top-banner, .ui.segments {
  margin-bottom: 2.5em;
}
</style>
