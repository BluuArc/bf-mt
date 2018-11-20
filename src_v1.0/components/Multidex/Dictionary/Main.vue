<template>
  <main-page-base
    :required-modules="requiredModules"
    :filter-types="filterTypes"
    :sort-types="sortTypes"
    :page-db="pageDb"
    :view-id="viewId"
    :input-server="server"
    :route-key="routeKey"
    :use-async-sort="true"
    :get-multidex-path-to="getMultidexPathTo">
    <template slot="results-area" slot-scope="{ results }">
      <v-layout row wrap>
        <v-layout row wrap>
          <v-flex
            v-for="key in results"
            :key="key"
            xs12 sm6 md4>
            <v-card class="dictionary-card" @click.native="logEntry(key)" style="height: 100%">
              <v-container fluid>
                <v-layout row wrap>
                  <v-flex xs12 style="word-wrap: break-word;">
                    <b title="key">{{ key }}</b>
                  </v-flex>
                  <v-flex xs12 style="word-wrap: break-word;">
                    <span title="value">{{ pageDb[key] || '(Empty String)' }}</span>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card>
          </v-flex>
        </v-layout>
      </v-layout>
    </template>
  </main-page-base>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import MainPageBase from '@/components/Multidex/MainPageBase';

export default {
  props: ['query', 'viewId', 'server'],
  components: {
    'main-page-base': MainPageBase,
  },
  computed: {
    ...mapState('dictionary', ['pageDb']),
    ...mapGetters('dictionary', ['getMultidexPathTo']),
    requiredModules: () => ['dictionary'],
    filterTypes: () => [],
    sortTypes () {
      return {
        'Dictionary ID': (idA, idB, isAscending) => {
          const result = (idA > idB) ? 1 : -1;
          return isAscending ? result : -result;
        },
        Alphabetical: (idA, idB, isAscending) => {
          const [nameA, nameB] = [this.pageDb[idA], this.pageDb[idB]];
          const result = (nameA > nameB) ? 1 : -1;
          return isAscending ? result : -result;
        },
      };
    },
    routeKey () {
      return `multidex-${this.$route.name}`;
    },
  },
  methods: {
    logEntry (key) {
      console.debug({ key, value: this.pageDb[key] });
    },
  },
};
</script>
