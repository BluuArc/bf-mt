import MainPageBase from '@/components/Multidex/MainPageBase';
import MultidexPageBase from '@/components/Multidex/MultidexPageBase';
import ModuleChecker from '@/components/ModuleChecker';

export default {
  props: ['query', 'viewId', 'server', 'filters', 'isSelectMode'],
  components: {
    MainPageBase,
    MultidexPageBase,
    ModuleChecker,
  },
  methods: {
    getEntryById (id) {
      return (this.pageDb || {})[id] || {};
    },
    getAllEntryKeys () {
      return Object.keys(this.pageDb || {});
    },
  },
};
