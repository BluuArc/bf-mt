<template>
  <table class="buff-table">
    <thead v-if="showHeaders">
      <tr>
        <th class="id-column">
          <v-btn flat @click="toggleAllEffectViews" small style="min-width: 36px;">
            <v-icon>{{ hiddenIndices.length === mappedEffects.length ? 'expand_more' : 'expand_less' }}</v-icon>
            ID
          </v-btn>
        </th>
        <th class="property-column">
          Buff Property
        </th>
        <th class="value-column">
          Buff Value
        </th>
      </tr>
    </thead>
    <tbody>
      <template v-for="(effectEntry, i) in mappedEffects">
        <tr :key="`${effectEntry.id}-${i}`">
          <!-- ID column -->
          <td
            class="id-column"
            :rowspan="hiddenIndices.includes(i) ? 1 : getSortedProps(effectEntry.effect).length">
            <v-btn
              flat small
              class="collapse-btn"
              @click="() => toggleEffectView(i)">
              <div style="flex: 1 1 100%;">
                <v-icon>{{ hiddenIndices.includes(i) ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</v-icon>
              </div>
              <div style="flex: 1 1 100%;">
                {{ effectEntry.id }}
              </div>
              <div style="flex: 1 1 100%;">
                <v-icon>{{ hiddenIndices.includes(i) ? 'keyboard_arrow_down' : 'keyboard_arrow_up' }}</v-icon>
              </div>
              <!-- <v-icon>{{ hiddenIndices.includes(i) ? 'unfold_more' : 'unfold_less' }}</v-icon>
              {{ effectEntry.id }} -->
            </v-btn>
          </td>
          <!-- buff row -->
          <template v-if="!hiddenIndices.includes(i)">
            <td class="property-column property-row--odd">
              {{ getSortedProps(effectEntry.effect)[0] }}
            </td>
            <td
              class="value-column value-row--odd"
              v-if="isProcBuffList(effectEntry, getSortedProps(effectEntry.effect)[0])">
              <buff-table :effects="effectEntry.effect[getSortedProps(effectEntry.effect)[0]]" :showHeaders="false"/>
              <!-- {{ effectEntry.effect[getSortedProps(effectEntry.effect)[0]] }} -->
            </td>
            <td
              class="value-column value-row--odd"
              v-else>
              {{ effectEntry.effect[getSortedProps(effectEntry.effect)[0]] }}
              <span v-if="Array.isArray(effectEntry.effect[getSortedProps(effectEntry.effect)[0]]) && effectEntry.effect[getSortedProps(effectEntry.effect)[0]].length === 0">
                (None)
              </span>
            </td>
          </template>
          <td v-else colspan="2">
            {{ getSortedProps(effectEntry.effect).length }} Effects Hidden
          </td>
        </tr>

        <!-- subsequent buff rows for given ID -->
        <template v-if="!hiddenIndices.includes(i)">
          <tr
            v-for="(prop, j) in getSortedProps(effectEntry.effect).slice(1)"
            :key="`${effectEntry.id}-${i}-${j}`">
            <!-- <td colspan="2">
              <div class="d-flex-container" style="justify-content: space-evenly;">
                <span style="flex: none;">{{ prop }}</span>
                <div v-if="isProcBuffList(effectEntry, prop)">
                  <buff-table :effects="effectEntry.effect[prop]" :showHeaders="false"/>
                </div>
                <span v-else>
                  {{ effectEntry.effect[prop] }}
                  <span v-if="Array.isArray(effectEntry.effect[prop]) && effectEntry.effect[prop].length === 0">
                    (None)
                  </span>
                </span>
              </div>
            </td> -->
            <td :class="{ 'property-column': true, [`property-row--${j % 2 === 0 ? 'even' : 'odd'}`]: true }">
              {{ prop }}
            </td>
            <td
              :class="{ 'value-column': true, [`value-row--${j % 2 === 0 ? 'even' : 'odd'}`]: true }"
              v-if="isProcBuffList(effectEntry, prop)">
              <buff-table :effects="effectEntry.effect[prop]" :showHeaders="false"/>
            </td>
            <td
              :class="{ 'value-column': true, [`value-row--${j % 2 === 0 ? 'even' : 'odd'}`]: true }"
              v-else>
              {{ effectEntry.effect[prop] }}
              <span v-if="Array.isArray(effectEntry.effect[prop]) && effectEntry.effect[prop].length === 0">
                (None)
              </span>
            </td>
          </tr>
        </template>
      </template>
      <!-- <tr>{{ mappedEffects }}</tr> -->
    </tbody>
  </table>
</template>

<script>
import { getEffectType, getEffectId } from '@/modules/EffectProcessor/processor-helper';
// import { mapState, mapMutations } from 'vuex';

export default {
  props: {
    effects: {
      type: Array,
      default: () => [],
    },
    showHeaders: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    // ...mapState(['maxColumnWidthForBuffTable']),
    idKeys: () => ['passive id', 'unknown passive id', 'proc id', 'unknown proc id'],
    mappedEffects () {
      return this.effects.map(this.getEffectDetails);
    },
    hasBuffTable () {
      return this.mappedEffects.some(entry => entry.type === 'passive' && +entry.id === 66);
    },
  },
  data () {
    return {
      sortedPropsCache: new WeakMap(),
      hiddenIndices: [],
    };
  },
  methods: {
    // ...mapMutations(['setMaxColumnWidthForBuffTable']),
    getEffectDetails (effect) {
      const type = getEffectType(effect);
      const id = getEffectId(effect);
      const filteredEffect = {};
      Object.keys(effect).forEach(key => {
        // get everything but the ID
        if (!this.idKeys.includes(key)) {
          filteredEffect[key] = effect[key];
        }
      });
      return { type, id, effect: filteredEffect };
    },
    getSortedProps (effect) {
      if (!this.sortedPropsCache.has(effect)) {
        this.sortedPropsCache.set(effect, Object.keys(effect).sort((a, b) => a < b ? -1 : 1));
      }
      return this.sortedPropsCache.get(effect);
    },
    toggleEffectView (i) {
      if (this.hiddenIndices.includes(i)) {
        this.hiddenIndices = this.hiddenIndices.filter(val => val !== i);
      } else {
        this.hiddenIndices.push(i);
      }
    },
    toggleAllEffectViews () {
      if (this.hiddenIndices.length === this.mappedEffects.length) {
        this.hiddenIndices = [];
      } else {
        this.hiddenIndices = this.mappedEffects.map((val, i) => i);
      }
    },
    isProcBuffList (effectEntry, prop) {
      return effectEntry.type === 'passive' && +effectEntry.id === 66 && prop === 'triggered effect';
    },
    // checkIdColumnWidth () {
    //   if (this.$el.clientWidth > 0) {
    //     let widthSum = 0;
    //     let maxWidth = 0;
    //     const cells = Array.from(this.$el.querySelectorAll('.buff-table--id-column'));
    //     cells.forEach(elem => {
    //         const width = elem.clientWidth;
    //         widthSum += width;
    //         if (width > maxWidth) {
    //           maxWidth = width;
    //         }
    //       });
    //     // console.warn('running checks on', this.$el, maxWidth, cells.length > 0 && widthSum / cells.length);
    //     if (maxWidth > this.maxColumnWidthForBuffTable) {
    //       this.setMaxColumnWidthForBuffTable(maxWidth);
    //     } else if (cells.length > 0 && (widthSum / cells.length) !== maxWidth) {
    //       // console.warn('different width', maxWidth, this.maxColumnWidthForBuffTable);
    //       this.setIdColumnWidth();
    //     } else if (maxWidth > 0 && maxWidth === this.maxColumnWidthForBuffTable) {
    //       // already set, so remove event handlers
    //       // console.warn('removing handler for', this.$el);
    //       this.removeResizeEventHandlers(this.$el);
    //       if (this.$el.parentElement) {
    //         this.removeResizeEventHandlers(this.$el.parentElement);
    //       }
    //     }
    //   }
    // },
    // setIdColumnWidth () {
    //   if (this.maxColumnWidthForBuffTable > 0) {
    //     Array.from(this.$el.querySelectorAll('.buff-table--id-column'))
    //       .forEach(elem => {
    //         // only set if column is visible (i.e. width > 0)
    //         if (elem.clientWidth > 0) {
    //           elem.style.minWidth = `${this.maxColumnWidthForBuffTable}px`;
    //           elem.style.width = `${this.maxColumnWidthForBuffTable}px`;
    //         }
    //       });
    //   }
    // },
    // delayedCheckColumnWidth () {
    //   if (this.resizeTimeout) {
    //     clearTimeout(this.resizeTimeout);
    //   }

    //   this.resizeTimeout = setTimeout(() => {
    //     this.checkIdColumnWidth();
    //   }, 100);
    // },
    // attachResizeEventHandlers (elem) {
    //   elem.addEventListener('transitionend', this.delayedCheckColumnWidth);
    //   elem.addEventListener('webkitTransitionEnd', this.delayedCheckColumnWidth);
    // },
    // removeResizeEventHandlers (elem) {
    //   elem.removeEventListener('transitionend', this.delayedCheckColumnWidth);
    //   elem.removeEventListener('webkitTransitionEnd', this.delayedCheckColumnWidth);
    // },
  },
  // data () {
  //   return {
  //     hiddenIndices: [],
  //     // resizeTimeout: null,
  //     // allIdCellsInRows: [],
  //   };
  // },
  // mounted () {
  //   this.resizeTimeout = setTimeout(() => {
  //     this.checkIdColumnWidth();
  //   }, 250);
  //   this.setIdColumnWidth();

  //   this.attachResizeEventHandlers(this.$el);
  //   if (this.$el.parentElement) {
  //     this.attachResizeEventHandlers(this.$el.parentElement);
  //   }
  // },
  // beforeDestroy () {
  //   if (this.resizeTimeout) {
  //     clearTimeout(this.resizeTimeout);
  //   }

  //   this.removeResizeEventHandlers(this.$el);
  //   if (this.$el.parentElement) {
  //     this.removeResizeEventHandlers(this.$el.parentElement);
  //   }
  // },
  // watch: {
  //   maxColumnWidthForBuffTable (newValue, oldValue) {
  //     if (!isNaN(newValue) && newValue > oldValue) {
  //       this.setIdColumnWidth();
  //     }
  //   },
  // },
  name: 'buff-table',
};
</script>

<style lang="less">
table.buff-table {
  --table-border-color: var(--background-color-alt);
  --table-background-color: var(--background-color-alt--lighten-1);
  --table-border-settings: 1px solid var(--table-border-color);

  table-layout: fixed;
  width: 100%;
  border-collapse: collapse;
  border: var(--table-border-settings);

  & > thead, & > tbody {
    td, th {
      border: var(--table-border-settings);
      text-align: center;
    }

    td:not(.id-column) {
      padding: 0.5em 0;
    }

    .id-column {
      width: 7em;

      button.collapse-btn {
        height: auto;
        min-width: 0;

        .v-btn__content {
          flex-wrap: wrap;
        }
      }
    }

    .property-column {
      width: 20em;
    }
  }

  & > thead > th {
    font-weight: bold;
    border-bottom: var(--table-border-settings);
  }

  .property-row--odd, .value-row--odd {
    background-color: var(--table-border-color);
  }
}
// .buff-table {
//   --table-border-color: var(--background-color-alt);
//   --table-background-color: var(--background-color-alt--lighten-1);
//   --table-hover-color: var(--background-color-alt--lighten-2);

//   --table-border-settings: 1px solid var(--table-border-color);

//   .buff-table--header {
//     font-weight: bold;

//     .buff-table--id-column {
//       flex-grow: 0;
//     }

//     .buff-table--data-columns {
//       flex: 1 1 auto;
//     }
//   }

//   & .buff-table .collapse-btn {
//     margin-left: -6px;
//   }

//   .buff-table--row {
//     border-left: var(--table-border-settings);
//     border-right: var(--table-border-settings);
//     border-top: var(--table-border-settings);

//     .buff-table--data-columns {
//       flex: 1 1 auto;
//     }

//     .buff-table--id-column {
//       margin-right: -1px;
//       flex-grow: 0;
//       &.hidden-effects {
//         margin-right: 0;
//         border-right: var(--table-border-settings);
//       }
//     }

//     &:hover {
//       background-color: var(--table-background-color);
//     }

//     &:last-child {
//       border-bottom: var(--table-border-settings);
//     }

//     .buff-table--property-row {
//       border-left: var(--table-border-settings);

//       &:not(:last-child) {
//         border-bottom: var(--table-border-settings);
//       }
//       min-height: 36px;

//       &:hover {
//         background-color: var(--table-hover-color);
//       }
//     }
//   }
// }
</style>
