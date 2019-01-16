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
  </v-container>
</template>

<script>
import client from '@/modules/BfmtDatabase/client';
export default {
  async mounted () {
    // eslint-disable-next-line no-console
    console.warn({ client });
  },
  methods: {
    async callClient () {
      // const result = await client.request('ping', { from: 'debug page' });
      const result = await client.get('units', { server: 'gl' });
      // eslint-disable-next-line no-console
      console.warn({ result });
    },
  },
};
</script>

<style>

</style>
