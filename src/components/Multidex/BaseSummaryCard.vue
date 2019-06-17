<template>
  <description-card-base
    class="summary-card"
    :entry="entry"
    materialColor="blue"
    :titleHtmlGenerator="() => `<b>Buff Overview</b>`"
    :tabNames="['Overview']"
  >
    <template slot="overview">
      <v-layout column>
        <v-flex>
          <v-btn block flat large @click="isShowing = !isShowing">{{ buttonText }}</v-btn>
        </v-flex>
        <v-slide-y-transition>
          <div v-show="isShowing" style="overflow-x: visible;">
            <buff-expandable-list-view
              v-if="hasShown"
              :viewMode="viewMode"
              @viewmode="$v => viewMode = $v"
              :sources="buffSources"
              :getEffectsFromSource="getEffectsFromSource"
              :stickyTitles="false"
            >
              <span slot="allentrypreview" slot-scope="{ entries }">
                <slot name="allentrypreview" :entries="entries">
                  <span v-for="(source, i) in entries" :key="i">
                    {{ source }}
                  </span>
                </slot>
              </span>
              <span slot="value-header" slot-scope="{ entry }">
                <slot name="value-header" :entry="entry">
                  {{ entry }}
                </slot>
              </span>
            </buff-expandable-list-view>
          </div>
        </v-slide-y-transition>
      </v-layout>
    </template>
  </description-card-base>
</template>

<script>
import DescriptionCardBase from '@/components/Multidex/DescriptionCardBase';
import BuffExpandableListView from '@/components/Multidex/BuffList/GenericBuffExpandableList/BuffExpandableListView';

export default {
  props: {
    entry: {
      type: Object,
      required: true,
    },
    getEffectsFromSource: {
      type: Function,
      required: true,
    },
    buffSources: {
      type: Array,
      required: true,
    },
    initialViewMode: {
      type: String,
      default: '',
    },
  },
  components: {
    DescriptionCardBase,
    BuffExpandableListView,
  },
  computed: {
    buttonText () {
      return `${this.isShowing ? 'Hide' : 'Show'} Buff Overview`;
    },
  },
  data () {
    return {
      isShowing: false,
      hasShown: false,
      viewMode: 'overview', // default to overview for summary cards
    };
  },
  created () {
    this.viewMode = this.initialViewMode || this.viewMode;
  },
  watch: {
    isShowing (showing) {
      if (showing && !this.hasShown) {
        this.hasShown = true;
      }
    },
  },
};
</script>
