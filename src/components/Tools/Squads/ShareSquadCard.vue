<template>
  <v-card class="squad-card--share">
    <card-tabs-container :tabs="tabConfig" v-model="activeTabIndex">
      <v-layout
        :column="$vuetify.breakpoint.smAndDown"
        :row="$vuetify.breakpoint.mdAndUp"
        slot="markdown">
        <v-layout column wrap :style="{
          'max-width': $vuetify.breakpoint.mdAndUp ? '50%' : '100%',
          }">
          <v-layout row wrap>
            <v-flex xs12>
              <h2 class="title">
                Formatting
              </h2>
            </v-flex>
            <v-layout row align-center>
              <v-flex>
                <v-select
                  v-model="target"
                  :items="possibleTargets"
                  label="Platform"/>
              </v-flex>
              <v-flex style="flex-grow: 0;">
                <v-btn flat @click="setWithPreset">
                  Use Preset
                </v-btn>
              </v-flex>
            </v-layout>
            <v-flex xs12 sm6>
              <v-checkbox v-model="useBullets" label="Use Bulleted List"/>
            </v-flex>
          </v-layout>
          <v-divider class="mb-3"/>
          <v-layout row wrap>
            <v-flex xs12>
              <h2 class="title">
                Information
              </h2>
            </v-flex>
            <v-flex xs12 sm6>
              <v-checkbox v-model="showName" label="Squad Name"/>
            </v-flex>
            <v-flex xs12 sm6 v-if="sparkResult">
              <v-checkbox v-model="showTotalSparkability" :disabled="!showName" label="Total Spark Percentage"/>
            </v-flex>
            <v-flex xs12 sm6>
              <v-checkbox v-model="showPosition" label="Position"/>
            </v-flex>
            <v-flex xs12 sm6>
              <v-checkbox v-model="showOrder" label="BB Order"/>
            </v-flex>
            <v-flex xs12 sm6>
              <v-checkbox v-model="showAction" label="Action"/>
            </v-flex>
            <v-flex xs12 sm6 v-if="sparkResult">
              <v-checkbox v-model="showSparkStatisticsByUnit" label="Show Sparks per Unit"/>
            </v-flex>
            <v-flex xs12 sm6>
              <v-checkbox v-model="showExtraSkill" label="Extra Skill"/>
            </v-flex>
            <v-flex xs12 sm6>
              <v-checkbox v-model="showSpheres" label="Spheres"/>
            </v-flex>
            <v-flex xs12 sm6>
              <v-checkbox v-model="showEnhancements" label="SP Enhancements"/>
            </v-flex>
            <v-flex xs12 sm6>
              <v-checkbox v-model="abbreviate" label="Abbreviate Results"/>
            </v-flex>
            <v-flex xs12 sm6>
              <v-checkbox v-model="showSpCost" :disabled="abbreviate || !showEnhancements" label="SP Costs"/>
            </v-flex>
            <v-flex xs12 sm6>
              <v-checkbox v-model="showShareLink" label="Share Link"/>
            </v-flex>
          </v-layout>
        </v-layout>
        <v-flex>
          <text-viewer
            style="height: 100%;"
            :inputText="markdownText"
            :value="updateTime"/>
        </v-flex>
      </v-layout>
      <v-layout row slot="code">
        <one-line-text-viewer
          style="flex: 0 1 100%;"
          :inputText="squadShorthand"
          label="Code"
          :value="updateTime"
        />
      </v-layout>
      <v-layout row slot="link">
        <one-line-text-viewer
          style="flex: 0 1 100%;"
          :inputText="shareLink"
          label="Link"
          :value="updateTime"
        />
      </v-layout>
    </card-tabs-container>
    <v-divider/>
    <v-card-actions>
      <v-spacer/>
      <v-btn flat @click="$emit('back')">Back</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { spCodeToIndex, getSpDescription, getSpCost } from '@/modules/core/units';
