<template>
  <description-card-base
    :entry="item"
    materialColor="orange darken-3"
    :titleHtmlGenerator="() => 'General Info'"
    :descriptionGetter="() => description"
    :effectGetter="() => effects"
    :treeOptions="{ maxDepth: 1 }"/>
</template>

<script>
import DescriptionCardBase from '@/components/Multidex/DescriptionCardBase';
import { getItemEffects } from '@/modules/core/items';

export default {
  props: {
    item: {
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
      return this.item ? this.item.desc : 'None';
    },
    effects () {
      return this.item && getItemEffects(this.item);
    },
  },
};
</script>
