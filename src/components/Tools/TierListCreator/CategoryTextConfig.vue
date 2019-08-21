<template>
  <v-layout column>
    <v-layout align-baseline justify-space-between>
      <h3>Category Name</h3>
      <v-flex style="flex: none;">
        <v-switch
          class="mt-0"
          hide-details
          v-model="isMultiLine"
          label="Multi-line"
        />
      </v-flex>
    </v-layout>
    <v-layout v-if="!isMultiLine" align-baseline>
      <v-text-field v-model="localValue"/>
      <v-btn flat :outline="hasDirtyInput" @click="emitChange(localValue)">
        Apply
      </v-btn>
    </v-layout>
    <v-layout v-else column>
      <v-textarea v-model="localValue" hide-details/>
      <v-btn flat :outline="hasDirtyInput" @click="emitChange(localValue)">
        Apply
      </v-btn>
    </v-layout>
  </v-layout>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: '',
    },
  },
  data () {
    return {
      isMultiLine: false,
      localValue: '',
    };
  },
  computed: {
    hasDirtyInput () {
      return this.value !== this.localValue;
    },
  },
  methods: {
    emitChange (newValue) {
      this.$emit('change', newValue);
    },
  },
  watch: {
    value: {
      immediate: true,
      handler (newValue) {
        this.localValue = newValue.slice();
        if (newValue && newValue.includes('\n')) {
          this.isMultiLine = true;
        }
      },
    },
    isMultiLine (newValue) {
      if (!newValue) {
        this.localValue = this.localValue.replace(/\n/g, ' ');
      }
    },
  },
};
</script>

<style>

</style>
