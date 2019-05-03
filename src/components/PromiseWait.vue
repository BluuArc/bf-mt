<template>
  <div>
    <v-fade-transition mode="out-in">
      <template v-if="isVisuallyLoading">
        <template v-if="isPostMount">
          <slot name="loading">
            <loading-indicator :loadingMessage="loadingMessage"/>
          </slot>
        </template>
      </template>
      <template v-else>
        <slot name="default" :result="result">
          <span>{{ result }}</span>
        </slot>
      </template>
    </v-fade-transition>
  </div>
</template>

<script>
import LoadingDebouncer from '@/modules/LoadingDebouncer';
import LoadingIndicator from '@/components/LoadingIndicator';

let loadingDebouncer;
export default {
  props: {
    promise: {
      required: true,
    },
    loadingMessage: {
      type: String,
      default: 'Loading...',
    },
  },
  components: {
    LoadingIndicator,
  },
  data () {
    return {
      isInternallyLoading: true,
      isVisuallyLoading: true,
      isPostMount: false,
      result: null,
    };
  },
  beforeCreate () {
    if (loadingDebouncer) {
      loadingDebouncer.dispose();
    }
    loadingDebouncer = new LoadingDebouncer(val => {
      this.isVisuallyLoading = val;
    });
  },
  mounted () {
    // delay showing any loading messages to prevent brief flash of message for quickly resolved promises
    setTimeout(() => {
      this.isPostMount = true;
    }, 25);
  },
  beforeDestroy () {
    if (loadingDebouncer) {
      loadingDebouncer.dispose();
    }
  },
  watch: {
    isInternallyLoading: {
      immediate: true,
      handler () {
        loadingDebouncer.setValue(() => this.isInternallyLoading);
      },
    },
    promise: {
      immediate: true,
      handler (newPromise) {
        this.result = null;
        this.isInternallyLoading = true;
        Promise.resolve(newPromise)
          .then((result) => {
            this.result = result;
            this.isInternallyLoading = false;
          });
      },
    },
  },
};
</script>

