<template>
  <description-card-base
    :entry="feSkills"
    materialColor="light-green darken-3"
    :tabNames="['Table', 'Share Build', 'JSON', 'Buff List']"
    :effectGetter="() => allEffects"
    :treeOptions="{ maxDepth: 1 }">
    <template slot="title">
      <v-layout row wrap class="d-align-items-center">
        <v-flex xs9 class="text-xs-left" style="word-break: break-word;">
          <card-title-with-link :titleHtml="titleHtml"/>
        </v-flex>
        <v-flex xs3 class="text-xs-right body-1">
          <span>{{ allEnhancementsSum }} SP</span>
        </v-flex>
      </v-layout>
    </template>
    <template slot="table">
      <v-container fluid class="pa-0 sp-table" v-if="feSkills">
        <v-layout row class="sp-table--headers d-align-items-center">
          <v-flex xs2 lg1>
            <v-checkbox
              :label="`${activeSkillSum} SP`"
              :input-value="overallState === 'all'"
              :indeterminate="overallState === 'some'"
              @click.native="toggleOverallState"
              hide-details
            />
          </v-flex>
          <v-flex xs3 md1 class="text-xs-center">
            Type
          </v-flex>
          <v-flex xs7 md9 lg10>
            Description
          </v-flex>
        </v-layout>
        <v-layout
          v-for="(skillEntry, index) in feSkills"
          :key="index"
          class="sp-table--row d-align-items-center">
          <v-flex xs2 lg1>
            <v-checkbox
              :label="`${skillEntry.skill.bp} SP`"
              :input-value="!!activeSkills[index]"
              @click.native="toggleSkill(index)"
            />
          </v-flex>
          <v-flex xs3 md1 class="text-xs-center">
            <sp-icon :category="+skillEntry.category" :displaySize="24"/>
          </v-flex>
          <v-flex xs7 md9 lg10>
            <v-layout row wrap class="d-align-items-center">
              <v-flex xs12 sm8>
                <span class="d-block">
                  <b>{{ spIndexToCode(index) }}: </b>
                  {{ getSkillDescription(skillEntry) }}
                </span>
                <i v-if="skillEntry.dependency">
                  {{ getDependencyText(skillEntry) }}
                </i>
              </v-flex>
              <v-flex xs12 sm4 class="text-xs-right">
                <v-btn
                  v-if="!showTables.includes(index)"
                  block flat
                  @click="showTables.push(index)">
                  Show Data
                </v-btn>
                <v-btn
                  v-else
                  block flat
                  @click="showTables = showTables.filter(elem => elem !== index)">
                  Hide Data
                </v-btn>
              </v-flex>
            </v-layout>
            <v-slide-y-transition>
              <div v-show="showTables.includes(index)">
                <!-- lazily render buff table once -->
                <buff-table v-if="showTables.includes(index) || effectCache[skillEntry.id]" :effects="getSkillEffects(skillEntry)" :showHeaders="true"/>
              </div>
            </v-slide-y-transition>
          </v-flex>
        </v-layout>
      </v-container>
      <span v-else>No SP data found.</span>
    </template>
    <template slot="share-build" slot-scope="{ activeTabIndex }">
      <v-container fluid>
        <v-layout row wrap>
          <v-flex xs12 sm6 md4>
            <v-checkbox v-model="copyName" label="Unit Name" hide-details/>
          </v-flex>
          <v-flex xs12 sm6 md4>
            <v-checkbox v-model="copyBullets" label="Bullet Points" hide-details/>
          </v-flex>
          <v-flex xs12 sm6 md4>
            <v-checkbox v-model="copyCode" label="Letter Code" hide-details/>
          </v-flex>
        </v-layout>
        <v-layout row>
          <v-flex>
            <text-viewer :inputText="sharedText" :value="activeTabIndex"/>
          </v-flex>
        </v-layout>
      </v-container>
    </template>
  </description-card-base>
</template>

<script>
import DescriptionCardBase from '@/components/Multidex/DescriptionCardBase';
import CardTitleWithLink from '@/components/CardTitleWithLink';
import SpIcon from '@/components/Multidex/Units/SpIcon';
import BuffTable from '@/components/Multidex/BuffTable/MainTable';
import TextViewer from '@/components/TextViewer';
import { getSpSkillEffects, spIndexToCode, spCodeToIndex } from '@/modules/core/units';
import debounce from 'lodash/debounce';

