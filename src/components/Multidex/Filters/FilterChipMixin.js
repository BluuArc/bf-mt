export default {
  props: {
    // array of strings indicating filter name
    // used to decide if chip should be shown
    requiredFilters: {
      type: Array,
      default: () => [],
    },
    // used to decide data to be shown in chip
    filterOptions: {
      type: Object,
      default: () => {},
    },
  },
};
