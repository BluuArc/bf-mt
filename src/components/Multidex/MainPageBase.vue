<template>
  <multidex-data-wrapper>
    <v-container grid-list-sm slot-scope="{ stateInfo, actionInfo, aggregatedInfo, loadingState }" class="multidex-page">
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
                      <span v-text="searchResultCountText"/>
                    </v-flex>
                    <v-flex xs2 sm1 v-if="hasUpdates" class="text-xs-center">
                      <v-tooltip left v-model="showUpdateTooltip">
                        <v-btn flat icon color="info" slot="activator" @click="showUpdateDialog = true">
                          <v-icon>info</v-icon>
                        </v-btn>
                        <span>Updates Available</span>
                      </v-tooltip>
                      <v-dialog v-model="showUpdateDialog" max-width="500px">
                      <v-card>
                        <v-card-text>
                          <h1 class="subheading">
                            Updates are available for this server ({{ activeServer.toUpperCase() }}). ({{ toUpdate.map(m => m.fullName).join(', ') }})
                          </h1>
                        </v-card-text>
                        <v-card-actions>
                          <v-btn flat color="primary" @click="updateData">Download Updates</v-btn>
                          <v-btn color="primary" flat @click.stop="showUpdateDialog = false">Close</v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                    </v-flex>
                  </v-layout>
                  <template v-if="filterTypes.length > 0">
                    <v-navigation-drawer
                      persistent right
                      enable-resize-watcher
                      :clipped="$vuetify.breakpoint.lgAndUp"
                      fixed app
                      :value="showFilterSheet">
                      <v-btn block @click="showFilterSheet = false">
                        Close Sidebar
                        <v-spacer/>
                        <v-icon right>chevron_right</v-icon>
                      </v-btn>
                      <h3 class="headline pl-3 pt-3">Filters</h3>
                    </v-navigation-drawer>
                    <v-layout row>
                      <v-flex>
                        <v-divider/>
                      </v-flex>
                    </v-layout>
                    <v-layout row>
                      <v-flex xs10 class="text-xs-left d-align-self-center">
                        <h2 class="title">Active Filters:</h2>
                      </v-flex>
                      <v-flex xs2 class="text-xs-right">
                        <v-btn v-if="$vuetify.breakpoint.xsOnly" flat icon class="mr-0 pr-1" @click="showFilterSheet = !showFilterSheet">
                          <v-icon>filter_list</v-icon>
                        </v-btn>
                      </v-flex>
                    </v-layout>
                    <v-layout row>
                      <v-flex xs10 md11 class="d-align-self-center">
                        <v-chip small style="text-transform: capitalize">Example Filter Chip</v-chip>
                      </v-flex>
                      <v-flex xs2 md1 class="text-xs-right">
                        <v-btn v-if="$vuetify.breakpoint.smAndUp" flat icon class="mr-0 pr-1" @click="showFilterSheet = !showFilterSheet">
                          <v-icon>filter_list</v-icon>
                        </v-btn>
                      </v-flex>
                    </v-layout>
                  </template>
                  <v-layout row>
                    <v-flex>
                      <v-divider/>
                    </v-flex>
                  </v-layout>
                  <v-layout row>
                    <v-flex xs10 md11 class="d-align-self-center">
                      <h2 class="title d-inline pr-2">Sort</h2>
                      <v-chip small>{{ sortOptions.type }}</v-chip>
                      <v-chip small>{{ sortOptions.isAscending ? 'Ascending' : 'Descending' }}</v-chip>
                    </v-flex>
                    <v-flex xs2 md1 class="text-xs-right">
                      <v-btn v-if="$vuetify.breakpoint.smAndUp" flat icon class="mr-0 pr-1" @click="showSortPanel = !showSortPanel">
                        <v-icon>{{ showSortPanel ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</v-icon>
                      </v-btn>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card-text>
              <v-expansion-panel v-model="sortPanelModel">
                <v-expansion-panel-content>
                  <v-container fluid class="pa-0">
                    <v-layout row>
                      <v-flex>
                        <v-card-text>
                          <v-layout row wrap>
                            <v-flex xs12 sm6 md12>
                              <h3 class="subheading">Sort Type</h3>
                              radio options here
                            </v-flex>
                            <v-flex sm12 sm6 md12>
                              <h3 class="subheading">Sort Order</h3>
                              <v-radio-group v-model="sortOptions.isAscending" :row="$vuetify.breakpoint.mdAndUp">
                                <v-radio :disabled="loadingSorts" :value="true" label="Ascending"/>
                                <v-radio :disabled="loadingSorts" :value="false" label="Descending"/>
                              </v-radio-group>
                            </v-flex>
                          </v-layout>
                        </v-card-text>
                      </v-flex>
                    </v-layout>
                  </v-container>
                </v-expansion-panel-content>
              </v-expansion-panel>
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
import { mapState } from 'vuex';
import MultidexDataWrapper from '@/components/MultidexDataWrapper';
import LoadingIndicator from '@/components/LoadingIndicator';

let logger = new Logger({ prefix: '[MULTIDEX/default]' });
function createPropertyMock (name, value) {
  return {
    [name]: () => {
      logger.warn('mock:', name, '=', value);
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
    ...mapState('settings', ['activeServer']),
    ...createPropertyMock('hasUpdates', true),
    ...createPropertyMock('allSortedEntries', new Array(1000).fill(0)),
    ...createPropertyMock('mainModule', moduleInfo[0]),
    ...createPropertyMock('toUpdate', moduleInfo),
    ...createPropertyMock('filterTypes', ['elements', 'rarity']),
    searchResultCountText () {
      return [`Showing ${this.allSortedEntries.length}`, this.mainModule.fullName, this.mainModule.fullName === 'Dictionary' ? 'Entries' : ''].join(' ');
    },
    sortPanelModel () { // used as input for expansion panel v-model
      return this.showSortPanel ? 0 : -1;
    },
  },
  data () {
    const showBooleans = {
      showUpdateTooltip: false,
      showUpdateDialog: false,
      showFilterSheet: false,
      showSortPanel: false,
    };
    return {
      finishedInit: false,
      ...showBooleans,
      sortOptions: {
        type: 'ID',
        isAscending: true,
      },
      loadingSorts: false,
    };
  },
  methods: {
    updateData () {
      logger.error('update data not implemented yet');
    },
  },
  watch: {
    hasUpdates (newValue) {
      this.showUpdateTooltip = !!newValue;
    },
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
