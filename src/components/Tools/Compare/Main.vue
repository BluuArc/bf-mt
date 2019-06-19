<template>
  <promise-wait
    :promise="dbLoadPromise"
    loadingMessage="Loading data from database..."
  >
    <template slot="loading">
      <div style="height: 100%">
        <v-container fill-height justify-center>
          <v-flex class="text-xs-center" style="flex-grow: 0;">
            <loading-indicator
              :loadingMessage="dbLoadMessage || 'Loading data from database...'"
              :progress="dbLoadProgress"
            />
          </v-flex>
        </v-container>
      </div>
    </template>
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
        <v-dialog
          v-model="showClearDialog"
          persistent
          max-width="400px"
        >
          <v-card>
            <v-card-text>
              Clear all {{ typeToClear }} entries?
            </v-card-text>
            <v-card-actions>
              <v-spacer/>
              <v-btn outline @click="() => clearEntries(typeToClear)">
                Yes
              </v-btn>
              <v-btn flat @click="showClearDialog = false">
                No
              </v-btn>
            </v-card-actions>
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
        <section v-if="compareInput.length > 25">
          <v-alert :value="true" type="warning">
            Comparing too many entries may lead to performance and memory issues.
          </v-alert>
        </section>
        <section v-for="(section, i) in sections" :key="section" class="mb-3">
          <div class="title">
            {{ `${section}s` }}
            <v-btn
              v-if="getEntriesForMultidexKey(allMultidexKeys[i]).length > 0"
              @click="() => { typeToClear = section; showClearDialog = true; }"
              icon
            >
            <v-icon>highlight_off</v-icon>
          </v-btn>
          </div>
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
            <template slot="view-config-extra">
              <section>
                <v-layout row justify-center align-center class="pl-2">
                  <v-flex xs2>
                    Unit Chip View
                  </v-flex>
                  <v-flex xs5 class="text-xs-center">
                    <v-btn
                      flat
                      :outline="!unitChipViewModeIsOutlined"
                      @click="unitChipViewModeIsOutlined = false"
                    >
                      Filled
                    </v-btn>
                  </v-flex>
                  <v-flex xs5 class="text-xs-center">
                    <v-btn
                      flat
                      :outline="unitChipViewModeIsOutlined"
                      @click="unitChipViewModeIsOutlined = true"
                    >
                      Outlined
                    </v-btn>
                  </v-flex>
                </v-layout>
              </section>
            </template>
            <span slot="allentrypreview" slot-scope="{ entries, effectId }">
              <span v-for="entry in entries" :key="getCompareInputKey(entry.source)">
                <template v-for="sourcePath in entry.sourcePaths">
                  <v-chip
                    :key="`${getCompareInputKey(entry.source)}-${effectId}-${sourcePath}`"
                    :color="getChipConfig(entry.source, sourcePath).backgroundColor"
                    :text-color="getChipConfig(entry.source, sourcePath).textColor"
                    :outline="getChipConfig(entry.source, sourcePath).outline"
                    small
                  >
                    <v-avatar
                      v-if="getChipConfig(entry.source).avatar"
                      size="64"
                      color="grey darken-1"
                      tabindex="-1"
                    >
                      <img
                        v-if="getChipConfig(entry.source).avatarIsUrl"
                        :src="getChipConfig(entry.source).avatar"
                      />
                      <span
                        v-else
                        class="font-weight-bold"
                        v-text="getChipConfig(entry.source).avatar"
                      />
                    </v-avatar>
                    {{ getChipConfig(entry.source, sourcePath).name }}
                  </v-chip>
                </template>
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
import { COMPARE_KEY_ORDER, COMPARE_KEY_MAPPING, MATERIAL_COLOR_MAPPING, multidexModuleInfo } from '@/modules/constants';
import { convertCompareInputToCode, generateCompareInput, getEntryCardType } from '@/modules/core/compare';
import { getEffectsListForUnit } from '@/modules/core/units';
import { getEffectsListForItem } from '@/modules/core/items';
import { getEffectsListForExtraSkill } from '@/modules/core/extra-skills';
import { getEffectsListForBurst } from '@/modules/core/bursts';
import { getEffectsListForLeaderSkill } from '@/modules/core/leader-skills';
import PromiseWait from '@/components/PromiseWait';
import LoadingIndicator from '@/components/LoadingIndicator';
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
    LoadingIndicator,
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
      dbLoadProgress: -1,
      dbLoadMessage: '',
      showPickerDialog: false,
      activePickerType: '',
      pickerStep: 1,
      viewMode: '',
      topNavbarHeight: 56,
      currentTabIndex: 0,
      unitChipViewModeIsOutlined: false,
      showClearDialog: false,
      typeToClear: '',
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
      const currentServer = this.$store.state.settings.activeServer;
      const databaseIds = this.getMultidexDatabaseIdsFromCompareInput(inputs);
      const databaseIdsKeys = Object.keys(databaseIds);
      const numKeys = Math.max(databaseIdsKeys.length, 1);
      logger.debug({ databaseIds });
      this.dbLoadProgress = 0;
      try {
        await databaseIdsKeys.reduce((acc, multidexKey) => {
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
            const moduleName = (multidexModuleInfo.find(m => m.name === multidexKey) || {}).fullName || multidexKey;
            this.dbLoadProgress = Math.max((databaseIdsKeys.indexOf(multidexKey) / numKeys) * 100, 0);
            this.dbLoadMessage = `Loading entries for ${moduleName}`;
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
      this.dbLoadProgress = 100;
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
    replaceRouteWithInput (inputList = []) {
      return new Promise((fulfill, reject) => {
        this.$router.replace({
          ...this.$route,
          query: {
            ...this.$route.query,
            input: inputList.map(convertCompareInputToCode).join(','),
          },
        }, fulfill, reject);
      });
    },
    async removeCompareInput ({ type, id } = {}) {
      const associatedInput = this.compareInput.find(i => i.type === type && (i.id === id || i.id === (id || '').toString()));
      const newInputList = this.compareInput.filter(i => i !== associatedInput);
      if (newInputList.length !== this.compareInput.length) {
        await this.replaceRouteWithInput(newInputList);
      }
    },
    async addCompareInput ({ type, id } = {}) {
      logger.debug('received input to add', { type, id });
      const associatedInput = this.compareInput.find(i => i.type === type && (i.id === id || i.id === (id || '').toString()));
      if (!associatedInput) {
        const newInputList = this.compareInput.concat([generateCompareInput({ type, id })]);
        await this.replaceRouteWithInput(newInputList);
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
    getChipConfig ({ type, id } = {}, sourcePath) {
      let result = {
        name: id,
        avatar: '',
        avatarIsUrl: false,
        backgroundColor: undefined,
        textColor: undefined,
        outline: false,
      };
      if (COMPARE_KEY_ORDER.includes(type)) {
        if (type === COMPARE_KEY_MAPPING.unit.key && this.unitsDb[id]) {
          result.name = this.unitsDb[id].name || id;
          result.avatar = this.$store.getters['units/getImageUrls'](id).ills_battle;
          result.avatarIsUrl = true;

          const colorConfig = this.getColorMappingForSourcePath(sourcePath);
          if (colorConfig) {
            result.backgroundColor = colorConfig.background;
            result.textColor = colorConfig.text;
            result.name = `${result.name} (${sourcePath.split('.')[1].toUpperCase()})`;
            result.outline = !!this.unitChipViewModeIsOutlined;
          }
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
    getColorMappingForSourcePath (sourcePath = '') {
      return (sourcePath.startsWith('unit.') && MATERIAL_COLOR_MAPPING.unit[sourcePath.split('.')[1]]) || undefined;
    },
    async clearEntries (sectionName) {
      const associatedType = COMPARE_KEY_ORDER.find(k => COMPARE_KEY_MAPPING[k].name === sectionName);
      if (associatedType) {
        const newInputList = this.compareInput.filter(i => i.type !== associatedType);
        await this.replaceRouteWithInput(newInputList);
      }
      this.showClearDialog = false;
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
