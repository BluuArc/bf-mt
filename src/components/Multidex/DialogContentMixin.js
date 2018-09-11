import DialogContentBase from './DialogContentBase';

export default {
  props: {
    entryId: {
      type: String,
      required: true,
    },
    logger: {
      required: true,
    },
    pageDb: {
      type: Object,
      required: true,
    },
    asyncGetById: {
      type: Function,
      required: true,
    },
  },
  components: {
    DialogContentBase,
  },
  data() {
    return {
      entry: undefined,
      loadingEntryData: true,
    };
  },
  watch: {
    async entryId (newValue) {
      if (!newValue) {
        this.entry = undefined;
      } else {
        await this.loadEntry();
      }
    },
    async pageDb () {
      if (this.entryId && Object.keys(this.pageDb).length > 0) {
        await this.loadEntry();
      }
    },
  },
  methods: {
    async loadEntry () {
      this.loadingEntryData = true;
      try {
        this.entry = await this.asyncGetById(this.entryId);
      } catch (err) {
        this.logger.error(err);
      } finally {
        this.loadingEntryData = false;
      }
    },
  },
  async mounted () {
    if (this.entryId) {
      await this.loadEntry();
    }
  },
};
