<template functional>
  <div class="loading-indicator">
    <v-progress-circular indeterminate/>
    <h1 class="subheading" v-text="props.loadingMessage || 'Waiting for data to finish loading.'"/>
  </div>
</template>

<style lang="less">
.loading-indicator {
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
</style>
