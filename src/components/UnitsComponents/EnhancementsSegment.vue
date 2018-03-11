<template>
  <div class="ui raised segments" v-if="feskillData">
    <div class="ui green inverted segment">
      <b>SP Enhancements</b>
      <span class="ui small label">
        {{ feskillSum }} SP
      </span>
    </div>
    <div class="ui segment" id="sp-content">
      <div class="ui top attached tabular menu">
        <a class="active item" data-tab="table-sp">Table</a>
        <a class="item" data-tab="json-sp">JSON</a>
      </div>
      <div class="ui bottom attached active tab segment" data-tab="table-sp">
        <table
          class="ui very basic green celled compact striped unstackable table"
          id="enhancements">
          <thead>
            <tr>
              <th>Cost</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="skill in feskillData" :key="skill.id">
              <td class="collapsing">
                {{ skill.skill.bp }} SP
              </td>
              <td>
                  <h4 class="ui header">
                    <div class="content">
                      <sp-icon :category="skill.category"></sp-icon>
                      <span id="sp-desc">
                        <div class="header">
                          {{ skill.skill.desc }}
                        </div>
                        <div class="sub header" v-if="skill['dependency comment']">
                          {{ getDependencyText(skill) }}
                        </div>
                      </span>
                  </div>
                </h4>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="ui bottom attached tab segment" data-tab="json-sp">
        <pre><code>{{ jsonData }}</code></pre>
      </div>
    </div>
  </div>
</template>

<script>
import SPIcon from '@/components/UnitsComponents/SPIcon';

/* global $ */
export default {
  props: ['feskillData'],
  components: {
    'sp-icon': SPIcon,
  },
  mounted() {
    $(this.$el).find('.menu .item')
      .tab({ context: $(this.$el) })
      .tab('change tab', 'table-sp');
  },
  computed: {
    feskillSum() {
      if (!this.feskillData) {
        return 0;
      }
      return this.feskillData
        .map(s => s.skill.bp)
        .reduce((acc, val) => acc + val, 0);
    },
    jsonData() {
      return JSON.stringify(this.feskillData, null, 2);
    },
  },
  methods: {
    getSPSkillWithID(id) {
      const result = this.feskillData
        .filter(s => id.indexOf(s.id.toString()) > -1);

      return result[0];
    },
    getDependencyText(skill) {
      const spSkill = this.getSPSkillWithID(skill.dependency);

      if (spSkill) {
        return `Unlock "${spSkill.skill.desc}"`;
      }

      return skill['dependency comment'] || 'Requires another enhancement';
    },
  },
};
</script>

<style>
#sp-content .bottom.attached.tab.segment {
  max-height: 50vh;
  overflow: auto;
}
</style>
