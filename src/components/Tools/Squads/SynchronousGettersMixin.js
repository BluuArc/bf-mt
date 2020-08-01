export default {
  props: {
    getUnit: {
      type: Function,
      default: () => ({}),
    },
    getItem: {
      type: Function,
      default: () => ({}),
    },
    getExtraSkill: {
      type: Function,
      default: () => ({}),
    },
    getLeaderSkill: {
      type: Function,
      default: () => ({}),
    },
  },
};
