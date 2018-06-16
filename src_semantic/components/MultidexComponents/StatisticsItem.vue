<template>
  <div class='event'>
    <div class='content'>
      <div class='summary' v-html="htmlContent"></div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['htmlContent'],
};
</script>
