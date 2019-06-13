<template>
  <v-card>
    <module-checker
      :requiredModules="requiredModules"
      :ensureDbSync="true"
    >
      <v-container fluid>
        <v-layout v-if="hasSelection">
          <loading-indicator loadingMessage="Processing selection..."/>
        </v-layout>
        <template v-else>
          <v-layout row align-center>
            <v-flex>
              <v-text-field
                label="Search"
                v-model="query"
                @keydown.enter="sendQuery"
                persistent-hint
                :hint="searchHint"/>
            </v-flex>
            <v-flex style="flex-grow: 0;">
              <v-btn
                icon flat
                :outline="hasDirtyQuery"
                @click="sendQuery"
                class="mr-0">
                <v-icon>search</v-icon>
              </v-btn>
            </v-flex>
          </v-layout>
          <v-layout style="min-height: 0; max-height: 55vh; flex: 1;">
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
        </template>
        <v-layout row style="justify-content: flex-end;" v-show="!hasSelection">
          <v-flex style="flex: none;">
            <v-btn flat @click="$emit('cancel')">Cancel</v-btn>
          </v-flex>
        </v-layout>
      </v-container>
    </module-checker>
  </v-card>
</template>

<script>
import LoadingIndicator from '@/components/LoadingIndicator';
import ModuleChecker from '@/components/ModuleChecker';

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
    hasSelection: {
      type: Boolean,
      default: false,
    },
    requiredModules: {
      type: Array,
      default: () => [],
    },
  },
  components: {
    LoadingIndicator,
    ModuleChecker,
  },
  computed: {
    numPages () {
      return Math.ceil(this.allEntryIds.length / this.entriesPerPage);
    },
    entriesToShow () {
      const startIndex = Math.max((this.currentPage - 1) * this.entriesPerPage, 0);
      return this.allEntryIds.slice(startIndex, startIndex + this.entriesPerPage);
    },
    hasDirtyQuery () {
      return this.query !== this.value;
    },
    searchHint () {
      return [
        `${this.allEntryIds.length} results`,
        this.hasDirtyQuery && '*',
      ].filter(v => v).join('');
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
