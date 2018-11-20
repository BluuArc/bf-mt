import LazyLoadImage from './LazyLoadImage';

export default {
  props: {
    displayWidth: {
      type: Number,
      default: 0,
    },
    displayHeight: {
      type: Number,
      default: 0,
    },
  },
  components: {
    LazyLoadImage,
  },
};
