<template>
  <v-container fluid>
    <v-layout row v-if="loadingEntryData" class="text-xs-center">
      <v-flex>
        <loading-indicator loadingMessage="Loading Entry Data..."/>
      </v-flex>
    </v-layout>
    <v-layout row v-else-if="!entry">
      No entry data found.
    </v-layout>
    <v-layout row v-else>
      {{ entry }}
    </v-layout>
  </v-container>
</template>

<script>
import { mapActions } from 'vuex';
import LoadingIndicator from '@/components/LoadingIndicator';
export default {
  props: {
    entryId: {
      type: String,
      required: true,
    },
    logger: {
      required: true,
    },
    pageDb: {
      type: Object,
      required: true,
    },
  },
  components: {
    LoadingIndicator,
  },
  data () {
    return {
      entry: undefined,
      loadingEntryData: true,
    };
  },
  watch: {
    async entryId (newValue) {
      if (!newValue) {
        this.entry = undefined;
      } else {
        await this.loadEntry();
      }
    },
    async pageDb () {
      if (this.entryId && Object.keys(this.pageDb).length > 0) {
        await this.loadEntry();
      }
    },
  },
  methods: {
    ...mapActions('units', ['getById']),
    async loadEntry () {
      this.loadingEntryData = true;
      try {
        this.entry = await this.getById(this.entryId);
      } catch (err) {
        this.logger.error(err);
      } finally {
        this.loadingEntryData = false;
      }
    },
  },
  async mounted () {
    if (this.entryId) {
      await this.loadEntry();
    }
  }
}
</script>
