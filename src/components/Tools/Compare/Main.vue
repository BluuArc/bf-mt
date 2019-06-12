<template>
  <promise-wait :promise="dbLoadPromise">
    <card-tabs-container :tabs="tabs" class="compare-page" :containerClass="''">
      <div slot="input">
        <section v-for="(section, i) in sections" :key="section">
          <div class="title">{{ `${section}s` }}</div>
          <template v-if="getEntriesForMultidexKey(allMultidexKeys[i]).length > 0">
            <v-layout row wrap>
              <v-flex
                v-for="entry in getEntriesForMultidexKey(allMultidexKeys[i])"
                :key="entry.id"
              >
                <entry-card
                  :entry="entry"
                  :type="COMPARE_KEY_ORDER[i]"
                />
              </v-flex>
            </v-layout>
          </template>
          <v-layout v-else>
            No entries input for {{ section }}.
          </v-layout>
        </section>
      </div>
    </card-tabs-container>
  </promise-wait>
</template>

<script>
import { COMPARE_KEY_ORDER, COMPARE_KEY_MAPPING } from '@/modules/constants';
import { Logger } from '@/modules/Logger';
import PromiseWait from '@/components/PromiseWait';
import CardTabsContainer from '@/components/CardTabsContainer';
import EntryCard from './EntryCard';

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
  },
  watch: {
    compareInput () {
      this.onNewInput();
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
