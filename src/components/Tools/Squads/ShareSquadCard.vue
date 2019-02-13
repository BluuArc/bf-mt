<template>
  <v-card>
    <card-tabs-container :tabs="tabConfig" v-model="activeTabIndex">
      <v-layout column slot="markdown">
        <v-layout row>
          Options here
        </v-layout>
        <v-flex>
          <text-viewer :inputText="markdownText" :value="activeTabIndex"/>
        </v-flex>
      </v-layout>
      <v-layout row slot="json">
        <json-viewer :json="copyableJson" :value="activeTabIndex"/>
      </v-layout>
    </card-tabs-container>
    <v-card-actions>
      <v-btn flat>Copy</v-btn>
      <v-spacer/>
      <v-btn flat @click="$emit('back')">Back</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import CardTabsContainer from '@/components/CardTabsContainer';
import TextViewer from '@/components/TextViewer';
import JsonViewer from '@/components/JsonViewer';
import { spCodeToIndex } from '@/modules/core/units';

export default {
  props: {
    squad: {
      type: Object,
      required: true,
    },
    getUnit: {
      type: Function,
      default: () => ({}),
    },
    getItem: {
      type: Function,
      default: () => ({}),
    },
    getExtraSkill: {
      type: Function,
      default: () => ({}),
    },
  },
  components: {
    CardTabsContainer,
    TextViewer,
    JsonViewer,
  },
  computed: {
    tabConfig: () => ['markdown', 'json'].map(name => ({ name, slot: name })),
    copyableJson () {
      // don't need to share ID to export
      // eslint-disable-next-line no-unused-vars
      const { id, ...otherInfo } = this.squad;
      return otherInfo;
    },
    markdownText () {
      return this.squadToMarkdown(this.squad);
    },
  },
  data () {
    return {
      activeTabIndex: 0,
    };
  },
  methods: {
    squadToMarkdown (
      squad = {},
      {
        showOrder = true,
        showName = false,
        useBullets = true,
        abbreviate = false,
        showSpCost = true,
        // TODO: have link to add it to their own version?
      } = {},
    ) {
      const sections = [];

      if (showName) {
        sections.push(`# ${squad.name}\n`);
      }

      squad.units.forEach((unit, i) => {
        const entry = [];
        let prefix = useBullets ? '*' : '';
        
        // name, position, BB order and type
        entry.push([
          prefix,
          this.getUnit(unit.id).rarity && `${this.getUnit(unit.id).rarity === 8 ? 'OE' : `${this.getUnit(unit.id).rarity}\\*`}`,
          this.getUnit(unit.id).name || unit.id,
          i === squad.lead && `**(${abbreviate ? 'L' : 'Leader'})**`,
          i === squad.friend && `**(${abbreviate ? 'F' : 'Friend'})**`,
          `- ${unit.position}${showOrder ? ';' : ''}`,
          showOrder && `${unit.bbOrder}-${this.getBbTypeText(unit)}`,
        ].filter(v => v).join(' '));

        // indent one level for supplementary info
        if (useBullets) {
          prefix = '\t*';
        }

        if (unit.es) {
          entry.push([
            prefix,
            `**${abbreviate ? 'ES' : 'Extra Skill'}:**`,
            this.getExtraSkill(unit.es).name || unit.es,
          ].filter(v => v).join(' '));
        }

        if (Array.isArray(unit.spheres) && unit.spheres.length > 0) {
          entry.push([
            prefix,
            '**Spheres:**',
            ...unit.spheres.map(id => this.getItem(id).name || id),
          ].filter(v => v).join(' '));
        }

        if (unit.sp && this.getSpCost(unit) > 0) {
          entry.push([
            prefix,
            `**SP Enhancements (${this.getSpCost(unit)} SP):`,
            abbreviate && unit.sp,
            !abbreviate && '\n',
            !abbreviate && this.getSpText(unit).map(skill => [
              `\t${prefix}`,
              showSpCost && `[${skill.cost} SP] -`,
              `**${skill.code}:** ${skill.text}`,
            ].filter(v => v).join(' ')).join('\n'),
          ].filter(v => v).join(' '));
        }

        sections.push(entry.join('\n'));
      });

      return sections.join('\n');
    },
    getBbTypeText (unit = {}) {
      const bbType = unit.bbType ||
        (this.getUnit(unit.id).sbb && 'sbb') ||
        (this.getUnit(unit.id).bb && 'bb') ||
        ('natk');
      return bbType.toUpperCase();
    },
    getSpCost (unit = {}) {
      const feSkills = this.getUnit(unit.id).feskills;
      const enhancements = unit.sp;
      if (!feSkills || !enhancements) {
        return 0;
      }
      return enhancements.split('')
        .map(char => feSkills[spCodeToIndex(char)])
        .filter(v => v)
        .reduce((acc, s) => acc + +s.skill.bp, 0);
    },
    getSkillDescription (skillEntry) {
      const { desc = '', name = '' } = skillEntry.skill;
      if (desc.trim() === name.trim()) {
        return desc || 'No Description';
      } else {
        return (desc.length > name.length) ? desc : [name, desc ? `(${desc})` : ''].filter(val => val).join(' ');
      }
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
          text: this.getSkillDescription(v.skill),
          cost: v.skill.skill.bp,
        }));
    },
  },
};
</script>

