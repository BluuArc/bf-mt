<template>
  <router-view :fullUnitData='this.fullUnitData'/>
</template>

<script>
export default {
  props: ['fullUnitData'],
};
</script>
