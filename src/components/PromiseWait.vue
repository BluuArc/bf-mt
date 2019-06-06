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
      <template v-else-if="hasError">
        <slot name="error" :error="error">
          <span>Error: {{ error.message || JSON.stringify(error) }}</span>
        </slot>
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
import { Logger } from '@/modules/Logger';
import LoadingIndicator from '@/components/LoadingIndicator';

const logger = new Logger({ prefix: '[PromiseWait]' });
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
      hasError: false,
      error: null,
      loadingDebouncer: null,
    };
  },
  created () {
    if (this.loadingDebouncer) {
      this.loadingDebouncer.dispose();
    }
    this.loadingDebouncer = new LoadingDebouncer(val => {
      this.isVisuallyLoading = val;
    });

    this.loadingDebouncer.setValue(() => this.isInternallyLoading);
  },
  mounted () {
    // delay showing any loading messages to prevent brief flash of message for quickly resolved promises
    setTimeout(() => {
      this.isPostMount = true;
    }, 25);
  },
  beforeDestroy () {
    if (this.loadingDebouncer) {
      this.loadingDebouncer.dispose();
    }
  },
  watch: {
    isInternallyLoading () {
      this.loadingDebouncer.setValue(() => this.isInternallyLoading);
    },
    promise: {
      immediate: true,
      handler (newPromise) {
        this.result = null;
        this.hasError = false;
        this.error = null;
        this.isInternallyLoading = true;
        Promise.resolve(newPromise)
          .then((result) => {
            this.result = result;
          }).catch((err) => {
            this.error = err || new Error('An error has occurred.');
            this.hasError = true;
            logger.error(err);
          }).then(() => {
            this.isInternallyLoading = false;
          });
      },
    },
  },
};
</script>

