<template>
  <div class="ui segments" v-if="arena">
    <div class="ui segment yellow inverted">
      Arena
    </div>
    <div class="ui segment" id="arena-content">
      <div class="ui top attached tabular menu">
        <a class="active item" data-tab="translation-arena">Translation</a>
        <a class="item" data-tab="json-arena">JSON</a>
      </div>
      <div class="ui bottom attached active tab segment" data-tab="translation-arena">
        <ul>
          <li
            v-for="(stat, index) in arena"
            :key="index">
            {{ generateArenaText(stat) }}
            </li>
        </ul>
      </div>
      <div class="ui bottom attached tab segment" data-tab="json-arena">
        <pre><code>{{ jsonData }}</code></pre>
      </div>
    </div>
  </div>
</template>

<script>
/* global $ */
export default {
  props: ['arena'],
  computed: {
    conditionMapping() {
      return {
        hp_50pr_under: 'has less than 50% HP',
        hp_50pr_over: 'has more than 50% HP',
        hp_75pr_under: 'has less than 75% HP',
        hp_25pr_under: 'has less than 25% HP',
        hp_min: 'has the lowest HP',
        hp_max: 'has the highest HP',
        atk_max: 'has the highest attack',
        random: 'is present',
      };
    },
    actionMapping() {
      return {
        skill: 'use BB/SBB',
        attack: 'use normal attacks',
      };
    },
    targetMapping() {
      return {
        party: 'when an ally',
        enemy: 'on an enemy that',
      };
    },
    jsonData() {
      return JSON.stringify(this.arena, null, 2);
    },
  },
  methods: {
    generateArenaText(data = {}) {
      const chance = `${data['chance%']}% chance`;
      const action = this.actionMapping[data.action] || data.action;
      const target = this.targetMapping[data['target type']] || data['target type'];
      const condition = this.conditionMapping[data['target conditions']] || data['target conditions'];
      return `${chance} to ${action} ${target} ${condition}`;
    },
  },
  mounted() {
    $(this.$el).find('.menu .item')
      .tab({ context: $(this.$el) })
      .tab('change tab', 'translation-arena');
  },
};
</script>

<style>
#arena-content .bottom.attached.tab.segment pre {
  max-height: 50vh;
  overflow: auto;
}
</style>
