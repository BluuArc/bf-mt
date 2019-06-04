<template>
  <section class="squad-multidex-links">
    <dl>
      <template v-for="unit in fullUnits">
        <dt
          class="title mt-3 mb-2"
          :key="`${unitKeyBySquadEntry.get(unit)}-title`"
          v-text="titleBySquadEntry.get(unit)"
        />
        <dd :key="`${unitKeyBySquadEntry.get(unit)}-links`">
          <v-layout row wrap>
            <!-- <div :key="i">{{ linksBySquadEntry.get(unit) }}</div> -->
            <v-flex
              v-for="(entry, i) in linksBySquadEntry.get(unit)"
              :key="i"
              xs12 sm6
              class="pa-2"
            >
              <component
                :is="getComponentNameFromEntry(entry)"
                :entry="getDataForEntry(entry)"
                :to="generateMultidexPathToEntry(entry)"
                :sp="entry.sp"
              >
                {{ entry }}
              </component>
              <!-- <router-link :to="generateMultidexPathToEntry(entry)">
                {{ entry }}
              </router-link> -->
            </v-flex>
          </v-layout>
        </dd>
      </template>
    </dl>
  </section>
</template>

<script>
import { getMultidexParamsForSquadUnit, generateFillerSquadUnitEntry } from '@/modules/core/squads';
import { unitPositionMapping, multidexModuleInfo } from '@/modules/constants';
import GettersMixin from '@/components/Tools/Squads/SynchronousGettersMixin';
import UnitEntryCard from '@/components/Multidex/Units/EntryCard';
import ExtraSkillEntryCard from '@/components/Multidex/ExtraSkills/EntryCard';
import ItemEntryCard from '@/components/Multidex/Items/EntryCard';

export default {
  mixins: [GettersMixin],
  props: {
    squad: {
      type: Object,
      required: true,
    },
  },
  components: {
    UnitEntryCard,
    ExtraSkillEntryCard,
    ItemEntryCard,
  },
  computed: {
    // fills empty positions with empty values
    fullUnits () {
      return unitPositionMapping.map(position => {
        let unit = this.squad.units.find(unit => unit.position === position);
        if (!unit) { // empty position, so fill it with empty data
          unit = generateFillerSquadUnitEntry({ isEmpty: true, bbOrder: null, position });
        }

        return unit;
      });
    },
    linksBySquadEntry () {
      const mapping = new WeakMap();
      this.fullUnits.forEach(unit => {
        mapping.set(unit, getMultidexParamsForSquadUnit(unit));
      });
      return mapping;
    },
    unitKeyBySquadEntry () {
      const mapping = new WeakMap();
      this.fullUnits.forEach((unit, i) => {
        mapping.set(unit, `${JSON.stringify(unit)}-${i}`);
      });
      return mapping;
    },
    titleBySquadEntry () {
      const mapping = new WeakMap();
      this.fullUnits.forEach(unit => {
        const unitData = this.getUnit(unit.id) || {};
        const title = `${unitData.name || unitData.id || unit.id} (${unit.position})`;
        mapping.set(unit, title);
      });
      return mapping;
    },
    multidexPathGetters () {
      const { getters } = this.$store;
      return multidexModuleInfo.reduce((acc, { name }) => {
        acc[name] = getters[`${name}/getMultidexPathTo`];
        return acc;
      }, {});
    },
  },
  methods: {
    generateMultidexPathToEntry ({ moduleName, id, sp } = {}) {
      const urlGenerator = this.multidexPathGetters[moduleName] || (id => `/multidex/${moduleName}/?server=${this.$store.state.settings.activeServer}&viewId=${id}`);
      const initialUrl = urlGenerator(id);
      return (sp && sp.length > 0)
        ? `${initialUrl}&enhancements=${sp}`
        : initialUrl;
    },
    getComponentNameFromEntry ({ moduleName } = {}) {
      let componentName = 'router-link';
      if (moduleName === 'units') {
        componentName = 'unit-entry-card';
      } else if (moduleName === 'extraSkills') {
        componentName = 'extra-skill-entry-card';
      } else if (moduleName === 'items') {
        componentName = 'item-entry-card';
      }
      return componentName;
    },
    getDataForEntry ({ moduleName, id } = {}) {
      let data = { id };
      if (moduleName === 'units') {
        data = this.getUnit(id) || data;
      } else if (moduleName === 'extraSkills') {
        data = this.getExtraSkill(id) || data;
      } else if (moduleName === 'items') {
        data = this.getItem(id) || data;
      }
      return data;
    },
  },
};
</script>

<style>

</style>
