<template>
  <div class="ui raised segments" v-if="stats">
    <div class="ui inverted segment">
      <b>Stats</b>
      <span class="ui small left pointing label">
        {{ impCount }} imps to max
      </span>
    </div>
    <div class="ui segment">
      <table
        id="stats-table"
        class="ui compact five column unstackable celled striped table">
        <thead>
          <tr>
            <th
              v-for="column in tableHeaders"
              :key="column"
              class="center aligned">
              {{ column }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, rowIndex) in tableRows"
            :key="rowIndex"
            class="center aligned">
            <td
              v-for="(col, colIndex) in row"
              :key="colIndex">
              {{ col }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  props: ['stats', 'imps'],
  computed: {
    tableHeaders: () => ['Type', 'HP', 'ATK', 'DEF', 'REC'],
    tableRows() {
      const fields = ['_base', '_lord', 'anima', 'breaker', 'guardian', 'oracle', 'imps'];
      return fields.map((field) => {
        const columns = [];
        const statFields = ['hp', 'atk', 'def', 'rec'];

        columns.push(field.replace(/_/g, ''));
        // get stat value for each field
        if (field !== 'imps') {
          statFields.forEach((stat) => {
            if (this.stats[field][stat]) {
              columns.push(this.stats[field][stat]);
            } else {
              columns.push(`${this.stats[field][`${stat} min`]}-${this.stats[field][`${stat} max`]}`);
            }
          });
        } else {
          statFields.forEach((stat) => {
            columns.push(this.imps[`max ${stat}`]);
          });
        }

        return columns;
      });
    },
    impCount() {
      if (!this.imps) {
        return 0;
      }
      return ['hp', 'atk', 'def', 'rec'].map((stat) => {
        const value = this.imps[`max ${stat}`];
        return (stat === 'hp') ? (value / 50) : (value / 20);
      }).reduce((acc, val) => acc + val, 0);
    },
  },
};
</script>

<style>
#stats-table tr td {
  text-transform: capitalize;
}
</style>
