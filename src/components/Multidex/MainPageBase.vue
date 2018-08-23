<template>
  <multidex-data-wrapper>
    <v-container grid-list-sm slot-scope="{ stateInfo, actionInfo, aggregatedInfo, loadingState }">
      <v-layout row v-if="loadingState || !finishedInit">
        <v-flex>
          <loading-indicator :loadingMessage="aggregatedInfo.loadingMessage"/>
        </v-flex>
      </v-layout>
      <template v-else>
        <v-layout row>
          <v-flex>
            <v-card raised>
              <v-card-text>
                <v-container fluid class="pa-0">
                  <v-layout row>
                    <v-flex :xs8="!hasUpdates" :xs6="hasUpdates" :sm7="hasUpdates">
                      <v-text-field label="Search"/>
                    </v-flex>
                    <v-flex xs4 class="text-xs-center d-align-self-center">
                      <span style="white-space: nowrap;" v-text="searchResultCountText"/>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card-text>
            </v-card>
          </v-flex>
        </v-layout>
      </template>
    </v-container>
  </multidex-data-wrapper>
</template>

<script>
import { Logger } from '@/modules/Logger';
import { moduleInfo } from '@/store/multidex';
import MultidexDataWrapper from '@/components/MultidexDataWrapper';
import LoadingIndicator from '@/components/LoadingIndicator';

let logger = new Logger({ prefix: '[MULTIDEX/default]' });
function createPropertyMock (name, value) {
  return {
    [name]: () => {
      logger.warn('mock: ', name, '=', value);
      return value;
    },
  };
}

export default {
  components: {
    MultidexDataWrapper,
    LoadingIndicator,
  },
  computed: {
    ...createPropertyMock('hasUpdates', false),
    ...createPropertyMock('allSortedEntries', [1, 2, 3]),
    ...createPropertyMock('mainModule', moduleInfo[0]),
    searchResultCountText () {
      return [`Showing ${this.allSortedEntries.length}`, this.mainModule.fullName, this.mainModule.fullName === 'Dictionary' ? 'Entries' : ''].join(' ');
    },
  },
  data () {
    return {
      finishedInit: false,
    };
  },
  created () {
    logger = new Logger({ prefix: `[MULTIDEX/${this.$route.name}]` });
  },
  mounted () {
    logger.warn('mocking delayed finish init');
    setTimeout(() => {
      this.finishedInit = true;
    }, 2.5 * 1000);
  },
};
</script>
