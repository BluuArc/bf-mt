<template>
  <v-container fluid class="pt-0">
    <v-layout row>
      <v-flex>
        <v-tabs v-model="localValue" class="mb-2">
          <v-tab v-for="(tab, i) in tabs" :key="i">{{ tab.name }}</v-tab>
        </v-tabs>
      </v-flex>
    </v-layout>
    <v-layout row>
      <v-flex>
        <v-tabs-items v-model="localValue" touchless>
          <v-tab-item v-for="(tab, i) in tabs" :key="i">
            <slot :name="tab.slot">
              {{ tab.name }}
            </slot>
          </v-tab-item>
        </v-tabs-items>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  props: {
    tabs: {
      type: Array,
      default: () => [
        {
          name: 'Tab 1',
          slot: 'tab-1',
        },
      ],
    },
    value: {
      type: Number,
      default: 0,
    },
  },
  data () {
    return {
      localValue: 0,
    };
  },
  methods: {
    emitValue () {
      this.$emit('input', this.localValue);
    },
  },
  watch: {
    value (newValue) {
      this.localValue = newValue;
    },
    localValue () {
      this.emitValue();
    },
  },
  mounted () {
    this.localValue = this.value;
  },
};
</script>
