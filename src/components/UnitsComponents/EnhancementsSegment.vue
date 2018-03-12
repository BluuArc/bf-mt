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
        <a class="item" data-tab="share-sp">Share Build</a>
      </div>
      <div class="ui bottom attached active tab segment" data-tab="table-sp">
        <table
          class="ui very basic green celled compact striped unstackable table"
          id="enhancements">
          <thead>
            <tr>
              <th class="collapsing" :style="sumHeaderStyle">
                <div class="ui checkbox" id="sp-main">
                  <input type="checkbox" :value="-1">
                  <label>{{ activeSkillSum }} SP</label>
                </div>
              </th>
              <th id="cost-column">Cost</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(skill, index) in feskillData" :key="skill.id">
              <td class="collapsing" id="checkbox-column">
                <div class="ui fitted checkbox">
                  <input type="checkbox" :value="index" v-model="activeSkills[index]">
                </div>
              </td>
              <td class="collapsing" id="cost-column">
                {{ skill.skill.bp }} SP
              </td>
              <td>
                  <h4 class="ui header">
                    <div class="content">
                      <sp-icon :category="skill.category"></sp-icon>
                      <span id="sp-desc">
                        <div class="header">
                          {{ skill.skill.desc || skill.skill.name }}
                        </div>
                        <div class="sub header" v-if="skill.dependency">
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
      <div class="ui bottom attached tab segment" data-tab="share-sp">
        <button
          @click="copyToClipboard"
          :class="{
            'ui button fluid': true,
            disabled: activeSkillSum === 0,
            green: copyButtonText !== 'Copy Text'
          }">
          {{ copyButtonText }}
        </button>
        <textarea readonly v-model="sharedText"></textarea>
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
  data() {
    return {
      activeSkills: {},
      textarea: null,
      copyButtonText: 'Copy Text',
    };
  },
  watch: {
    feskillData() {
      this.activeSkills = {};
      setTimeout(() => {
        this.initCheckboxes();
        this.scrollToTop();
      }, 100);
    },
    activeSkillSum() {
      this.copyButtonText = 'Copy Text';
    },
  },
  mounted() {
    $(this.$el).find('.menu .item')
      .tab({ context: $(this.$el) })
      .tab('change tab', 'table-sp');
    this.textarea = $(this.$el).find('textarea');
    this.initCheckboxes();
    this.scrollToTop();
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
    activeSkillSum() {
      return Object.keys(this.activeSkills)
        .filter(key => this.activeSkills[key])
        .map(key => this.feskillData[key].skill.bp)
        .reduce((acc, val) => acc + val, 0);
    },
    jsonData() {
      return JSON.stringify(this.feskillData, null, 2);
    },
    sumHeaderStyle() {
      const style = { width: '6em', 'max-width': '6em' };
      if (this.activeSkillSum <= 100) {
        return style;
      } else if (this.activeSkillSum <= 120) {
        style['background-color'] = 'lightgoldenrodyellow';
      } else {
        style['background-color'] = 'lightpink';
      }
      return style;
    },
    sharedText() {
      const activeSkills = Object.keys(this.activeSkills)
        .filter(key => this.activeSkills[key]);
      if (activeSkills.length > 0) {
        return activeSkills.map(key => this.feskillData[key])
          .map((skill) => {
            const cost = skill.skill.bp;
            const desc = skill.skill.desc || skill.skill.name;
            return `[${cost} SP] - ${desc}`;
          })
          .join('\n')
          .concat([`\n\n[Total: ${this.activeSkillSum} SP]`]);
      }
      return 'No SP enhancements selected';
    },
  },
  methods: {
    scrollToTop() {
      const $el = $('.scrolling.content#unit-card-content');
      setTimeout(() => {
        if ($el.get(0).scrollTop > 50) {
          $el.get(0).scrollTop = 0;
        }
      }, 750);
    },
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
    copyToClipboard() {
      const textarea = this.textarea.get(0);
      textarea.select();
      document.execCommand('Copy');
      textarea.selectionEnd = 0;
      this.copyButtonText = 'Copied text';
    },
    initCheckboxes() {
      const mainCheckbox = $(this.$el).find('#sp-main');
      const indivCheckboxes = $(this.$el).find('tbody .checkbox');

      mainCheckbox
        .checkbox({
          onChecked() { indivCheckboxes.checkbox('check'); },
          onUnchecked() { indivCheckboxes.checkbox('uncheck'); },
        });

      indivCheckboxes
        .checkbox({
          fireOnInit: true,
          onChange: () => {
            let allChecked = true;
            let allUnchecked = true;
            indivCheckboxes.each(function checkCheckbox() {
              if ($(this).checkbox('is checked')) {
                allUnchecked = false;
              } else {
                allChecked = false;
              }
            });

            if (allChecked) {
              mainCheckbox.checkbox('set checked');
            } else if (allUnchecked) {
              mainCheckbox.checkbox('set unchecked');
            } else {
              mainCheckbox.checkbox('set indeterminate');
            }
          },
        });
    },
  },
};
</script>

<style>
#sp-content .bottom.attached.tab.segment pre {
  max-height: 50vh;
  overflow: auto;
}

#sp-content textarea {
  width: 100%;
  height: 30vh;
}

#sp-content tr {
  display: block;
}

#sp-content tbody {
  display: block;
  overflow: auto;
  max-height: 45vh;
}

#sp-content #checkbox-column {
  width: 6em;
  max-width: 6em;
}

#sp-content #cost-column {
  width: 4em;
  max-width: 4em;
}
</style>
