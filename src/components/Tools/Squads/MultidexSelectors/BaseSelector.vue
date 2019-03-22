<template>
  <v-card>
    <v-container fluid>
      <v-layout row align-center>
        <v-flex>
          <v-text-field
            label="Search"
            v-model="query"
            @keydown.enter="sendQuery"/>
        </v-flex>
        <v-flex style="flex-grow: 0;">
          <v-btn icon flat @click="sendQuery" class="mr-0">
            <v-icon>search</v-icon>
          </v-btn>
        </v-flex>
      </v-layout>
      <v-layout style="min-height: 0; max-height: 50vh; flex: 1;">
        <div style="overflow: auto; flex: 1;" class="py-2 px-1">
          <slot name="entries" :entries="entriesToShow">
            <v-layout row wrap>
                {{ entriesToShow }}
            </v-layout>
          </slot>
        </div>
      </v-layout>
      <v-layout row justify-center align-center v-if="numPages > 1">
        <v-pagination
          v-model="currentPage"
          :total-visible="$vuetify.breakpoint.mdAndUp ? 20 : undefined"
          :length="numPages"/>
      </v-layout>
    </v-container>
  </v-card>
</template>

<script>
export default {
  props: {
    allEntryIds: {
      type: Array,
      default: () => [],
    },
    value: {
      type: String,
      default: '',
    },
    entriesPerPage: {
      type: Number,
      default: 24,
    },
  },
  computed: {
    numPages () {
      return Math.ceil(this.allEntryIds.length / this.entriesPerPage);
    },
    entriesToShow () {
      const startIndex = Math.max((this.currentPage - 1) * this.entriesPerPage, 0);
      return this.allEntryIds.slice(startIndex, startIndex + this.entriesPerPage);
    },
  },
  data () {
    return {
      currentPage: 1,
      query: '',
    };
  },
  methods: {
    sendQuery () {
      this.$emit('input', this.query);
    },
  },
  watch: {
    value: {
      immediate: true,
      handler (v) {
        this.query = v || '';
      },
    },
  },
};
</script>

<style>

</style>
