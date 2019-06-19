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
      <sp-build-table
        v-if="feSkills"
        v-model="activeEnhancements"
        :feSkills="feSkills"/>
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
          <v-flex xs12 sm6 md4>
            <v-checkbox v-model="useWikiTemplate" label="Use Wiki SP Build Template" hide-details/>
          </v-flex>
        </v-layout>
        <v-layout row>
          <v-flex>
            <text-viewer
              :inputText="sharedText"
              :value="activeTabIndex"
            />
          </v-flex>
        </v-layout>
      </v-container>
    </template>
  </description-card-base>
</template>

<script>
import DescriptionCardBase from '@/components/Multidex/DescriptionCardBase';
import CardTitleWithLink from '@/components/CardTitleWithLink';
import TextViewer from '@/components/TextViewer';
import SpBuildTable from '@/components/Multidex/Units/SpBuildTable';
import {
  getSpEntryEffects,
  spCodeToIndex,
  getSpDescription,
  getSpCost,
} from '@/modules/core/units';
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
    TextViewer,
    SpBuildTable,
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
    titleHtml () {
      const enhancements = this.$route.query.enhancements;
      return ['SP Enhancments', enhancements ? `(${enhancements})` : '']
        .filter(val => val)
        .join(' ');
    },
    allEffects () {
      return !this.feSkills ? [] : this.feSkills
        .map(s => getSpEntryEffects(s))
        .reduce((acc, val) => acc.concat(val), []);
    },
  },
  data () {
    return {
      sharedText: 'No SP enhancements selected',
      copyName: false,
      copyBullets: false,
      copyCode: false,
      activeEnhancements: '',
      useWikiTemplate: false,
    };
  },
  methods: {
    computeSharedText: debounce(function () {
      if (this.useWikiTemplate) {
        const spEntries = [];
        let totalSpCost = 0;
        if (this.activeEnhancements) {
          this.activeEnhancements.split('')
            .forEach(code => {
              const spEntry = this.feSkills[spCodeToIndex(code)];
              spEntries.push({
                description: getSpDescription(spEntry),
                cost: spEntry.skill.bp,
                code, // not currently used in output, but may be used in the future
              });
            });
          totalSpCost = getSpCost(this.feSkills, this.activeEnhancements);
        }

        const lines = [
          {
            name: 'build_name',
            value: `${this.unit.name} build`,
          },
          {
            name: 'element',
            value: this.unit.element
              ? `${this.unit.element[0].toUpperCase()}${this.unit.element.slice(1)}`
              : '',
          },
          {
            name: 'total_sp',
            value: totalSpCost,
          },
          {
            name: 'author',
          },
          ...spEntries.map((entry, i) => [
            {
              name: `sp_cost_${i + 1}`,
              value: entry.cost,
            },
            {
              name: `spskill_${i + 1}`,
              value: entry.description,
            },
          ]).reduce((acc, val) => acc.concat(val), []),
          {
            name: 'analysis',
          },
          {
            name: 'last_updated',
            value: new Date().toDateString(),
          },
        ];

        const expectedLength = lines.reduce((acc, val) => Math.max(acc, val.name.length), 1) + 4; // length of longest name + 4 spaces
        this.sharedText = [
          '{{Build',
          ...lines.map(entry => `|${entry.name.padEnd(expectedLength, ' ')} = ${entry.value !== undefined ? entry.value : ''}`),
          '}}',
        ].join('\n');
      } else {
        if (this.activeEnhancements) {
          const skills = this.activeEnhancements.split('')
            .map(code => {
              const spEntry = this.feSkills[spCodeToIndex(code)];
              const cost = spEntry.skill.bp;
              const desc = getSpDescription(spEntry);
              const bullet = this.copyBullets ? '* ' : '';
              const outputCode = this.copyCode ? `${code}: ` : '';
              return `${bullet}[${cost} SP] - ${outputCode}${desc}`;
            }).join('\n')
            .concat(`\n\nTotal: ${getSpCost(this.feSkills, this.activeEnhancements)} SP`);

          if (this.copyName) {
            this.sharedText = `${this.unit.name}\n\n`.concat(skills);
          } else {
            this.sharedText = skills;
          }
        } else {
          this.sharedText = 'No SP enhancements selected';
        }
      }
    }, 50),
    syncLocalEnhancementsToUrl: debounce(function () {
      this.$router.replace({
        path: this.$route.path,
        query: {
          ...this.$route.query,
          enhancements: this.activeEnhancements || undefined,
        },
      });
    }, 500),
    syncUrlToLocalEnhancements () {
      this.logger.debug(this.$route.query);
      if (this.$route.query.enhancements) {
        this.activeEnhancements = this.$route.query.enhancements.slice();
      }
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
    useWikiTemplate () {
      this.computeSharedText();
    },
    activeEnhancements () {
      this.computeSharedText();
      this.syncLocalEnhancementsToUrl();
    },
  },
  mounted () {
    this.syncUrlToLocalEnhancements();
  },
};
</script>
