<template>
  <description-card-base
    :entry="mission"
    materialColor="amber darken-2"
    :titleHtmlGenerator="() => 'General Info'"
    :descriptionGetter="() => description"
    :treeOptions="{ maxDepth: 1 }"
    :effectGetter="() => []"
    :tabNames="['Description', 'JSON'].filter(val => val)">
    <template fluid slot="description">
      <p v-if="ladText" v-text="ladText"/>
      <p v-text="description"/>
    </template>
  </description-card-base>
</template>

<script>
import DescriptionCardBase from '@/components/Multidex/DescriptionCardBase';

export default {
  props: {
    mission: {
      type: Object,
    },
    logger: {
      required: true,
    },
  },
  components: {
    DescriptionCardBase,
  },
  computed: {
    description () {
      return (this.mission && this.mission.desc) || 'None';
    },
    ladText () {
      return !this.mission ? '' : [
        this.mission.land,
        this.mission.area,
        this.mission.dungeon,
      ].filter(v => v).join(' / ');
    },
  },
};
</script>
