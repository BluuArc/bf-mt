<template>
  <div id="router-view" class="container fluid">
    <transition name="component-fade" mode="out-in">
      <router-view
        :fullUnitData="fullUnitData"
        :fullItemData="fullItemData"
        :fullExtraSkillData="fullExtraSkillData"
        :fullBurstData="fullBurstData"
        class='router-view-child'
        v-on:updateheader="passHeaderUpdate"/>
    </transition>
  </div>
</template>

<script>
export default {
  props: ['fullUnitData', 'fullItemData', 'fullExtraSkillData', 'fullBurstData'],
  methods: {
    passHeaderUpdate(data) {
      this.$emit('updateheader', data);
    },
  },
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

/* based off of "Transitioning Between Components section in https://vuejs.org/v2/guide/transitions.html */
.component-fade-enter-active, .component-fade-leave-active {
  transition: opacity .2s ease;
}
.component-fade-enter, .component-fade-leave-to {
  opacity: 0;
}
</style>
