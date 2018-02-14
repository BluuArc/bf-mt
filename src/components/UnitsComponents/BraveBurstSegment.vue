<template>
  <div class="ui raised segments" v-if="burstData && !burstData.error">
    <div :class="getHeaderClass()"><b>{{ burstType }}: </b>{{ burstData.name }}</div>
    <div class="ui segment">{{ burstData.desc }}</div>
  </div>
</template>

<script>
export default {
  props: ['burstData', 'burstType'],
  data() {
    return {
      typeColorMapping: {
        BB: 'grey',
        SBB: 'yellow',
        UBB: 'red',
      },
    };
  },
  methods: {
    getHeaderClass() {
      const classObject = { ui: true, inverted: true, segment: true };
      classObject[this.typeColorMapping[this.burstType]] = true;
      return classObject;
    },
  },
};
</script>
