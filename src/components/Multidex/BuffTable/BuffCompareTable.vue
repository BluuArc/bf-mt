<template>
  <table class="buff-compare-table">
    <thead>
      <tr>
        <th class="id-column">
          ID
        </th>
        <th class="property-column">
          Buff Property
        </th>
        <th class="value-column" v-for="(entry, i) in entries" :key="`${entry}-${i}`">
          <span slot="value-header" :entry="entry">
            {{ entry }}
            One value column for every given unit
          </span>
          <div>Clicking on column will collapse data for it</div>
        </th>
      </tr>
    </thead>
    <tbody>
      <template v-for="(effectId, i) in sortedEffectIds">
        <tr :key="`${effectId}-${i}`">
          <!-- ID cell -->
        </tr>
      </template>
    </tbody>
  </table>
</template>

<script>
export default {
  props: {
    entries: {
      type: Array,
      default: [],
    },
    // for a given entry, return an array of effects (synchronous)
    getEntryEffects: {
      type: Function,
      default: () => [],
    },
  },
  computed: {
    // assumption: 1 type of effect (passive or proc)
    effectsById () {
      const mapping = this.entries.reduce((acc, entry) => {
        const effects = this.getEntryEffects(entry);
        effects.forEach(effect => {
          if (!effect.source) {
            effect.source = entry;
          }

          if (!acc[effect.id]) {
            acc[effect.id] = [];
          }
          acc[effect.id].push(effect);
          return acc;
        });
      }, {});
      return Object.freeze(mapping);
    },
    propMapping () {
      const mapping = Object.keys(this.effectsById).reduce((acc, key) => {
        const props = new Set();

        const effects = this.effectsById[key];
        effects.forEach(effect => {
          Object.keys(effect).forEach(prop => {
            props.add(prop);
          });
        });
        acc[key] = Array.from(props);
        return acc;
      }, {});
      return Object.freeze(mapping);
    },
    sortedEffectIds () {
      return Object.keys(this.effectsById).sort((a, b) => +a - +b);
    },
  },
  data () {
    return {
      hiddenRows: [],
    },
  },
},
</script>
