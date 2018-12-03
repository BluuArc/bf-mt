<template>
  <v-container fluid class="buff-table pa-0" v-resize="checkIdColumnWidth">
    <v-layout row v-if="showHeaders" class="buff-table--header">
      <v-flex :class="{ 'text-xs-center buff-table--id-column': true }">
        <v-btn flat @click="toggleAllEffectViews" small style="min-width: 36px;">
          <v-icon>{{ hiddenIndices.length === mappedEffects.length ? 'expand_more' : 'expand_less' }}</v-icon>
          ID
        </v-btn>
      </v-flex>
      <v-flex class="text-xs-center d-align-self-center buff-table--data-columns">
        <v-layout row class="d-align-items-center">
          <v-flex xs3>Buff Property</v-flex>
          <v-flex xs9>Buff Value</v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
    <v-layout row class="buff-table--row d-align-items-center" v-for="(effectEntry, i) in mappedEffects" :key="i">
      <v-flex :class="{ 'text-xs-center buff-table--id-column': true, 'hidden-effects': hiddenIndices.includes(i) }">
        <v-btn flat @click="() => toggleEffectView(i)" small style="min-width: 36px;" class="collapse-btn">
          <v-icon>{{ hiddenIndices.includes(i) ? 'unfold_more' : 'unfold_less' }}</v-icon>
          {{ effectEntry.id }}
        </v-btn>
      </v-flex>
      <v-flex :class="{ 'text-xs-center buff-table--data-columns': true }">
        <template v-if="!hiddenIndices.includes(i)">
          <v-layout row v-for="(prop, j) in getSortedProps(effectEntry.effect)" :key="j" class="buff-table--property-row d-align-items-center">
            <template v-if="isProcBuffList(effectEntry, prop)">
              <v-flex xs3>
                {{ prop }}
              </v-flex>
              <v-flex xs9>
                <buff-table :effects="effectEntry.effect[prop]" :showHeaders="false"/>
              </v-flex>
            </template>
            <template v-else>
              <v-flex xs3>
                {{ prop }}
              </v-flex>
              <v-flex xs9>
                {{ effectEntry.effect[prop] }}
                <span v-if="Array.isArray(effectEntry.effect[prop]) && effectEntry.effect[prop].length === 0">(None)</span>
              </v-flex>
            </template>
          </v-layout>
        </template>
        <template v-else>
          <v-layout row>
            <v-flex>
              {{ getSortedProps(effectEntry.effect).length }} Effects Hidden
            </v-flex>
          </v-layout>
        </template>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { getEffectType, getEffectId } from '@/modules/EffectProcessor/processor-helper';
