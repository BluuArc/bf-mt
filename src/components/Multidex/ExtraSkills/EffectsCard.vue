<template>
  <v-card>
    <v-card-title class="purple lighten-1 white--text">
      <h3 class="title">Effects</h3>
    </v-card-title>
    <v-card-text>
      <span v-if="!effects">No effects found</span>
      <template v-else>
        <effect-list :effects="effects"/>
      </template>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex';
import EffectList from '@/components/Multidex/EffectList/MainTable';
export default {
  props: ['effects'],
  components: {
    'effect-list': EffectList,
  },
  computed: {
    ...mapGetters('units', ['unitById']),
    ...mapGetters('items', ['itemById']),
    localEffects () {
      if (!this.effects || !Array.isArray(this.effects)) {
        return [];
      }

      return this.effects;
    },
    nonConditionalEffects () {
      return this.localEffects.filter(e => e.conditions.length === 0);
    },
    conditionalEffects () {
      const conditionalEffects = this.localEffects.filter(e => e.conditions.length > 0);
      const conditionDictionary = {};
      conditionalEffects.map(effect => ({ message: this.getConditionMessage(effect), effect }))
        .forEach(entry => {
          if (!conditionDictionary[entry.message]) {
            conditionDictionary[entry.message] = [];
          }
          conditionDictionary[entry.message].push(entry.effect);
        });

      return Object.entries(conditionDictionary).map(([condition, effects]) => ({ condition, effects }));
    },
  },
  methods: {
    getConditionMessage (effect) {
      return this.convertParsedConditionsToMessage(this.parseConditions(effect));
    },
    parseConditions (effect) {
      const parsedConditions = { unit: [], item: [] };
      if (!effect.conditions || effect.conditions.length === 0) {
        return parsedConditions;
      }

      effect.conditions.forEach(condition => {
        if (condition['sphere category required'] !== undefined) {
          parsedConditions.item.push(`${condition['sphere category required']} sphere`);
        } else if (condition['item required'] !== undefined) {
          if (Array.isArray(condition['item required']) && condition['item required'].length > 0) {
            condition['item required'].forEach(item => {
              if (!parsedConditions.item.includes(item)) {
                parsedConditions.item.push(item);
              }
            });
          } else {
            parsedConditions.item.push(condition['item required']);
          }
        } else if (condition['unit required'] !== undefined) {
          if (Array.isArray(condition['unit required']) && condition['unit required'].length > 0) {
            condition['unit required'].forEach(unit => {
              if (!parsedConditions.unit.includes(unit)) {
                parsedConditions.unit.push(unit);
              }
            });
          } else {
            parsedConditions.unit.push(condition['unit required']);
          }
        } else if (condition.unknown !== undefined) {
          parsedConditions.item.push(`unknown sphere type ${condition['unknown']}`);
        }
      });

      return parsedConditions;
    },
    convertParsedConditionsToMessage ({ unit = [], item = [] }) {
      const conditions = [];

      if (unit.length > 0) {
        const names = this.getUnitNamesAndThumbnails(unit).map(d => d.names).reduce((acc, val) => [...acc, ...val], []);
        if (unit.length === 1 && names.length === 1) {
          conditions.push(`${names[0]} is in squad`);
        } else {
          conditions.push(`${names.join(' or ')} are in squad`);
        }
      }

      if (item.length > 0) {
        const names = this.getItemNamesAndThumbnails(item).map(d => d.names).reduce((acc, val) => [...acc, ...val], []);
        if (item.length === 1) {
          conditions.push(`${names[0]} is equipped`);
        } else {
          conditions.push(`${names.join(' or ')} are equipped`);
        }
      }

      return conditions.join(' or ');
    },
    getUnitNamesAndThumbnails (units = []) {
      return units.map(entry => {
        const thumbnailIds = [];
        const names = [];
        if (entry.name) {
          if (entry.id) {
            thumbnailIds.push(entry.id);
          }
          names.push(`${entry.name}${entry.id ? `(${entry.id})` : ''}`);
        } else {
          const id = (entry.id) ? entry.id.toString() : entry.toString();
          if (+id % 10 === 0) {
            const unit = this.getHighestRarityUnit(+id) || {};
            names.push(`any evolution of ${unit.name || id}`);
            if (unit.name) {
              thumbnailIds.push(unit.id.toString());
              let currentUnit = unit;
              while (currentUnit.prev) {
                thumbnailIds.push(currentUnit.prev.toString());
                currentUnit = this.unitById(currentUnit.prev.toString());
              }
            }
          } else {
            // specify a specifc unit
            const unit = this.unitById(id) || {};
            names.push(unit.name || id);
            if (unit.name) {
              thumbnailIds.push(unit.id.toString());
            }
          }
        }
        return { thumbnailIds, names };
      });
    },
    getHighestRarityUnit (category = 0) {
      for (let i = 9; i >= 0; --i) {
        const id = `${+category + i}`;
        const unit = this.unitById(id);
        if (unit) {
          return unit;
        }
      }
    },
    getItemNamesAndThumbnails (items = []) {
      return items.map(id => {
        const item = this.itemById(id.toString()) || {};
        return {
          thumbnailIds: (item.name ? [item.id.toString()] : []),
          names: [item.name || id],
        };
      });
    },
  },
};
</script>
