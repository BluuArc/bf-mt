<template>
  <v-card>
    <v-card-title class="green darken-3 white--text">
      <v-layout row wrap>
        <v-flex xs9 class="text-xs-left">
          <h3 class="title">SP Enhancements</h3>
        </v-flex>
        <v-flex xs3 class="text-xs-right">
          {{ feskillSum }} SP
        </v-flex>
      </v-layout>
    </v-card-title>
    <v-card-text class="pt-0">
      <v-tabs v-model="activeTab">
        <v-tab key="table">
          Table
        </v-tab>
        <v-tab key="share">
          Share Build
        </v-tab>
        <v-tab key="json">
          JSON
        </v-tab>
      </v-tabs>
      <v-tabs-items v-model="activeTab" touchless>
        <v-tab-item key="table">
          <v-container fluid class="sp-table pa-0">
            <v-layout row class="sp-table--headers">
              <v-flex xs2 md2 lg1>
                <v-checkbox
                  class="pl-1"
                  :label="`${activeSkillSum} SP`"
                  :input-value="overallState === 'all'"
                  :indeterminate="overallState === 'some'"
                  @click.native="toggleOverallState"
                  hide-details/>
              </v-flex>
              <v-flex xs2 md2 lg1 class="center-align-parent">
                <b class="center-align-container">Type</b>
              </v-flex>
              <v-flex xs8 md10 lg11 class="vertical-align-parent">
                <b class="vertical-align-container">Description</b>
              </v-flex>
            </v-layout>
            <v-layout row>
              <v-flex xs12 class="pa-0">
                <v-divider/>
              </v-flex>
            </v-layout>
            <v-layout row v-for="(skill, index) in unit.feskills" :key="index" class="sp-table--row">
              <v-flex xs2 md2 lg1 class="vertical-align-parent">
                <v-checkbox class="vertical-align-container pl-1" hide-details :label="`${skill.skill.bp} SP`" :input-value="!!activeSkills[index]" @click="toggleSkill(index)"/>
              </v-flex>
              <v-flex xs2 md2 lg1 class="text-xs-center center-align-parent">
                <span class="center-align-container">
                  <sp-icon :category="skill.category"/>
                </span>
              </v-flex>
              <v-flex xs8 md10 lg11 class="text-xs-left">
                <v-layout row wrap>
                  <v-flex xs12 sm8 class="sp-table--row--description-col">
                    <div class="sp-table--row--description-col--desc-text">
                      <p class="ma-0">{{ skill.skill.desc || skill.skill.name }}</p>
                      <i v-if="skill.dependency">
                        {{ getDependencyText(skill) }}
                      </i>
                    </div>
                  </v-flex>
                  <v-flex xs12 sm4 class="text-xs-right">
                    <v-btn block v-if="!showTables.includes(index)" flat @click="showTables.push(index)">Show Data</v-btn>
                    <v-btn block v-else flat @click="showTables = showTables.filter(elem => elem !== index)">Hide Data</v-btn>
                  </v-flex>
                </v-layout>
                <v-slide-y-transition>
                  <div v-show="showTables.includes(index)">
                    <buff-list :effects="getBuffList(skill)"/>
                  </div>
                </v-slide-y-transition>
              </v-flex>
            </v-layout>
          </v-container>
        </v-tab-item>
        <v-tab-item key="share">
          <v-container fluid>
            <v-layout row wrap>
              <v-flex xs12 md6>
                <v-checkbox v-model="copyName" label="Add Unit Name" hide-details/>
              </v-flex>
              <v-flex xs12 md6>
                <v-checkbox v-model="copyBullets" label="Add Bullet Points" hide-details/>
              </v-flex>
            </v-layout>
            <v-layout row>
              <text-viewer :input-text="sharedText" :change-view="`${activeTab}-${copyName}-${copyBullets}`"/>
            </v-layout>
          </v-container>
        </v-tab-item>
        <v-tab-item key="json">
          <json-viewer :json="unit.feskills" :change-view="activeTab"/>
        </v-tab-item>
      </v-tabs-items>
    </v-card-text>
  </v-card>
</template>

<script>
import JsonViewer from '@/components/Multidex/JsonViewer';
import TextViewer from '@/components/Multidex/TextViewer';
import BuffList from '@/components/Multidex/EffectList/MainTable';
import SPIcon from '@/components/Multidex/Units/SPIcon';
import debounce from 'lodash/debounce';

