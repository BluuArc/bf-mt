<template>
  <description-card-base
    class="summary-card"
    :entry="unit"
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
        <div v-show="isShowing" style="overflow-x: auto;">
          <!-- <buff-table-grid :effects="effects" v-if="hasShownBuffTable" :showHeaders="true"/> -->
          It's showing
        </div>
      </v-slide-y-transition>
    </v-layout>
  </template>
  </description-card-base>
</template>

<script>
import DescriptionCardBase from '@/components/Multidex/DescriptionCardBase';
export default {
  props: {
    unit: {
      type: Object,
    },
  },
  components: {
    DescriptionCardBase,
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
    };
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

<style>

</style>
