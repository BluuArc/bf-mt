<template>
  <v-container fluid class="pt-0">
    <v-layout row v-show="tabs.length > 1">
      <v-flex class="pb-0">
        <v-tabs
          v-model="localValue"
          class="mb-2"
          show-arrows
          :grow="growTabs"
          :centered="centeredTabs"
          :color="color || undefined">
          <v-tab v-for="(tab, i) in tabs" :key="i">{{ tab.name }}</v-tab>
        </v-tabs>
      </v-flex>
    </v-layout>
    <v-layout row :class="{ 'mt-2': tabs.length <= 1 }">
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
import debounce from 'lodash/debounce';

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
    centeredTabs: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: '',
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
    removeHeight () {
      this.$el.querySelector('.v-window__container').style.height = '';
    },
    debouncedRemoveHeight: debounce(function () {
      this.removeHeight();
      this.debouncedCheckHeight();
    }, 500),
    debouncedCheckHeight: debounce(function () {
      if (this.$el && this.$el.querySelector('.v-window__container').style.height) {
        this.debouncedRemoveHeight();
      }
    }, 1000),
  },
  watch: {
    value (newValue) {
      this.localValue = newValue;
      this.debouncedRemoveHeight();
    },
    localValue (newValue) {
      this.lazyCache[newValue] = true;
      this.emitValue();
    },
  },
  mounted () {
    this.localValue = this.value;
    this.debouncedCheckHeight();
  },
};
</script>
