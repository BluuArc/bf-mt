import BaseEntryCard from '@/components/Multidex/BaseEntryCard';

export default {
  props: {
    to: {
      type: String,
      default: '',
    },
    entry: {
      required: true,
    },
  },
  components: {
    BaseEntryCard,
  },
};