import { squadToShorthand } from '@/modules/core/squads';
import { squadUnitActions, squadFillerMapping } from '@/modules/constants';
import CardTabsContainer from '@/components/CardTabsContainer';
import TextViewer from '@/components/TextViewer';
import OneLineTextViewer from '@/components/OneLineTextViewer';
import GettersMixin from '@/components/Tools/Squads/SynchronousGettersMixin';

export default {
  mixins: [GettersMixin],
  props: {
    squad: {
      type: Object,
      required: true,
    },
    sparkResult: {
      required: false,
    },
  },
  components: {
    CardTabsContainer,
    TextViewer,
    OneLineTextViewer,
  },
  computed: {
    tabConfig: () => ['markdown', 'code', 'link'].map(name => ({ name, slot: name })),
    copyableJson () {
      // don't need to share ID to export
      // eslint-disable-next-line no-unused-vars
      const { id, ...otherInfo } = this.squad;
      return otherInfo;
    },
    markdownText () {
      return this.squadToMarkdown(this.squad, this);
    },
    squadShorthand () {
      return squadToShorthand(this.squad);
    },
    shareLink () {
      const path = this.$router.resolve({ path: '/tools/squads/add', query: { import: this.squadShorthand }}).href;
      return `${location.protocol}//${location.host}${location.pathname}${path}`;
    },
    possibleTargets: () => ['Discord', 'Reddit'],
    sparkTextByUnit () {
      const mapping = new Map();
      if (this.sparkResult) {
        this.squad.units.forEach(unit => {
          const sparkUnitResult = this.sparkResult.squad.find(s => unit.position === s.position);
          if (sparkUnitResult) {
            mapping.set(unit, `(${sparkUnitResult.actualSparks}/${sparkUnitResult.possibleSparks})`);
          }
        });
      }
      return mapping;
    },
  },
  data () {
    return {
      activeTabIndex: 0,
      updateTime: new Date(), // used to reset copy text
      showPosition: false,
      showAction: false,
      showOrder: false,
      showName: false,
      useBullets: false,
      abbreviate: false,
      showSpCost: false,
      showShareLink: false,
      showExtraSkill: false,
      showSpheres: false,
      showEnhancements: false,
      showSparkStatisticsByUnit: true,
      showTotalSparkability: true,
      target: 'Discord',
    };
  },
  mounted () {
    this.setWithPreset();
  },
  methods: {
    squadToMarkdown (
      squad = {},
      {
        showPosition = true,
        showAction = true,
        showOrder = true,
        showName = false,
        useBullets = true,
        abbreviate = false,
        showSpCost = true,
        showShareLink = false,
        showExtraSkill = false,
        showSpheres = false,
        showEnhancements = true,
        showSparkStatisticsByUnit = true,
        showTotalSparkability = true,
      } = {},
    ) {
      const sections = [];

      if (showName) {
        const nameLine = [
          `${squad.name}`,
          showTotalSparkability && this.sparkResult && (`(${(this.sparkResult.weightedPercentage * 100).toFixed(2)}%)`),
        ].filter(v => v).join(' ');
        sections.push(`# ${nameLine}\n`);
      }

      squad.units.forEach((unit, i) => {
        const entry = [];
        let prefix = useBullets ? '*' : '';
        const isFillerUnit = unit.id === squadFillerMapping.ANY || unit.id === squadFillerMapping.EMPTY;
        // name, position, BB order and type
        entry.push([
          prefix,
          isFillerUnit && `**__${this.getUnit(unit.id).name || unit.id}__**`,
          !isFillerUnit && [
            `**__${this.getUnit(unit.id).rarity && `${this.getUnit(unit.id).rarity === 8 ? 'OE' : `${this.getUnit(unit.id).rarity}\\*`}`}`,
            `${this.getUnit(unit.id).name || unit.id}__**`,
            ].join(' '),
          i === squad.lead && `**(${abbreviate ? 'L' : 'Leader'})**`,
          i === squad.friend && `**(${abbreviate ? 'F' : 'Friend'})**`,
          (showPosition || showOrder || showAction) && '-',
          [
            showPosition && unit.position,
            [showOrder && unit.bbOrder, showAction && this.getActionText(unit)].filter(v => v).join('-'),
          ].filter(v => v).join('; '),
          showSparkStatisticsByUnit && this.sparkTextByUnit.get(unit),
        ].filter(v => v).join(' '));

        // indent one level for supplementary info
        if (useBullets) {
          prefix = '\t*';
        }

        if (showExtraSkill && unit.es) {
          entry.push([
            prefix,
            `**${abbreviate ? 'ES' : 'Extra Skill'}:**`,
            this.getExtraSkill(unit.es).name || unit.es,
          ].filter(v => v).join(' '));
        }

        if (showSpheres && Array.isArray(unit.spheres) && unit.spheres.length > 0) {
          entry.push([
            prefix,
            '**Spheres:**',
            unit.spheres.map(id => this.getItem(id).name || id).join(', '),
          ].filter(v => v).join(' '));
        }

        if (showEnhancements && unit.sp && this.getSpCost(unit) > 0) {
          entry.push([
            prefix,
            `**SP Enhancements (${this.getSpCost(unit)} SP):**`,
            abbreviate && unit.sp,

            // convert SP code to list of SP options
            !abbreviate && ['\n', this.getSpText(unit).map(skill => [
              `\t${useBullets ? `${prefix} ` : ''}`,
              showSpCost && `[${skill.cost} SP] - `,
              `**${skill.code}:** ${skill.text}`,
            ].filter(v => v).join('')).join('\n')].join(''),
          ].filter(v => v).join(' '));
        }

        sections.push(`${entry.join('\n')}\n`);
      });

      if (showShareLink) {
        const linkText = this.target === 'Reddit'
          ? `[Save Squad](${this.shareLink}})`
          : `Save Squad: ${this.shareLink}`;
        sections.push(linkText);
      }

      return sections.join('\n');
    },
    getActionText (unit = {}) {
      // default to SBB or below (depending on if the unit has it)
      const action = unit.action ||
        (this.getUnit(unit.id).sbb && squadUnitActions.SBB) ||
        (this.getUnit(unit.id).bb && squadUnitActions.BB) ||
        (squadUnitActions.ATK);
      return action.toUpperCase();
    },
    getSpCost (unit = {}) {
      const feSkills = this.getUnit(unit.id).feskills;
      const enhancements = unit.sp;
      return getSpCost(feSkills, enhancements);
    },
    getSpText (unit) {
      const feSkills = this.getUnit(unit.id).feskills;
      const enhancements = unit.sp;
      if (!feSkills || !enhancements) {
        return [];
      }

      return enhancements.split('')
        .map(char => ({
          code: char,
          skill: feSkills[spCodeToIndex(char)],
        }))
        .filter(v => v.skill) // only get valid skills
        .map(v => ({
          code: v.code,
          text: getSpDescription(v.skill),
          cost: v.skill.skill.bp,
        }));
    },
    setWithPreset () {
      // shared settings
      this.showOrder = true;
      this.abbreviate = false;
      this.showSpCost = true;
      this.showShareLink = true;
      this.showExtraSkill = true;
      this.showSpheres = true;
      this.showEnhancements = true;
      this.showPosition = true;
      this.showAction = true;

      // individual settings
      this.showName = this.target === 'Discord';
      this.useBullets = this.target === 'Reddit';
    },
  },
  watch: {
    markdownText () {
      this.updateTime = new Date();
    },
    activeTabIndex () {
      this.updateTime = new Date();
    },
  },
};
</script>

<style lang="less">
.squad-card--share {
  .v-card__actions {
    position: sticky;
    bottom: 0;
    background-color: inherit;

    a:not(:hover):before {
      background-color: inherit;
    }
  }
}
</style>
