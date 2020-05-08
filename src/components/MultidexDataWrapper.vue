<template>
  <div>
    <slot name="default"
      :stateInfo="stateInfo"
      :actionInfo="actionInfo"
      :aggregatedInfo="aggregatedInfo"
      :loadingState="loadingState">
      Place your markup here to receive scoped data.
    </slot>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex';
import { moduleInfo } from '@/store';
import { Logger } from '@/modules/Logger';
import { generateStateInfo, generateActionInfo } from '@/modules/utils';

const logger = new Logger({ prefix: '[MD-DATA-WRAPPER]' }); // eslint-disable-line no-unused-vars
const multidexModules = moduleInfo.filter(m => m.type === 'multidex');
export default {
  props: {
    isMain: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapState(['updateTimes', 'loadingState']),
    ...mapState('settings', ['activeServer']),
    stateInfo () {
      return generateStateInfo(this, multidexModules);
    },
    actionInfo () {
      return generateActionInfo(this, multidexModules);
    },
    linkInfo () {
      const currentState = this.$store && this.$store.state;
      let result = {};
      if (currentState) {
        result.tierList = currentState.tierList.currentCode || '';
      }
      return result;
    },
    aggregatedInfo () {
      const isLoading = Object.values(this.stateInfo).reduce((acc, val) => acc || val.isLoading, false);
      const loadingMessage = multidexModules.filter(m => this.stateInfo[m.name].loadingMessage)
        .map(m => `[${m.fullName}] ${this.stateInfo[m.name].loadingMessage}`)
        .reduce((acc, val) => acc || val, '');
      return { isLoading, loadingMessage };
    },
  },
  watch: {
    aggregatedInfo: {
      deep: true,
      handler () {
        // only have the main component change the value
        if (this.isMain) {
          this.setLoadingStateInVuex();
        }
      },
    },
  },
  methods: {
    ...mapMutations(['setLoadingState']),
    ...mapActions(['setLoadingStateDebounced']),
    setLoadingStateInVuex () {
      // keep on true as long as possible
      if (this.aggregatedInfo.isLoading) {
        if (!this.loadingState) {
          this.setLoadingState(true);
        }
      } else {
        this.setLoadingStateDebounced(() => this.aggregatedInfo.isLoading);
      }
    },
  },
};
</script>

