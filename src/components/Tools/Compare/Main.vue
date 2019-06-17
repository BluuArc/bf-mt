<template>
  <promise-wait :promise="dbLoadPromise" loadingMessage="Loading data from database...">
    <card-tabs-container
      v-model="currentTabIndex"
      :tabs="tabs"
      class="compare-page"
      :containerClass="'pt-1'"
    >
      <div slot="input">
        <v-dialog
          v-model="showPickerDialog"
          persistent lazy
        >
          <v-card>
            <add-compare-entry
              :type="activePickerType"
              :step="pickerStep"
              @input="addCompareInput"
              @step="$s => pickerStep = $s"
              @cancel="showPickerDialog = false"
            />
          </v-card>

        </v-dialog>
        <v-btn
          color="primary"
          fab fixed
          right bottom
          @click="showPickerDialog = true"
        >
          <v-icon>add</v-icon>
        </v-btn>
        <section v-for="(section, i) in sections" :key="section" class="mb-3">
          <div class="title">{{ `${section}s` }}</div>
          <template v-if="getEntriesForMultidexKey(allMultidexKeys[i]).length > 0">
            <v-layout row wrap>
              <v-flex
                v-for="entry in getEntriesForMultidexKey(allMultidexKeys[i])"
                :key="entry.id"
                class="pa-2"
                xs12 sm6 lg4
              >
                <entry-card
                  :entry="entry"
                  :type="COMPARE_KEY_ORDER[i]"
                  @remove="() => removeCompareInput({ type: COMPARE_KEY_ORDER[i], id: entry.id })"
                />
              </v-flex>
            </v-layout>
          </template>
          <v-layout v-else>
            No entries input for {{ section }}.
          </v-layout>
        </section>
      </div>
      <div slot="compare">
        <v-card class="pa-2">
          <buff-expandable-list-view
            :viewMode="viewMode"
            @viewmode="$v => viewMode = $v"
            :sources="compareInput"
            :getEffectsFromSource="getEffectsFromSource"
            :titleTopOffset="topNavbarHeight"
            :getTextForSource="getTextForSource"
          >
            <span slot="allentrypreview" slot-scope="{ entries }">
              <span v-for="source in entries" :key="getCompareInputKey(source)">
                <v-chip small>
                  <v-avatar
                    v-if="getChipConfig(source).avatar"
                    size="64"
                    color="grey darken-1"
                    tabindex="-1"
                  >
                    <img
                      v-if="getChipConfig(source).avatarIsUrl"
                      :src="getChipConfig(source).avatar"
                    />
                    <span
                      v-else
                      class="font-weight-bold"
                      v-text="getChipConfig(source).avatar"
                    />
                  </v-avatar>
                  {{ getChipConfig(source).name }}
                </v-chip>
              </span>
            </span>
            <span
              slot="value-header"
              slot-scope="{ entry }"
              style="max-width: 500px; width: 100%; min-width: 300px;"
            >
              <component
                :is="getHeaderCardConfig(entry).type"
                :entry="getHeaderCardConfig(entry).entry"
                class="no-highlight v-card--flat px-2"
                style="width: 100%; background-color: transparent;"
              />
            </span>
          </buff-expandable-list-view>
        </v-card>
      </div>
    </card-tabs-container>
  </promise-wait>
</template>

<script>
import { Logger } from '@/modules/Logger';
import { COMPARE_KEY_ORDER, COMPARE_KEY_MAPPING } from '@/modules/constants';
import { convertCompareInputToCode, generateCompareInput, getEntryCardType } from '@/modules/core/compare';
import { getEffectsListForUnit } from '@/modules/core/units';
import { getEffectsListForItem } from '@/modules/core/items';
import { getEffectsListForExtraSkill } from '@/modules/core/extra-skills';
import { getEffectsListForBurst } from '@/modules/core/bursts';
import { getEffectsListForLeaderSkill } from '@/modules/core/leader-skills';
import PromiseWait from '@/components/PromiseWait';
import CardTabsContainer from '@/components/CardTabsContainer';
import EntryCard from './EntryCard';
import AddCompareEntry from './AddCompareEntry';
import BuffExpandableListView from '@/components/Multidex/BuffList/GenericBuffExpandableList/BuffExpandableListView';
import UnitEntryCard from '@/components/Multidex/Units/EntryCard';
import ItemEntryCard from '@/components/Multidex/Items/EntryCard';
import ExtraSkillEntryCard from '@/components/Multidex/ExtraSkills/EntryCard';
import LeaderSkillEntryCard from '@/components/Multidex/LeaderSkills/EntryCard';
import BurstEntryCard from '@/components/Multidex/Bursts/EntryCard';
import BaseEntryCard from '@/components/Multidex/BaseEntryCard';

