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
import client from '@/modules/BfmtDatabase/client';
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
      const result = await client.getTablesWithEntries(['units', 'items'], 'gl');
      // const result = await client.getDbStats({
      //   table: 'units',
      //   query: { server: 'gl' },
      //   field: 'data',
      //   id: 10017,
      // });
      // eslint-disable-next-line no-console
      console.warn({ result });
      this.result = result;
    },
  },
};
</script>

<style>

</style>
