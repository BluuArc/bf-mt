<template>
  <module-checker
    :requiredModules="requiredModules"
    :ensureDbSync="true"
  >
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

const DEFAULT_CODE = 'S-000000-ff8a80,A-000000-ffd180,B-000000-ffee58,C-000000-81c784,D-000000-64b5f6';
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
  data () {
    return {
      isFirstLoad: true,
    };
  },
  computed: {
    requiredModules: () => Object.freeze([
      'units',
      'items',
    ]),
    splitCode () {
      const [categoriesCode = '', entriesCode = ''] = (this.code || (this.isFirstLoad &&  DEFAULT_CODE) || '').split('.');
      return {
        categoriesCode,
        entriesCode,
      };
    },
    categories () {
      return this.splitCode.categoriesCode
        .split(',')
        .map(code => convertCodeToCategory(code, true))
        .filter(v => v);
    },
    entries () {
      const rawEntries = this.splitCode.entriesCode.split('!');
      return this.categories
        .map((_, i) => {
          const categoryEntries = rawEntries[i] || '';
          return categoryEntries
            .split(',')
            .map(convertCodeToEntry)
            .filter(v => v);
        });
    },
  },
  watch: {
    code () {
      this.isFirstLoad = false;
    },
  },
};
</script>
