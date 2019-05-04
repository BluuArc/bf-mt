<template>
  <div class="value-subgrid" :style="mainValueGridStyle">
    <template v-if="showHeaders">
      <span class="property-cell header-cell">
        Buff Property
      </span>
      <span
        v-for="(entry, i) in values" :key="i"
        :style="convertNumberToColumnSpanStyle(columnCountMappingByValueEntry.get(entry))"
        class="value-cell header-cell"
      >
        <slot name="value-header" :entry="entry">
          {{ entry.identifier }}
        </slot>
      </span>
    </template>

    <template v-for="(prop, p) in properties">
      <span
        :class="getClassForProperty(prop, p)"
        :key="`${prop}-${p}-property`"
        v-text="prop"
      />
      <template v-for="(entry, e) in values">
        <template v-for="(valueEntry, v) in entry.values">
          <source-path-cell
            v-if="prop === 'sourcePath'"
            :key="`${prop}-${p}-${e}-${v}-custom-value`"
            :class="getClassForValue(v, entry.values, p, prop)"
            :value="getPropertyValue(prop, valueEntry)"
            :source="entry.identifier"
            :getUnit="getUnit"
            :getItem="getItem"
            :getExtraSkill="getExtraSkill"
          />
          <triggered-on-cell
            v-else-if="prop === 'triggeredOn'"
            :key="`${prop}-${p}-${e}-${v}-custom-value`"
            :class="getClassForValue(v, entry.values, p, prop)"
            :value="getPropertyValue(prop, valueEntry)"
          />
          <span
            v-else
            :key="`${prop}-${p}-${e}-${v}-value`"
            :class="getClassForValue(v, entry.values, p, prop)"
            v-text="getPropertyValue(prop, valueEntry)"
          />
        </template>
      </template>
    </template>
  </div>
</template>

<script>
import SourcePathCell from '@/components/Multidex/BuffList/SourcePathCell';
import TriggeredOnCell from '@/components/Multidex/BuffList/TriggeredOnCell';
import GettersMixin from '@/components/Tools/Squads/SynchronousGettersMixin';

export default {
  mixins: [GettersMixin],
  props: {
    properties: {
      type: Array,
      default: () => [],
    },
    values: { // each value is an object with properties; takes up at least one column
      type: Array,
      default: () => [
        {
          identifier: {},
          values: [],
        },
      ],
    },
    showHeaders: {
      type: Boolean,
      default: true,
    },
    allowOverflow: {
      type: Boolean,
      default: false,
    },
    minValueColumnWidth: {
      type: String,
      default: '5em',
    },
    freezePropertyColumn: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    SourcePathCell,
    TriggeredOnCell,
  },
  computed: {
    numValueColumns () {
      const columnCountMapping = this.columnCountMappingByValueEntry;
      return this.values
        .reduce((acc, entry) => acc + columnCountMapping.get(entry), 0);
    },
    columnCountMappingByValueEntry () {
      const mapping = new WeakMap();
      const { properties } = this;
      this.values.forEach(entry => {
        const valuesWithApplicableProperties = entry.values.filter(v => properties.some(p => v.hasOwnProperty(p)));
        const columnCount = Math.max(1, valuesWithApplicableProperties.length);
        mapping.set(entry, columnCount);
      });
      return mapping;
    },
    mainValueGridStyle () {
      const propertyColumnWidth = this.$vuetify.breakpoint.smAndDown ? '10em' : '17.5em';
      const valueSubgridWidth = `minmax(${this.minValueColumnWidth}, 1fr)`;
      const columnConfig = [propertyColumnWidth];
      this.values.forEach(entry => {
        const numColumns = this.columnCountMappingByValueEntry.get(entry);
        if (numColumns > 1) {
          columnConfig.push(`repeat(${numColumns}, minmax(calc(${this.minValueColumnWidth} / ${numColumns}), 1fr))`);
        } else {
          columnConfig.push(valueSubgridWidth);
        }
      });
      return {
        'grid-template-columns': columnConfig.join(' '),
        overflow: (this.allowOverflow && 'auto') || undefined,
      };
    },
    customCellsByPropertyName: () => [
      'sourcePath',
      'triggeredOn',
    ],
  },
  methods: {
    getClassForProperty (property, index) {
      return {
        'property-cell': true,
        [index % 2 === 0 ? 'even-row' : 'odd-row']: true,
        'only-row': this.properties.length === 0,
        'sticky-property-cell': this.freezePropertyColumn,
      };
    },
    getClassForValue (valueEntryIndex, parentValuesArray, propertyIndex, propertyName) {
      return {
        'value-cell': true,
        [propertyIndex % 2 === 0 ? 'even-row' : 'odd-row']: true,
        'is-last-value-cell': valueEntryIndex === parentValuesArray.length - 1,
        'is-custom-cell': this.isCustomCell(propertyName),
      };
    },
    convertNumberToColumnSpanStyle (numColumns) {
      return {
        'grid-column-start': `span ${numColumns}`,
      };
    },
    isProcBuffList (prop) {
      return prop === 'triggered effect';
    },
    isCustomCell (prop) {
      return this.customCellsByPropertyName.includes(prop);
    },
    getPropertyValue (prop, valueEntry) {
      const value = valueEntry[prop] !== undefined ? valueEntry[prop] : '-';
      return [
        typeof value === 'object' ? JSON.stringify(value) : value,
        Array.isArray(value) && value.length === 0 && '(None)',
      ].filter(v => v).join(' ');
    },
  },
};
</script>

<style lang="less">
.value-subgrid {
  --table-border-color: hsl(0, 0, 35%);
  --table-background-color: var(--background-color-alt--lighten-1);
  --table-border-settings: 1px solid var(--table-border-color);

  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 17.5em 1fr;
  grid-auto-flow: stretch;
  background-color: inherit;

  // nested table
  .value-subgrid {
    grid-template-columns: minmax(17.5em, auto) 1fr;
  }

  .even-row:not(.value-cell), .even-row.value-cell:not(:hover) {
    &:not(.only-row) {
      background-color: var(--table-border-color);
    }
  }

  .odd-row:not(.value-cell), .odd-row.value-cell:not(:hover) {
    background-color: inherit;
  }

  .value-cell:not(.header-cell):hover {
    background-color: var(--background-color--card);
  }

  .value-cell.has-table:not(.header-cell):hover {
    background-color: var(--background-color);
  }

  .header-cell {
    font-weight: bold;
    border-bottom: var(--table-border-settings);
  }

  .property-cell, .value-cell {
    padding: 0.5em;
    word-break: break-word;
    hyphens: auto;
    text-align: center;
  }

  .property-cell, .header-cell {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .value-cell.header-cell {
    flex-direction: column;
  }

  .value-cell.is-custom-cell {
    padding: 0;
  }

  .value-cell:not(.is-custom-cell) {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .property-cell span {
    flex: 1 0 100%;
    text-align: center;
  }

  .is-last-value-cell, .property-cell {
    border-right: 2px solid var(--table-background-color);
  }

  .sticky-property-cell {
    position: sticky;
    left: 0;
  }
}
</style>
