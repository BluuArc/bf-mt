<template>
  <span>
    <v-speed-dial
      class="compare-speed-dial"
      v-model="fabModel"
      transition="slide-y-reverse-transition"
      direction="top"
      right bottom
      fixed>
      <v-btn
        v-model="fabModel"
        @transitionend="() => repositionTooltip()"
        slot="activator"
        color="primary"
        fab>
        <v-icon>add</v-icon>
        <v-icon>close</v-icon>
      </v-btn>
      <v-tooltip
        v-model="showTooltip"
        z-index="500"
        left>
        <v-btn
          @click="() => createNewComparison()"
          fab
          small
          outline
          slot="activator">
          <v-icon>insert_drive_file</v-icon>
        </v-btn>
        <span class="compare-speed-dial--tooltip-text">Create New Comparison</span>
      </v-tooltip>
      <v-tooltip
        v-if="hasPreviousComparison()"
        v-model="showTooltip"
        z-index="500"
        :key="compareCode"
        left>
        <v-btn
          @click="() => addToExistingComparison()"
          fab
          small
          outline
          slot="activator">
          <v-icon>file_copy</v-icon>
        </v-btn>
        <span class="compare-speed-dial--tooltip-text">Add to Comparison</span>
      </v-tooltip>
    </v-speed-dial>
    <v-snackbar
      v-model="showSnackbar"
      color="success"
      bottom
    >
      {{ snackbarMessage }}
      <v-btn flat :to="snackbarLink">
        View
      </v-btn>
    </v-snackbar>
  </span>
</template>

<script>
import debounce from 'lodash/debounce';
import compareInputManager from '@/modules/CompareInputManager';

const BASE_COMPARISON_LINK = '/tools/compare?input=';
export default {
  props: {
    compareCode: {
      type: String,
      required: true,
    },
  },
  methods: {
    repositionTooltip: debounce(function (forceReposition) {
      if (this.fabModel || forceReposition) {
        this.$nextTick().then(() => {
          this.showTooltip = false;
        });
      }
    }, 200),
    hasPreviousComparison () {
      return !!compareInputManager.compareInputString;
    },
    addToExistingComparison () {
      const newComparison = this.hasPreviousComparison()
        ? `${compareInputManager.compareInputString},${this.compareCode}`
        : this.compareCode;
      compareInputManager.compareInputString = newComparison;
      this.snackbarMessage = 'Added entry to existing comparison';
      this.snackbarLink = `${BASE_COMPARISON_LINK}${newComparison}`;
      this.showSnackbar = true;
    },
    createNewComparison () {
      compareInputManager.compareInputString = this.compareCode;
      this.snackbarMessage = 'Created new comparison with entry';
      this.snackbarLink = `${BASE_COMPARISON_LINK}${this.compareCode}`;
      this.showSnackbar = true;
    },
  },
  data () {
    return {
      showTooltip: true,
      fabModel: false,
      showSnackbar: false,
      snackbarMessage: '',
      snackbarLink: '',
    };
  },
  watch: {
    async showTooltip (isShowing) {
      if (!isShowing) {
        this.$nextTick().then(() => {
          this.showTooltip = true;
        });
      }
    },
    compareCode: {
      immediate: true,
      handler () {
        this.showSnackbar = false;
        this.snackbarMessage = '';
        this.snackbarLink = '';
      },
    },
  },
};
</script>

