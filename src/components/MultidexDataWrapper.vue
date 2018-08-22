<template>
  <div>
    <slot name="default" :stateInfo="stateInfo" :actionInfo="actionInfo" :aggregatedInfo="aggregatedInfo">
      Place your markup here to receive scoped data.
    </slot>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { moduleInfo } from '@/store';
import { servers } from '@/modules/constants';
import { Logger } from '@/modules/Logger';

const logger = new Logger({ prefix: '[MD-DATA-WRAPPER]' }); // eslint-disable-line no-unused-vars
const multidexModules = moduleInfo.filter(m => m.type === 'multidex');
export default {
  computed: {
    ...mapState(['updateTimes']),
    ...(() => {
      // get state for each module
      let fullStateMapping = {};
      multidexModules.map(m => m.name).forEach(m => {
        const stateMapping = {};
        stateMapping[`${m}Data`] = 'pageDb';
        stateMapping[`${m}NumEntries`] = 'numEntries';
        stateMapping[`${m}IsLoading`] = 'isLoading';
        stateMapping[`${m}CacheTimes`] = 'cacheTimes';
        stateMapping[`${m}UpdateTimes`] = 'updateTimes';
        stateMapping[`${m}LoadingMessage`] = 'loadingMessage';

        fullStateMapping = {
          ...fullStateMapping,
          ...mapState(m, stateMapping),
        };
      });
      return fullStateMapping;
    })(),
    stateInfo () {
      const info = {};
      multidexModules.forEach(({ name }) => {
        info[name] = {
          data: this[`${name}Data`],
          numEntries: this[`${name}NumEntries`],
          isLoading: this[`${name}IsLoading`],
          cacheTimes: this[`${name}CacheTimes`],
          updateTimes: this[`${name}UpdateTimes`],
          loadingMessage: this[`${name}LoadingMessage`],
        };
        info[name].hasUpdates = this.generateHasUpdatesEntry(info[name], name);
      });
      return info;
    },
    actionInfo () {
      const info = {};
      multidexModules.forEach(({ name }) => {
        info[name] = {
          update: this[`${name}DataUpdate`],
          delete: this[`${name}DataDelete`],
        };
      });
      return info;
    },
    aggregatedInfo () {
      const isLoading = Object.values(this.stateInfo).reduce((acc, val) => acc || val.isLoading, false);
      const loadingMessage = multidexModules.filter(m => this.stateInfo[m.name].loadingMessage)
        .map(m => `[${m.fullName}] ${this.stateInfo[m.name].loadingMessage}`)
        .reduce((acc, val) => acc || val, '');
      return { isLoading, loadingMessage };
    },
  },
  methods: {
    ...(() => {
      // get actions for each module
      let result = {};
      multidexModules.map(m => m.name).forEach(m => {
        const actionMapping = {};
        actionMapping[`${m}DataUpdate`] = 'updateData';
        actionMapping[`${m}DataDelete`] = 'deleteData';
        result = {
          ...result,
          ...mapActions(m, actionMapping),
        };
      });
      return result;
    })(),
    hasUpdates (moduleStateInfo, server, moduleName) {
      const updateTimes = this.updateTimes;
      // logger.debug(moduleStateInfo.updateTimes, server, moduleName, updateTimes);
      return !!(
        moduleStateInfo.updateTimes && updateTimes[moduleName] &&
        moduleStateInfo.updateTimes[server] && updateTimes[moduleName][server] &&
        (moduleStateInfo.numEntries[server] === 0 || new Date(updateTimes[moduleName][server]) > new Date(moduleStateInfo.updateTimes[server]))
      );
    },
    generateHasUpdatesEntry (moduleStateInfo, moduleName) {
      const entry = {};
      servers.forEach(server => {
        entry[server] = this.hasUpdates(moduleStateInfo, server, moduleName)
          ? this.updateTimes[moduleName][server]
          : false;
      });
      return entry;
    },
  },
};
</script>

