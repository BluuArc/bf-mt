<template>
  <module-checker :requiredModules="requiredModules">
    <tier-list-creator-page
      :categories="categories"
      :entries="entries"
    />
  </module-checker>
</template>

<script>
import ModuleChecker from '@/components/ModuleChecker';
import TierListCreatorPage from '@/components/Tools/TierListCreator/Main';

export default {
  props: {
    categories: {
      // strings separated by commas
      type: String,
      default: '',
    },
    entries: {
      // <type>-<id> separated by commas for each categories, sets divided by tilde
      type: String,
      default: '',
    },
  },
  components: {
    ModuleChecker,
    TierListCreatorPage,
  },
  computed: {
    requiredModules: () => Object.freeze([
      'units',
      'items',
    ]),
  },
};
</script>
