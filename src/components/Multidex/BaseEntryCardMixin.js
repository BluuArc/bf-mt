import BaseEntryCard from '@/components/Multidex/BaseEntryCard';

export default {
  props: {
    to: {
      type: String,
      default: '',
    },
    entry: {
      type: Object,
      required: true,
    },
  },
  components: {
    BaseEntryCard,
  },
};
