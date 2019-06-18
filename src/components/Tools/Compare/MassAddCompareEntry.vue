<template>
  <v-card class="mass-add-compare-entry">
    <v-card-text>
      <v-autocomplete
        v-model="localSelectedIds"
        :items="allEntries"
        :hint="`${localSelectedIds.length} Entries Selected`"
        label="Entries to Compare"
        :allow-overflow="false"
        persistent-hint
        multiple
      >
        <template slot="selection" slot-scope="{ selected, item }">
          <slot name="selection" :selectionId="item.value" :selectionName="item.text">
            <span v-text="item.text"/>
          </slot>
        </template>
      </v-autocomplete>
      <v-layout row wrap>
        <v-flex xs12 sm6 class="pa-0">
          <v-btn
            @click="localSelectedIds = idsToConsider.slice()"
            :disabled="idsToConsider.length > 100"
            :block="$vuetify.breakpoint.xsOnly"
            flat
          >
            {{ `All (${allEntries.length})` }}
          </v-btn>
        </v-flex>
        <v-flex xs12 sm6 class="pa-0 text-xs-right">
          <v-btn
            @click="localSelectedIds = []"
            :block="$vuetify.breakpoint.xsOnly"
            flat
          >
            None
          </v-btn>
        </v-flex>
      </v-layout>
      <v-layout v-if="idsToConsider.length > 10">
        <v-alert
          :value="true"
          :type="alertType"
        >
          Comparing too many units may lead to huge performance issues, so be careful when selecting which entries to compare.
        </v-alert>
      </v-layout>
    </v-card-text>
    <v-card-actions style="flex-wrap: wrap;">
      <v-flex xs12>
        <v-btn
          block flat
          @click="addToExistingComparison"
          :disabled="localSelectedIds.length === 0"
        >
          <v-icon left>file_copy</v-icon>
          Add to Existing Comparison
        </v-btn>
      </v-flex>
      <v-flex xs12>
        <v-btn
          block flat
          @click="createNewComparison"
          :disabled="!hasPreviousComparison() || localSelectedIds.length === 0"
        >
          <v-icon left>insert_drive_file</v-icon>
          Add to New Comparison
        </v-btn>
      </v-flex>
      <v-flex xs12>
        <v-btn block flat>
          Cancel
        </v-btn>
      </v-flex>
    </v-card-actions>
  </v-card>
</template>

<script>
import compareInputManager from '@/modules/CompareInputManager';

const BASE_COMPARISON_LINK = '/tools/compare?input=';
export default {
  props: {
    compareType: {
      type: String,
      required: true,
    },
    idsToConsider: {
      type: Array,
      required: true,
    },
    getName: {
      type: Function,
      default: (id) => id,
    },
  },
  computed: {
    allEntries () {
      const { getName } = this;
      return this.idsToConsider.map(id => ({ text: getName(id), value: id }));
    },
    alertType () {
      const selectionCount = this.localSelectedIds.length;
      return [
        selectionCount > 25 && 'error',
        selectionCount > 10 && 'warning',
        'info',
      ].find(v => v);
    },
    transformedSelection () {
      return this.localSelectedIds.map(id => ({ type: this.compareType, id }));
    },
  },
  data () {
    return {
      localSelectedIds: [],
    };
  },
  methods: {
    createNewComparison () {
      compareInputManager.compareInput = this.transformedSelection;
      this.closeWithSnackbar(`Created new comparison with ${this.localSelectedIds.length} entries`);
    },
    addToExistingComparison () {
      compareInputManager.compareInput = compareInputManager.compareInput.concat(this.transformedSelection);
      this.closeWithSnackbar(`Added ${this.localSelectedIds.length} entries to existing comparison`);
    },
    emitClose () {
      this.$emit('close');
    },
    closeWithSnackbar (message) {
      this.$emit('close', {
        value: true,
        message,
        link: `${BASE_COMPARISON_LINK}${compareInputManager.compareInputString}`,
      });
    },
    hasPreviousComparison () {
      return !!compareInputManager.compareInputString;
    },
  },
};
</script>

