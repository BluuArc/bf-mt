<template>
  <div class="ui raised segments" v-if="burstData && !burstData.error">
    <div :class="getHeaderClass()">{{ burstType }}</div>
    <div class="ui segment">{{ burstData.desc }}</div>
  </div>
</template>

<script>
export default {
  props: ['burstData', 'burstType'],
  data() {
    return {
      typeColorMapping: {
        'Brave Burst': 'grey',
        'Super Brave Burst': 'yellow',
        'Ultimate Brave Burst': 'red',
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
