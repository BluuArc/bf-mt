<template>
  <description-card-base
    :entry="skill"
    materialColor="purple lighten-1"
    :titleHtmlGenerator="() => 'Effects'"
    :treeOptions="{ maxDepth: 1 }"
    :effectGetter="() => effects"
    :contextHandler="() => ({ isLS: true })"
    :tabNames="['Buff Table', 'Buff List']">
    <v-container fluid class="pt-1" slot="buff-table" style="overflow-x: auto;">
      <buff-table :effects="effects" :showHeaders="true" v-if="effects.length > 0"/>
      <span v-else>
        No effects found.
      </span>
    </v-container>
  </description-card-base>
</template>

<script>
import DescriptionCardBase from '@/components/Multidex/DescriptionCardBase';
import BuffTable from '@/components/Multidex/BuffTable/MainTable';
// import BuffList from '@/components/Multidex/BuffList/BuffList';

export default {
  props: {
    skill: {
      type: Object,
    },
    logger: {
      required: true,
    },
  },
  components: {
    DescriptionCardBase,
    BuffTable,
  },
  computed: {
    effects () {
      return (this.skill && this.skill.effects) || [];
    },
  },
};
</script>
