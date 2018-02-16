<template>
  <div id="router-view" class="container fluid">
    <router-view :fullUnitData='fullUnitData' class='router-view-child'/>
  </div>
</template>

<script>
export default {
  props: ['fullUnitData'],
};
</script>

<style>
#router-view .router-view-child {
  height: 100%;
  overflow: auto;
  position: relative;
}

#router-view {
  height: calc(100% - 42px);
  margin-top: 42px;
  margin-bottom: -42px;
}
</style>