const logger = new Logger({ prefix: '[Compare]' });
export default {
  props: {
    compareInput: {
      type: Array,
      default: () => [],
    },
  },
  components: {
    PromiseWait,
    CardTabsContainer,
    EntryCard,
    AddCompareEntry,
    BuffExpandableListView,
    UnitEntryCard,
    ItemEntryCard,
    ExtraSkillEntryCard,
    LeaderSkillEntryCard,
    BurstEntryCard,
    BaseEntryCard,
  },
  computed: {
    tabs: () => Object.freeze(['Input', 'Compare'].map(name => ({ name, slot: name.toLowerCase() }))),
    sections () {
      return COMPARE_KEY_ORDER.map(k => COMPARE_KEY_MAPPING[k].name);
    },
    allMultidexKeys () {
      return COMPARE_KEY_ORDER.map(k => COMPARE_KEY_MAPPING[k].multidexKey);
    },
    COMPARE_KEY_ORDER: () => COMPARE_KEY_ORDER,
  },
  data () {
    return {
      unitsDb: {},
      itemsDb: {},
      extraSkillsDb: {},
      burstsDb: {},
      leaderSkillsDb: {},
      dbLoadPromise: Promise.resolve(),
      showPickerDialog: false,
      activePickerType: '',
      pickerStep: 1,
      viewMode: '',
      topNavbarHeight: 56,
      currentTabIndex: 0,
    };
  },
  beforeMount () {
    this.onNewInput();
  },
  methods: {
    getMultidexDatabaseIdsFromCompareInput (inputs = []) {
      const mapping = COMPARE_KEY_ORDER.reduce((acc, val) => {
        acc[COMPARE_KEY_MAPPING[val].multidexKey] = [];
        return acc;
      }, {});
      inputs.forEach(input => {
        const associatedMultidexKey = (COMPARE_KEY_MAPPING[input.type] || {}).multidexKey;
        if (mapping[associatedMultidexKey]) {
          mapping[associatedMultidexKey].push(input.id);
        }
      });
      return mapping;
    },
    async updatePageDbForInput (inputs = []) {
      const databaseIds = this.getMultidexDatabaseIdsFromCompareInput(inputs);
      const currentServer = this.$store.state.settings.activeServer;
      logger.debug({ databaseIds });
      try {
        await Object.keys(databaseIds).reduce((acc, multidexKey) => {
          const entriesToGet = [];
          const pageDb = this[`${multidexKey}Db`];
          const neededKeys = databaseIds[multidexKey];
          const allKeys = Object.keys(pageDb).concat(neededKeys);
          const newDb = {};
          allKeys.forEach(id => {
            if (neededKeys.includes(id)) {
              if (!pageDb[id]) {
                entriesToGet.push(id);
              } else {
                newDb[id] = pageDb[id];
              }
            }
          });

          return acc.then(async () => {
            if (entriesToGet.length > 0) {
              const retrievedEntries = await this.$store.dispatch(`${multidexKey}/getByIds`, {
                ids: entriesToGet,
                server: currentServer,
                extractedFields: [],
              });
              this[`${multidexKey}Db`] = Object.freeze({ ...newDb, ...retrievedEntries });
            } else {
              this[`${multidexKey}Db`] = Object.freeze(newDb);
            }
          });
        }, Promise.resolve());
      } catch (err) {
        logger.error('error updating page db', err);
      }
    },
    getLocalDbForMultidexKey (multidexKey) {
      return (this.allMultidexKeys.includes(multidexKey) && this[`${multidexKey}Db`]) || {};
    },
    getEntriesForMultidexKey (multidexKey) {
      const localDb = this.getLocalDbForMultidexKey(multidexKey);
      return Object.values(localDb);
    },
    getDataForCompareEntry (entry) {
      const localDb = this.getLocalDbForMultidexKey(COMPARE_KEY_MAPPING[entry.type].multidexKey);
      return localDb[entry.id];
    },
    onNewInput () {
      this.dbLoadPromise = this.updatePageDbForInput(this.compareInput);
    },
    async removeCompareInput ({ type, id } = {}) {
      const associatedInput = this.compareInput.find(i => i.type === type && (i.id === id || i.id === (id || '').toString()));
      const newInputList = this.compareInput.filter(i => i !== associatedInput);
      if (newInputList.length !== this.compareInput.length) {
        await new Promise((fulfill, reject) => {
          this.$router.replace({
            ...this.$route,
            query: {
              ...this.$route.query,
              input: newInputList.map(convertCompareInputToCode).join(','),
            },
          }, fulfill, reject);
        });
      }
    },
    async addCompareInput ({ type, id } = {}) {
      logger.debug('received input to add', { type, id });
      const associatedInput = this.compareInput.find(i => i.type === type && (i.id === id || i.id === (id || '').toString()));
      if (!associatedInput) {
        const newInputList = this.compareInput.concat([generateCompareInput({ type, id })]);
        await new Promise((fulfill, reject) => {
          this.$router.replace({
            ...this.$route,
            query: {
              ...this.$route.query,
              input: newInputList.map(convertCompareInputToCode).join(','),
            },
          }, fulfill, reject);
        });
      }
      this.showPickerDialog = false;
    },
    getEffectsFromSource ({ type, id } = {}, target, effectType) {
      let result;
      if (COMPARE_KEY_ORDER.includes(type)) {
        if (type === COMPARE_KEY_MAPPING.unit.key && this.unitsDb[id]) {
          result = getEffectsListForUnit({
            unit: this.unitsDb[id],
            target,
            effectType,
          });
        } else if (type === COMPARE_KEY_MAPPING.item.key && this.itemsDb[id]) {
          result = getEffectsListForItem({
            item: this.itemsDb[id],
            target,
            effectType,
          });
        } else if (type === COMPARE_KEY_MAPPING.es.key && this.extraSkillsDb[id]) {
          result = getEffectsListForExtraSkill({
            skill: this.extraSkillsDb[id],
            target,
            effectType,
          });
        } else if (type === COMPARE_KEY_MAPPING.bb.key && this.burstsDb[id]) {
          result = getEffectsListForBurst({
            burst: this.burstsDb[id],
            target,
            effectType,
          });
        } else if (type === COMPARE_KEY_MAPPING.ls.key && this.leaderSkillsDb[id]) {
          result = getEffectsListForLeaderSkill({
            skill: this.leaderSkillsDb[id],
            target,
            effectType,
          });
        } else {
          logger.warn('getEffectsFromSource: setting empty entry', { type, id, target, effectType });
          result = [];
        }
      } else {
        logger.warn('source type not supported', type);
        result = [];
      }
      return result;
    },
    updateTopNavbarHeight () {
      const topNavbar = document.querySelector('nav.v-toolbar');
      this.topNavbarHeight = (topNavbar && topNavbar.offsetHeight) || 56;
    },
    getCompareInputKey ({ type, id } = {}) {
      return `${type}-${id}`;
    },
    getHeaderCardConfig ({ type, id } = {}) {
      let entry;
      if (COMPARE_KEY_ORDER.includes(type)) {
        if (type === COMPARE_KEY_MAPPING.unit.key && this.unitsDb[id]) {
          entry = this.unitsDb[id];
        } else if (type === COMPARE_KEY_MAPPING.item.key && this.itemsDb[id]) {
          entry = this.itemsDb[id];
        } else if (type === COMPARE_KEY_MAPPING.es.key && this.extraSkillsDb[id]) {
          entry = this.extraSkillsDb[id];
        } else if (type === COMPARE_KEY_MAPPING.bb.key && this.burstsDb[id]) {
          entry = this.burstsDb[id];
        } else if (type === COMPARE_KEY_MAPPING.ls.key && this.leaderSkillsDb[id]) {
          entry = this.leaderSkillsDb[id];
        }
      } else {
        logger.warn('getHeaderCardConfig: source type not supported', type);
      }

      if (!entry) {
        entry = {};
      }
      return {
        entry,
        type: getEntryCardType(type),
      };
    },
    getChipConfig ({ type, id } = {}) {
      let result = {
        name: id,
        avatar: '',
        avatarIsUrl: false,
      };
      if (COMPARE_KEY_ORDER.includes(type)) {
        if (type === COMPARE_KEY_MAPPING.unit.key && this.unitsDb[id]) {
          result.name = this.unitsDb[id].name || id;
          result.avatar = this.$store.getters['units/getImageUrls'](id).ills_battle;
          result.avatarIsUrl = true;
        } else if (type === COMPARE_KEY_MAPPING.item.key && this.itemsDb[id]) {
          result.name = this.itemsDb[id].name || id;
          result.avatar = this.$store.getters['items/getImageUrl'](id, this.itemsDb[id]);
          result.avatarIsUrl = true;
        } else if (type === COMPARE_KEY_MAPPING.es.key && this.extraSkillsDb[id]) {
          result.name = this.extraSkillsDb[id].name || id;
          result.avatar = 'ES';
        } else if (type === COMPARE_KEY_MAPPING.bb.key && this.burstsDb[id]) {
          result.name = this.burstsDb[id].name || id;
          result.avatar = 'BB';
        } else if (type === COMPARE_KEY_MAPPING.ls.key && this.leaderSkillsDb[id]) {
          result.name = this.leaderSkillsDb[id].name || id;
          result.avatar = 'LS';
        }
      }
      return result;
    },
    getTextForSource (sourcePath, source, initialValue) {
      let result;
      if (sourcePath === 'es' && this.extraSkillsDb[source.id]) {
        const name = (this.extraSkillsDb[source.id] && this.extraSkillsDb[source.id].name) || source.id;
        result = `Extra Skill: ${name}`;
      }
      return result || initialValue || sourcePath;
    },
  },
  watch: {
    compareInput () {
      this.onNewInput();
    },
    showPickerDialog () {
      this.pickerStep = 1;
    },
    currentTabIndex: {
      immediate: true,
      handler () {
        this.updateTopNavbarHeight();
        if (this.$store.state.disableHtmlOverflow) {
          this.$store.commit('setHtmlOverflowDisableState', false);
        }
      },
    },
  },
};
</script>

<style lang="less">
.compare-page {
  .v-tabs__bar {
    background-color: transparent;
  }
}
</style>