import { mapState, mapMutations } from 'vuex';

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
    ...mapState(['maxColumnWidthForBuffTable']),
    idKeys: () => ['passive id', 'unknown passive id', 'proc id', 'unknown proc id'],
    mappedEffects () {
      return this.effects.map(this.getEffectDetails);
    },
  },
  methods: {
    ...mapMutations(['setMaxColumnWidthForBuffTable']),
    getEffectDetails (effect) {
      const type = getEffectType(effect);
      const id = getEffectId(effect);
      const filteredEffect = {};
      Object.keys(effect).forEach(key => {
        if (!this.idKeys.includes(key)) {
          filteredEffect[key] = effect[key];
        }
      });
      return { type, id, effect: filteredEffect };
    },
    getSortedProps (effect) {
      return Object.keys(effect).sort((a, b) => a < b ? -1 : 1);
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
    checkIdColumnWidth () {
      if (this.$el.clientWidth > 0) {
        let widthSum = 0;
        let maxWidth = 0;
        const cells = Array.from(this.$el.querySelectorAll('.buff-table--id-column'));
        cells.forEach(elem => {
            const width = elem.clientWidth;
            widthSum += width;
            if (width > maxWidth) {
              maxWidth = width;
            }
          });
        // console.warn('running checks on', this.$el, maxWidth, cells.length > 0 && widthSum / cells.length);
        if (maxWidth > this.maxColumnWidthForBuffTable) {
          this.setMaxColumnWidthForBuffTable(maxWidth);
        } else if (cells.length > 0 && (widthSum / cells.length) !== maxWidth) {
          // console.warn('different width', maxWidth, this.maxColumnWidthForBuffTable);
          this.setIdColumnWidth();
        } else if (maxWidth > 0 && maxWidth === this.maxColumnWidthForBuffTable) {
          // already set, so remove event handlers
          // console.warn('removing handler for', this.$el);
          this.removeResizeEventHandlers(this.$el);
          if (this.$el.parentElement) {
            this.removeResizeEventHandlers(this.$el.parentElement);
          }
        }
      }
    },
    setIdColumnWidth () {
      if (this.maxColumnWidthForBuffTable > 0) {
        Array.from(this.$el.querySelectorAll('.buff-table--id-column'))
          .forEach(elem => {
            // only set if column is visible (i.e. width > 0)
            if (elem.clientWidth > 0) {
              elem.style.minWidth = `${this.maxColumnWidthForBuffTable}px`;
              elem.style.width = `${this.maxColumnWidthForBuffTable}px`;
            }
          });
      }
    },
    delayedCheckColumnWidth () {
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
      }

      this.resizeTimeout = setTimeout(() => {
        this.checkIdColumnWidth();
      }, 100);
    },
    attachResizeEventHandlers (elem) {
      elem.addEventListener('transitionend', this.delayedCheckColumnWidth);
      elem.addEventListener('webkitTransitionEnd', this.delayedCheckColumnWidth);
    },
    removeResizeEventHandlers (elem) {
      elem.removeEventListener('transitionend', this.delayedCheckColumnWidth);
      elem.removeEventListener('webkitTransitionEnd', this.delayedCheckColumnWidth);
    },
  },
  data () {
    return {
      hiddenIndices: [],
      resizeTimeout: null,
      allIdCellsInRows: [],
    };
  },
  mounted () {
    this.resizeTimeout = setTimeout(() => {
      this.checkIdColumnWidth();
    }, 250);
    this.setIdColumnWidth();

    this.attachResizeEventHandlers(this.$el);
    if (this.$el.parentElement) {
      this.attachResizeEventHandlers(this.$el.parentElement);
    }
  },
  beforeDestroy () {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    this.removeResizeEventHandlers(this.$el);
    if (this.$el.parentElement) {
      this.removeResizeEventHandlers(this.$el.parentElement);
    }
  },
  watch: {
    maxColumnWidthForBuffTable (newValue, oldValue) {
      if (!isNaN(newValue) && newValue > oldValue) {
        this.setIdColumnWidth();
      }
    },
  },
  name: 'buff-table',
};
</script>

<style lang="less">
.buff-table {
  --table-border-color: var(--background-color-alt);
  --table-background-color: var(--background-color-alt--lighten-1);
  --table-hover-color: var(--background-color-alt--lighten-2);

  --table-border-settings: 1px solid var(--table-border-color);

  .buff-table--header {
    font-weight: bold;

    .buff-table--id-column {
      flex-grow: 0;
    }

    .buff-table--data-columns {
      flex: 1 1 auto;
    }
  }

  & .buff-table .collapse-btn {
    margin-left: -6px;
  }

  .buff-table--row {
    border-left: var(--table-border-settings);
    border-right: var(--table-border-settings);
    border-top: var(--table-border-settings);

    .buff-table--data-columns {
      flex: 1 1 auto;
    }

    .buff-table--id-column {
      margin-right: -1px;
      flex-grow: 0;
      &.hidden-effects {
        margin-right: 0;
        border-right: var(--table-border-settings);
      }
    }

    &:hover {
      background-color: var(--table-background-color);
    }

    &:last-child {
      border-bottom: var(--table-border-settings);
    }

    .buff-table--property-row {
      border-left: var(--table-border-settings);

      &:not(:last-child) {
        border-bottom: var(--table-border-settings);
      }
      min-height: 36px;

      &:hover {
        background-color: var(--table-hover-color);
      }
    }
  }
}
</style>
