<template>
  <module-checker
    :requiredModules="requiredModules"
    externalLoadingMessage="Fetching squad information...">
    <v-container>
      <v-layout column>
        <v-flex>
          <v-card>
            <card-tabs-container :tabs="tabConfig" v-model="activeTabIndex">
              <v-layout column slot="squad">
                <v-flex>
                  <squad-list-card-editable :squad="squad"/>
                </v-flex>
                <v-flex>
                  {{ squad }}
                </v-flex>
              </v-layout>
              <v-layout column slot="import-code">
                <v-flex>
                  <v-text-field v-model="inputCode"/>
                </v-flex>
                <v-flex v-if="parseErrorMessage">
                  <v-alert :value="true" type="error">
                    {{ parseErrorMessage }}
                  </v-alert>
                </v-flex>
                <v-layout justify-end>
                  <v-flex style="flex-grow: 0;">
                    <v-btn
                      @click="attemptSquadImport"
                      :disabled="!inputCode"
                      flat>
                      Import
                    </v-btn>
                  </v-flex>
                </v-layout>
              </v-layout>
            </card-tabs-container>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </module-checker>
</template>

<script>
import { squadRequiredModules } from '@/router/tool-routes';
import {
  shorthandToSquad,
  generateDefaultSquad,
} from '@/modules/core/squads';
import { Logger } from '@/modules/Logger';
import ModuleChecker from '@/components/ModuleChecker';
import CardTabsContainer from '@/components/CardTabsContainer';
import SquadListCardEditable from '@/components/Tools/Squads/SquadListCardEditable';

const logger = new Logger({ prefix: 'SquaddAdd' });
export default {
  props: {
    importSquad: {
      type: String,
      default: '',
    },
  },
  components: {
    ModuleChecker,
    CardTabsContainer,
    SquadListCardEditable,
  },
  computed: {
    requiredModules: () => squadRequiredModules,
    tabConfig: () => ['squad', 'import code'].map(name => ({ name, slot: name.replace(/ /g, '-') })),
  },
  data () {
    return {
      squad: generateDefaultSquad(),
      inputCode: '',
      parseErrorMessage: '',
      activeTabIndex: 0,
    };
  },
  mounted () {
    if (this.inputCode) {
      this.attemptSquadImport();
    }
  },
  methods: {
    attemptSquadImport () {
      this.parseErrorMessage = '';
      if (!this.inputCode) {
        this.parseErrorMessage = 'No input specified';
      } else {
        try {
          this.squad = shorthandToSquad(this.inputCode);
        } catch (err) {
          logger.error('error parsing squad', err);
          this.parseErrorMessage = 'Import code is invalid and cannot be parsed.';
        }
      }
    },
  },
  watch: {
    importSquad: {
      immediate: true,
      handler (value) {
        if (value) {
          this.inputCode = value;
        }
      },
    },
    inputCode (newValue) {
      // clear message on input clear
      if (!newValue) {
        this.parseErrorMessage = '';
      }
    },
    parseErrorMessage (newValue) {
      if (newValue) {
        this.activeTabIndex = 1; // show import tab
      }
    },
  },
};
</script>
