import PanelHeader from './PanelHeader';

export default {
  props: {
    // array of strings indicating filter name
    requiredFilters: {
      type: Array,
      default: () => [],
    },
    // would override requiredFilters check
    requireFilter: {
      type: Boolean,
      default: false,
    },
    value: {
      type: Object,
      default: () => {},
    },
    disableFilters: {
      type: Boolean,
      default: false,
    },
    filterHelper: {
      required: true,
    },
  },
  components: {
    PanelHeader,
  },
  computed: {
    showPanel() {
      return this.requireFilter || this.requiredFilters.includes(this.filterKey);
    },
    hasFilters() {
      return this.filterHelper.hasFilters(this.value, this.filterKey);
    },
  },
  methods: {
    emitChange () {
      this.$emit('input', this.value);
    },
  },
  watch: {
    value: {
      deep: true,
      handler () {
        this.emitChange();
      },
    },
  },
};
