<template>
  <v-container fluid>
    <v-layout>
      <h1>Debug Page</h1>
    </v-layout>
    <v-layout>
      <v-btn @click="promise = callClient()">
        Trigger Debug Function
      </v-btn>
    </v-layout>
    <v-layout>
      <!-- {{ result || 'undefined' }} -->
      <promise-wait v-if="promise" :promise="promise" style="flex: auto;">
        <template slot-scope="{ result }">
          <v-btn>
            {{ result }}
          </v-btn>
        </template>
      </promise-wait>
    </v-layout>
  </v-container>
</template>

<script>
import { makeTableInstance } from '@/modules/BfmtDatabase/client';
import { multidexModuleInfo } from '@/modules/constants';
import PromiseWait from '@/components/PromiseWait';
// import { shorthandToSquad } from '@/modules/core/squads';
// import { unitKinds, elements, genders } from '@/modules/constants';

// const client = makeMultidexTableInstance('items');
const client = makeTableInstance('settings');
export default {
  data () {
    return {
      result: undefined,
      promise: null,
    };
  },
  components: {
    PromiseWait,
  },
  async mounted () {
    window._debugContext = this;
    // eslint-disable-next-line no-console
    console.warn({ client });

    client.registerCommand('message', (data) => {
      // eslint-disable-next-line no-console
      console.warn('received message from worker', data);
    });
  },
  beforeDestroy () {
    client.unregisterCommand('message');
  },
  methods: {
    async callClient () {

      // const result = await client.request('delayed-ping', { from: 'debug page' });
      // const result = await client.getDbStats('gl');
      let result = await client.getAll({
        server: 'gl',
        tables: multidexModuleInfo.map(m => m.name),
        forceRefresh: true,
        // ids: [10017, 20017],
        // extractedFields: ['name', 'id', 'sphere type'],
        // extractedFields: [],
        // filters: {
        //   itemTypes: ['sphere'],
        // },
        // sortOptions: {
        //   type: 'Sell Price',
        //   isAscending: false,
        // },
      });

      // result = await client.getSortedKeys({
      //   server: 'gl',
      //   sortOptions: {
      //     type: 'Guide ID',
      //     isAscending: false,
      //   },
      //   keys: result,
      // });
      // eslint-disable-next-line no-console
      console.warn({ result });
      return Object.freeze(result);
    },
  },
};
</script>

<style>

</style>
