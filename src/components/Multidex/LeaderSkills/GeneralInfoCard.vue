<template>
  <description-card-base
    :entry="skill"
    materialColor="green darken-3"
    :titleHtmlGenerator="() => 'General Info'"
    :descriptionGetter="() => description"
    :treeOptions="{ maxDepth: 1 }"
    :effectGetter="() => []"
    :tabNames="['Description', 'JSON'].filter(val => val)">
    <template slot="description">
      {{ description }}
    </template>
  </description-card-base>
</template>

<script>
import DescriptionCardBase from '@/components/Multidex/DescriptionCardBase';
import CardTitleWithLink from '@/components/CardTitleWithLink';

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
    CardTitleWithLink,
  },
  computed: {
    description () {
      return (this.skill && this.skill.desc) || 'None';
    },
  },
};
</script>
