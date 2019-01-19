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

const client = makeMultidexTableInstance('items');
export default {
  data () {
    return {
      result: undefined,
    };
  },
  async mounted () {
    // eslint-disable-next-line no-console
    console.warn({ client });
  },
  methods: {
    async callClient () {

      // const result = await client.request('ping', { from: 'debug page' });
      // const result = await client.getDbStats('gl');
      const result = await client.getFilteredDb({
        server: 'gl',
        // ids: [10017, 20017],
        extractedFields: ['name', 'id', 'sphere type'],
        // extractedFields: [],
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
