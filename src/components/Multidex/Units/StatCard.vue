<template>
  <v-card>
    <v-card-title class="blue-grey darken-1">
      <h3 class="title">Stats</h3>
    </v-card-title>
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
                  'positive' : isPositive(props.item.name, col),
                  'negative' : isNegative(props.item.name, col),
                }">{{ props.item[col] }}</td>
            </template>
          </tr>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  props: ['unit'],
  computed: {
    statTableData () {
      if (!this.unit) {
        return {};
      }

      const stats = ['hp', 'atk', 'def', 'rec'];
      const types = ['Anima', 'Breaker', 'Guardian', 'Oracle'];
      return {
        headers: [
          { text: 'Type', sortable: false, value: 'name', align: 'center' },
          ...stats.map(stat => ({ text: stat.toUpperCase(), sortable: false, value: stat, align: 'center' })),
        ],
        items: [
          { name: 'Base', ...(this.getStats(this.unit.stats._base)) },
          { name: 'Lord', ...(this.getStats(this.unit.stats._lord)) },
          ...types.map(type => ({ name: type, ...(this.getStats(this.unit.stats[type.toLowerCase()])) })),
          { name: `Imps (${this.impCounts.total})`, ...(this.getStats(this.unit.imp, true)) },
        ],
      };
    },
    impCounts () {
      if (!this.unit) {
        return {};
      }

      const counts = {};
      let total = 0;
      ['hp', 'atk', 'def', 'rec'].forEach(stat => {
        const value = this.unit.imp[`max ${stat}`];
        counts[stat] = (stat === 'hp') ? (value / 50) : (value / 20);
        total += counts[stat];
      });
      counts.total = total;
      return counts;
    },
  },
  methods: {
    getStats (item, isImps = false) {
      const result = {};
      const stats = ['hp', 'atk', 'def', 'rec'];
      stats.forEach(stat => {
        if (item[`${stat} max`] || item[`${stat} min`]) {
          result[stat] = `${item[`${stat} min`]}-${item[`${stat} max`]}`;
        } else if (isImps) {
          result[stat] = `${item[`max ${stat}`]} (${this.impCounts[stat]})`;
        } else {
          result[stat] = item[stat];
        }
      });
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

<style>
.unit-stats-table td.positive {
  background-color: rgba(0, 255, 0, 0.2);
}

.unit-stats-table td.negative {
  background-color: rgba(255, 0, 0, 0.2);
}
</style>
