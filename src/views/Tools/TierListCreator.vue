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
import { convertCodeToCategory, convertCodeToEntry } from '@/modules/core/tier-list-creator';

export default {
  props: {
    code: {
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
    splitCode () {
      const [categoriesCode = '', entriesCode = ''] = (this.code || '').split('.');
      return {
        categoriesCode,
        entriesCode,
      };
    },
    categories () {
      return this.splitCode.categoriesCode
        .split(',')
        .map(convertCodeToCategory)
        .filter(v => v);
    },
    entries () {
      const numCategories = this.categories.length;
      return this.splitCode.entriesCode
        .split('!')
        .map((categoryEntries, i) => {
          if (i < numCategories) {
            return categoryEntries
              .split(',')
              .map(convertCodeToEntry)
              .filter(v => v);
          }
        })
        .filter(v => v);
    },
  },
};
</script>