export default {
  props: ['unit'],
  components: {
    'json-viewer': JsonViewer,
    'text-viewer': TextViewer,
    'buff-list': BuffList,
    'sp-icon': SPIcon,
  },
  computed: {
    feskillSum () {
      if (!this.unit.feskills) {
        return 0;
      }
      return this.unit.feskills
        .map(s => s.skill.bp)
        .reduce((acc, val) => acc + val, 0);
    },
    overallState () {
      if (this.activeSkillSum === this.feskillSum) {
        return 'all';
      } else if (this.activeSkillSum === 0) {
        return 'none';
      } else {
        return 'some';
      }
    },
  },
  data () {
    return {
      activeSkills: {},
      activeTab: '',
      activeSkillSum: 0,
      showTables: [],
      sharedText: '',
      copyName: false,
      copyBullets: false,
    };
  },
  watch: {
    copyName () {
      this.computeSharedText();
    },
    copyBullets () {
      this.computeSharedText();
    },
  },
  mounted () {
    this.toggleSkill(0, false);
  },
  methods: {
    toggleOverallState () {
      if (this.overallState === 'all') {
        Object.keys(this.activeSkills)
          .forEach(key => {
            this.toggleSkill(key, false);
          });
      } else {
        Object.keys(this.unit.feskills)
          .forEach((s, i) => {
            this.toggleSkill(i, true);
          });
      }
      // console.debug('toggling state', this.activeSkills);
    },
    toggleSkill (index, value) {
      this.activeSkills[index] = (value === undefined) ? !this.activeSkills[index] : !!value;
      const skill = this.unit.feskills[index];
      if (this.activeSkills[index] && skill.dependency) {
        this.checkSkillDependencyBoxes(skill);
      } else if (!this.activeSkills[index]) {
        this.uncheckSkillDependencyBoxes(skill);
      }
      this.computeActiveSum();
      this.computeSharedText();
    },
    computeSharedText: debounce(function () {
      const activeSkills = Object.keys(this.activeSkills)
        .filter(key => this.activeSkills[key]);
      if (activeSkills.length > 0) {
        const skills = activeSkills.map(key => this.unit.feskills[key])
          .map((skill) => {
            const cost = skill.skill.bp;
            const desc = skill.skill.desc || skill.skill.name;
            const bullet = this.copyBullets ? '* ' : '';
            return `${bullet}[${cost} SP] - ${desc}`;
          }).join('\n')
          .concat(`\n\nTotal: ${this.activeSkillSum} SP`);

        if (this.copyName) {
          this.sharedText = `${this.unit.name}\n\n`.concat(skills);
        } else {
          this.sharedText = skills;
        }
      } else {
        this.sharedText = 'No SP enhancements selected';
      }
    }, 50),
    computeActiveSum: debounce(function () {
      this.activeSkillSum = Object.keys(this.activeSkills)
        .filter(key => this.activeSkills[key])
        .map(key => this.unit.feskills[key].skill.bp)
        .reduce((acc, val) => acc + val, 0);
    }, 50),
    getSPSkillWithID (id) {
      let skillId = id;
      if (skillId.indexOf('@') > -1) {
        skillId = skillId.split('@')[1];
      }
      const result = this.unit.feskills
        .filter(s => s.id.toString() === skillId);

      return result[0];
    },
    getDependencyText (skill) {
      const spSkill = this.getSPSkillWithID(skill.dependency);

      if (spSkill) {
        return `Requires  "${spSkill.skill.desc}"`;
      }

      return skill['dependency comment'] || 'Requires another enhancement';
    },
    // check all boxes current skill requires
    checkSkillDependencyBoxes (skill) {
      const dependentSkill = this.getSPSkillWithID(skill.dependency);
      // console.debug({ dependentSkill });
      this.unit.feskills.forEach((s, i) => {
        if (s.id === dependentSkill.id) {
          this.toggleSkill(i, true);
          if (s.dependency) {
            this.checkSkillDependencyBoxes(s);
          }
        }
      });
    },
    uncheckSkillDependencyBoxes (skill) {
      const activeDependencySkills = Object.keys(this.activeSkills)
        .filter(key => this.activeSkills[key])
        .map(key => this.unit.feskills[key])
        .filter(s => s.dependency && s.dependency.indexOf(skill.id) > -1);

      const activeDependencySkillIDs = activeDependencySkills.map(s => s.id);
      this.unit.feskills.forEach((s, i) => {
        if (activeDependencySkillIDs.indexOf(s.id) > -1) {
          this.toggleSkill(i, false);
        }
      });
      activeDependencySkills.forEach(this.uncheckSkillDependencyBoxes);
    },
    getBuffList (skill) {
      const buffs = [];
      skill.skill.effects.forEach(e => {
        Object.keys(e).forEach(type => {
          const effect = e[type];
          buffs.push({ sp_type: type, ...effect });
        });
      });
      return buffs;
    },
  },
};
</script>

<style>
.theme--dark .sp-table--row:nth-child(even) {
  background-color: var(--border-color-dark);
}

.theme--light .sp-table--row:nth-child(even) {
  background-color: var(--border-color-light);
}

.sp-table--row .checkbox label{
  text-overflow: initial;
  overflow-x: visible;
}

@media screen and (min-width: 600px) {
  .sp-table--row--description-col {
    position: relative;
  }

  .sp-table--row--description-col--desc-text {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