export default {
  props: {
    unit: {
      type: Object,
    },
    logger: {
      required: true,
    },
  },
  components: {
    DescriptionCardBase,
    CardTitleWithLink,
    SpIcon,
    BuffTable,
    TextViewer,
  },
  computed: {
    feSkills () {
      return this.unit && this.unit.feskills;
    },
    allEnhancementsSum () {
      if (!this.feSkills) {
        return 0;
      }

      return this.feSkills.map(s => s.skill.bp)
        .reduce((acc, val) => acc + val, 0);
    },
    overallState () {
      if (this.activeSkillSum === this.allEnhancementsSum) {
        return 'all';
      } else if (this.activeSkillSum === 0) {
        return 'none';
      } else {
        return 'some';
      }
    },
    titleHtml () {
      const enhancements = this.$route.query.enhancements;
      return ['SP Enhancments', enhancements ? `(${enhancements})` : ''].filter(val => val).join(' ');
    },
    allEffects () {
      return !this.feSkills ? [] : this.feSkills
        .map(s => this.getSkillEffects(s, false))
        .reduce((acc, val) => acc.concat(val), []);
    },
  },
  data () {
    return {
      activeSkills: {},
      activeSkillSum: 0,
      showTables: [],
      sharedText: 'No SP enhancements selected',
      copyName: false,
      copyBullets: false,
      copyCode: false,
      effectCache: {},
    };
  },
  methods: {
    spIndexToCode,
    getSPSkillWithID (id) {
      let skillId = id;
      if (skillId.indexOf('@') > -1) {
        skillId = skillId.split('@')[1];
      }
      const result = this.feSkills.filter(s => s.id.toString() === skillId);
      return result[0];
    },
    getSkillDescription (skillEntry) {
      const { desc = '', name = '' } = skillEntry.skill;
      if (desc.trim() === name.trim()) {
        return desc || 'No Description';
      } else {
        return (desc.length > name.length) ? desc : [name, desc ? `(${desc})` : ''].filter(val => val);
      }
    },
    getDependencyText (skillEntry) {
      const dependentSkillEntry = this.getSPSkillWithID(skillEntry.dependency);

      if (dependentSkillEntry) {
        return `Requires "${dependentSkillEntry.skill.desc}"`;
      }

      return skillEntry['dependency comment'] || 'Requires another enhancement';
    },
    getSkillEffects (skillEntry, cacheResult = true) {
      if (this.effectCache[skillEntry.id]) {
        return this.effectCache[skillEntry.id];
      }
      const effects = getSpSkillEffects(skillEntry);
      // use cacheResult boolean to not prematurely render tables when getting allEffects data
      if (cacheResult) {
        this.effectCache[skillEntry.id] = effects;
      }
      return effects;
    },
    toggleOverallState () {
      if (this.overallState === 'all') {
        Object.keys(this.activeSkills)
          .forEach(key => {
            this.toggleSkill(key, false);
          });
      } else {
        Object.keys(this.feSkills)
          .forEach((s, i) => {
            this.toggleSkill(i, true);
          });
      }
    },
    toggleSkill (index, value) {
      this.activeSkills[index] = (value === undefined) ? !this.activeSkills[index] : !!value;
      const skill = this.feSkills[index];
      if (this.activeSkills[index] && skill.dependency) {
        this.checkSkillDependencyBoxes(skill);
      } else if (!this.activeSkills[index]) {
        this.uncheckSkillDependencyBoxes(skill);
      }
      this.computeActiveSum();
      this.computeSharedText();
      this.syncLocalEnhancementsToUrl();
    },
    computeSharedText: debounce(function () {
      const activeSkills = Object.keys(this.activeSkills)
        .filter(key => this.activeSkills[key]);
      if (activeSkills.length > 0) {
        const skills = activeSkills.map(key => ({ skillEntry: this.feSkills[key], index: +key }))
          .map(({skillEntry, index }) => {
            const cost = skillEntry.skill.bp;
            const desc = this.getSkillDescription(skillEntry);
            const bullet = this.copyBullets ? '* ' : '';
            const code = this.copyCode ? `${spIndexToCode(index)}: ` : '';
            return `${bullet}[${cost} SP] - ${code}${desc}`;
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
        .map(key => this.feSkills[key].skill.bp)
        .reduce((acc, val) => acc + val, 0);
    }, 50),
    syncLocalEnhancementsToUrl: debounce(function () {
      const enhancements = Object.keys(this.activeSkills)
        .filter(key => this.activeSkills[key])
        .map(key => spIndexToCode(+key))
        .join('');

      this.$router.replace({
        path: this.$route.path,
        query: {
          ...this.$route.query,
          enhancements: enhancements || undefined,
        },
      });
    }, 500),
    syncUrlToLocalEnhancements () {
      this.logger.debug(this.$route.query);
      if (this.$route.query.enhancements) {
        const enhancements = this.$route.query.enhancements.slice()
          .split('').map(char => spCodeToIndex(char));
        enhancements.forEach(index => {
          if (index >= 0 && index < this.feSkills.length) {
            this.toggleSkill(index, true);
          } else {
            this.logger.warn('ignoring invalid index', index);
          }
        });
      }
    },
    // check all boxes current skill requires
    checkSkillDependencyBoxes (skill) {
      const dependentSkill = this.getSPSkillWithID(skill.dependency);
      // console.debug({ dependentSkill });
      this.feSkills.forEach((s, i) => {
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
        .map(key => this.feSkills[key])
        .filter(s => s.dependency && s.dependency.indexOf(skill.id) > -1);

      const activeDependencySkillIDs = activeDependencySkills.map(s => s.id);
      this.feSkills.forEach((s, i) => {
        if (activeDependencySkillIDs.indexOf(s.id) > -1) {
          this.toggleSkill(i, false);
        }
      });
      activeDependencySkills.forEach(this.uncheckSkillDependencyBoxes);
    },
  },
  watch: {
    copyName () {
      this.computeSharedText();
    },
    copyBullets () {
      this.computeSharedText();
    },
    copyCode () {
      this.computeSharedText();
    },
  },
  mounted () {
    this.syncUrlToLocalEnhancements();
  },
};
</script>

<style lang="less">
.sp-table {
  --table-border-color: var(--background-color-alt);
  --table-background-color: var(--background-color-alt--lighten-1);
  --table-border-settings: 1px solid var(--table-border-color);

  .v-input--checkbox {
    margin-top: 0;
    padding-left: 4px;

    .v-input__slot {
      margin-bottom: 0;
    }

    .v-messages {
      display: none;
    }
  }

  .sp-table--headers {
    font-weight: bold;
    border-bottom: var(--table-border-settings);
  }

  .sp-table--row {
    padding-top: 8px;
    padding-bottom: 8px;
    padding-right: 8px;
    &:nth-child(odd) {
      background-color: var(--table-border-color);
    }
  }
}
</style>
