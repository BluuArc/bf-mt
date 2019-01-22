<template>
  <v-container fluid>
    <v-layout>
      <h1>Debug Page</h1>
    </v-layout>
    <v-layout>
      <v-btn @click="callClient">
        Trigger Debug Function
      </v-btn>
    </v-layout>
    <v-layout>
      {{ result || 'undefined' }}
    </v-layout>
  </v-container>
</template>

<script>
import { makeMultidexTableInstance } from '@/modules/BfmtDatabase/client';
// import { unitKinds, elements, genders } from '@/modules/constants';

const client = makeMultidexTableInstance('units');
export default {
  data () {
    return {
      result: undefined,
    };
  },
  async mounted () {
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
      let result = await client.getFilteredDb({
        server: 'gl',
        // ids: [10017, 20017],
        // extractedFields: ['name', 'id', 'sphere type'],
        // extractedFields: [],
        filters: {
          rarity: [8],
        },
        sortOptions: {
          type: 'Alphabetical',
          isAscending: true,
        },
      });

      result = await client.getSortedKeys({
        server: 'gl',
        sortOptions: {
          type: 'Guide ID',
          isAscending: false,
        },
        keys: result,
      });
      // eslint-disable-next-line no-console
      console.warn({ result });
      this.result = result;
    },
  },
};
</script>

<style>

</style>
