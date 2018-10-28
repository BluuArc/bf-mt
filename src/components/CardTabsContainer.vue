<template>
  <v-container fluid class="pt-0">
    <v-layout row>
      <v-flex class="pb-0">
        <v-tabs v-model="localValue" class="mb-2" :grow="growTabs">
          <v-tab v-for="(tab, i) in tabs" :key="i">{{ tab.name }}</v-tab>
        </v-tabs>
      </v-flex>
    </v-layout>
    <v-layout row>
      <v-flex class="pa-0">
        <v-tabs-items v-model="localValue" touchless>
          <v-tab-item v-for="(tab, i) in tabs" :key="i">
            <template v-if="fullLoad || lazyCache[i]">
              <slot :name="tab.slot">
                {{ tab.name }}
              </slot>
            </template>
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
    // load everything on mount
    fullLoad: {
      type: Boolean,
      default: false,
    },
    growTabs: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      localValue: 0,
      lazyCache: {
        0: true, // first tab is always rendered
      },
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
    localValue (newValue) {
      this.lazyCache[newValue] = true;
      this.emitValue();
    },
  },
  mounted () {
    this.localValue = this.value;
  },
};
</script>
