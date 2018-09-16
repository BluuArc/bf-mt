<template>
  <description-card-base
    :entry="extraSkill"
    materialColor="orange darken-4"
    :titleHtmlGenerator="() => `<b>Extra Skill: ${name}</b>`"
    :multidexPath="extraSkill && getMultidexPathTo(extraSkill.id) || ''"
    :descriptionGetter="() => description"
    :treeOptions="{ maxDepth: 1 }"/>
</template>

<script>
import { mapGetters } from 'vuex';
import DescriptionCardBase from '@/components/Multidex/DescriptionCardBase';

export default {
  props: {
    unit: {
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
    ...mapGetters('extraSkills', ['getMultidexPathTo']),
    extraSkill () {
      return this.unit && this.unit['extra skill'];
    },
    name () {
      return this.extraSkill ? this.extraSkill.name : 'None';
    },
    description () {
      return this.extraSkill ? this.extraSkill.desc : 'None';
    },
  },
};
</script>
