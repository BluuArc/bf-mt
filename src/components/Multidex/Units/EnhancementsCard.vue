<template>
  <description-card-base
    :entry="feSkills"
    materialColor="light-green darken-3"
    :titleHtmlGenerator="() => `SP Enhancements`"
    :tabNames="['Table', 'Share Build', 'JSON', 'Buff List']"
    :treeOptions="{ maxDepth: 1 }">
    <template slot="title">
      <v-layout row wrap class="d-align-items-center">
        <v-flex xs9 class="text-xs-left">
          <card-title-with-link titleHtml="SP Enhancements"/>
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
            />
          </v-flex>
          <v-flex xs3 md1 class="text-xs-center">
            {{ skillEntry.category }}
          </v-flex>
          <v-flex xs7 md9 lg10>
            <v-layout row wrap class="d-align-items-center">
              <v-flex xs12 sm8>
                <span class="d-block">
                  <b>{{ String.fromCharCode(65 + index) }}: </b>
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
          </v-flex>
        </v-layout>
      </v-container>
      <span v-else>No SP data found.</span>
    </template>
  </description-card-base>
</template>

<script>
import DescriptionCardBase from '@/components/Multidex/DescriptionCardBase';
import CardTitleWithLink from '@/components/CardTitleWithLink';

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
  },
  data () {
    return {
      activeSkills: {},
      activeSkillSum: 0,
      showTables: [],
      sharedText: '',
      copyName: false,
      copyBullets: false,
    };
  },
  methods: {
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
  }
};
</script>

<style lang="less">
.sp-table {
  --table-border-color: var(--background-color-alt);
  --table-background-color: var(--background-color-alt--lighten-1);
  --table-border-settings: 1px solid var(--table-border-color);

  .v-input--checkbox {
    margin-top: 0;
    padding-left: 8px;

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
