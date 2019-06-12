<template>
  <promise-wait :promise="dbLoadPromise">
    <card-tabs-container :tabs="tabs" class="compare-page" :containerClass="''">
      <div slot="input">
        <section v-for="section in sections" :key="section">
          <div class="title">{{ `${section}s` }}</div>
          <div>
            Entries for {{ section }} go here
          </div>
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
  },
  computed: {
    tabs: () => Object.freeze(['Input', 'Compare'].map(name => ({ name, slot: name.toLowerCase() }))),
    sections () {
      return COMPARE_KEY_ORDER.map(k => COMPARE_KEY_MAPPING[k].name);
    },
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
        if (mapping[input.type]) {
          mapping[input.type].push(input.id);
        }
      });
      return mapping;
    },
    async updatePageDbForInput (inputs = []) {
      const databaseIds = this.getMultidexDatabaseIdsFromCompareInput(inputs);
      const currentServer = this.$store.state.settings.activeServer;
      try {
        await Object.values(databaseIds).reduce((acc, multidexKey) => {
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
