<template>
  <bordered-titled-card materialColor="blue-grey darken-1" class="multidex-dialog-content-card">
    <template slot="title">
      <b>Stats</b>
    </template>
    <v-card-text>
      <v-data-table
        class="unit-stats-table"
        :headers="statTableData.headers"
        :items="statTableData.items"
        hide-actions>
        <template slot="items" slot-scope="props">
          <tr>
            <template v-for="col in ['name', 'hp', 'atk', 'def', 'rec']">
              <td
                :key="col"
                :class="{
                  'pt-0 pb-0 text-xs-center': true,
                  'positive': isPositive(props.item.name, col),
                  'negative': isNegative(props.item.name, col),
                  [`imp-cell`]: col !== 'name' && props.item.name.startsWith('Imps'),
                  [`imp-${col}`]: col !== 'name' && props.item.name.startsWith('Imps'),
                }">{{ props.item[col] }}</td>
            </template>
          </tr>
        </template>
      </v-data-table>
    </v-card-text>
  </bordered-titled-card>
</template>

<script>
import BorderedTitledCard from '@/components/BorderedTitledCard';
import { unitStatFields } from '@/modules/constants';

const RARITY_TO_MAX_LEVEL_MAPPING = {
  1: 10,
  2: 20,
  3: 40,
  4: 60,
  5: 80,
  6: 100,
  7: 120,
  8: 150,
};

/**
 * @type {{ [typeToStatKey: string]: [growthLow: number, growthHigh: number] }}
 */
const TYPE_TO_SKILL_GROWTH_MAPPING = {
  'anima-hp': [5, 10],
  'anima-rec': [-3, -1],
  'breaker-atk': [1, 3],
  'breaker-def': [-3, -1],
  'guardian-def': [1, 3],
  'guardian-rec': [-2, 0],
  'oracle-def': [-2, 0],
  'oracle-rec': [2, 4],
  'rex-hp': [10, 15],
  'rex-atk': [1, 2],
  'rex-def': [1, 2],
  'rex-rec': [1, 2],
};

const NON_LORD_UNIT_TYPES = ['Anima', 'Breaker', 'Guardian', 'Oracle', 'Rex'];

function getMinMaxStatValue(maxLevel = 0, baseStatValueAtMaxLevel = 0, unitType = '', statName = '') {
  const result = TYPE_TO_SKILL_GROWTH_MAPPING[`${unitType}-${statName}`];
  let growthLow = 0, growthHigh = 0;
  if (result) {
    [growthLow, growthHigh] = result;
  }
  return [
    baseStatValueAtMaxLevel + ((maxLevel - 1) * growthLow),
    baseStatValueAtMaxLevel + ((maxLevel - 1) * growthHigh),
  ];
}

export default {
  props: {
    unit: {
      type: Object,
    },
    logger: {
      required: true,
    },
  },
  components: {
    BorderedTitledCard,
  },
  computed: {
    statTableData () {
      if (!this.unit) {
        return {};
      }

      return {
        headers: [
          { text: 'Type', sortable: false, value: 'name', align: 'center' },
          ...unitStatFields.map(stat => ({ text: stat.toUpperCase(), sortable: false, value: stat, align: 'center' })),
        ],
        items: [
          { name: 'Base', ...(this.getStats(this.unit.stats._base)) },
          { name: 'Lord', ...(this.getStats(this.unit.stats._lord)) },
          ...NON_LORD_UNIT_TYPES.map(type => ({ name: type, ...(this.getStats(this.unit.stats._lord, type)) })),
          { name: `Imps (${this.impCounts.total})`, ...(this.getStats(this.unit.imp, 'imps')) },
        ],
      };
    },
    impCounts () {
      if (!this.unit) {
        return {};
      }

      const counts = {};
      let total = 0;
      unitStatFields.forEach(stat => {
        const value = this.unit.imp[`max ${stat}`];
        counts[stat] = (stat === 'hp') ? (value / 50) : (value / 20);
        total += counts[stat];
      });
      counts.total = total;
      return counts;
    },
  },
  methods: {
    getStats (item, unitType) {
      const result = {};
      const isNonLordUnitType = NON_LORD_UNIT_TYPES.includes(unitType);
      if (isNonLordUnitType) {
        // item is lord stats
        const maxLevel = RARITY_TO_MAX_LEVEL_MAPPING[this.unit.rarity];
        const lowerCaseType = unitType.toLowerCase();
        unitStatFields.forEach((stat) => {
          const [min, max] = getMinMaxStatValue(maxLevel, item[stat], lowerCaseType, stat);
          if (min === max) {
            result[stat] = min;
          } else {
            result[stat] = `${min}-${max}`;
          }
        });
      } else {
        const isImps = unitType === 'imps';
        unitStatFields.forEach(stat => {
          if (isNonLordUnitType) {
            result[stat] = `${item[`${stat} min`]}-${item[`${stat} max`]}`;
          } else if (isImps) {
            result[stat] = `${item[`max ${stat}`]} (${this.impCounts[stat]})`;
          } else {
            result[stat] = item[stat];
          }
        });
      }
      return result;
    },
    isPositive (name, col) {
      return (name === 'Anima' && col === 'hp') ||
        (name === 'Breaker' && col === 'atk') ||
        (name === 'Guardian' && col === 'def') ||
        (name === 'Oracle' && col === 'rec');
    },
    isNegative (name, col) {
      return (name === 'Anima' && col === 'rec') ||
        (name === 'Breaker' && col === 'def') ||
        (name === 'Guardian' && col === 'rec') ||
        (name === 'Oracle' && col === 'def');
    },
  },
};
</script>

<style lang="less">
.unit-stats-table {
  td {
    &.positive {
      background-color: rgba(0, 255, 0, 0.2);
    }

    &.negative {
      background-color: rgba(255, 0, 0, 0.2);
    }

    &.imp-cell {
      &.imp-hp {
        background-color: rgba(255, 255, 0, 0.1);
      }
      &.imp-atk {
        background-color: rgba(255, 0, 0, 0.1);
      }
      &.imp-def {
        background-color: rgba(0, 0, 255, 0.1);
      }
      &.imp-rec {
        background-color: rgba(0, 255, 0, 0.1);
      }
    }
  }
}
</style>
