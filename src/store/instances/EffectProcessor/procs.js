import EffectTypes from './effect-types';
import helper from './processor-helper';

const procs = {
  '5': {
    desc: 'Regular/Elemental ATK/DEF/REC/Crit Rate',
    config: {
      processOrder: ['atk', 'def', 'rec', 'crit'],
      regular: {
        atk: 'atk% buff (1)',
        def: 'def% buff (3)',
        rec: 'rec% buff (5)',
        crit: 'crit% buff (7)',
      },
      reduction: {
        atk: 'atk% buff (2)',
        def: 'def% buff (4)',
        rec: 'rec% buff (6)',
        crit: 'crit% buff (8)',
      },
      elemental: {
        atk: 'atk% buff (13)',
        def: 'def% buff (14)',
        rec: 'rec% buff (15)',
        crit: 'crit% buff (16)',
      },
    },
    // filterKeyMapping: {
    //   'regular ATK boost': {
    //     type: Number,
    //     key: 'atk% buff (1)',
    //   },
    //   'regular DEF boost': {
    //     type: Number,
    //     key: 'def% buff (3)',
    //   },
    //   'regular REC boost': {
    //     type: Number,
    //     key: 'rec% buff (5)',
    //   },
    //   'regular CRIT rate boost': {
    //     type: Number,
    //     key: 'crit% buff (7)',
    //   },
    //   'regular ATK reduction': {
    //     type: Number,
    //     key: 'atk% buff (2)',
    //   },
    //   'regular DEF reduction': {
    //     type: Number,
    //     key: 'def% buff (4)',
    //   },
    //   'regular REC reduction': {
    //     type: Number,
    //     key: 'rec% buff (6)',
    //   },
    //   'regular CRIT rate reduction': {
    //     type: Number,
    //     key: 'crit% buff (8)',
    //   },
    //   'elemental ATK boost': {
    //     type: Number,
    //     key: 'atk% buff (13)',
    //   },
    //   'elemental DEF boost': {
    //     type: Number,
    //     key: 'def% buff (14)',
    //   },
    //   'elemental REC boost': {
    //     type: Number,
    //     key: 'rec% buff (15)',
    //   },
    //   'elemental CRIT rate boost': {
    //     type: Number,
    //     key: 'crit% buff (16)',
    //   },
    // },
    type: [EffectTypes.ACTIVE.name],
    process (effect = {}, context) {
      const values = [];
      const targetData = helper.getTargetData(effect);
      const turns = helper.getTurns(effect);
      const elementBuffed = (effect['element buffed'] || 'null').toUpperCase();
      const getBuffsFor = (statTypes) => {
        return helper.containsAnyKey(effect, this.config.processOrder.map(key => statTypes[key]))
          ? helper.multiStatToObject(undefined, ...(this.config.processOrder.map(key => effect[statTypes[key]])))
          : {};
      };

      const regularBuffs = getBuffsFor(this.config.regular);
      this.config.processOrder.forEach(stat => {
        if (regularBuffs[stat]) {
          const iconKey = helper.getIconKey(stat !== 'crit' ? `BUFF_${stat.toUpperCase()}UP` : 'BUFF_CRTRATEUP');
          const descLabel = stat !== 'crit' ? stat.toUpperCase() : 'Critical Hit Rate';
          values.push({ iconKey, value: { value: +regularBuffs[stat], element: elementBuffed, turns, targetData }, desc: `${helper.getNumberAsPolarizedPercent(+regularBuffs[stat])} ${descLabel} ${targetData}` });
        }
      });

      const reductionBuffs = getBuffsFor(this.config.reduction);
      this.config.processOrder.forEach(stat => {
        if (reductionBuffs[stat]) {
          const iconKey = helper.getIconKey(stat !== 'crit' ? `BUFF_${stat.toUpperCase()}DOWN` : 'BUFF_CRTRATEDOWN');
          const descLabel = stat !== 'crit' ? stat.toUpperCase() : 'Critical Hit Rate';
          values.push({ iconKey, value: { value: +reductionBuffs[stat], element: elementBuffed, turns, targetData }, desc: `${helper.getNumberAsPolarizedPercent(+reductionBuffs[stat])} ${descLabel} ${targetData}` });
        }
      });

      const elementalBuffs = getBuffsFor(this.config.elemental);
      this.config.processOrder.forEach(stat => {
        if (elementalBuffs[stat]) {
          const iconKey = helper.getIconKey(stat !== 'crit' ? `BUFF_${elementBuffed}${stat.toUpperCase()}UP` : `BUFF_${elementBuffed}CRTRATEDOWN`);
          const descLabel = stat !== 'crit' ? stat.toUpperCase() : 'Critical Hit Rate';
          values.push({ iconKey, value: { value: +elementalBuffs[stat], element: elementBuffed, turns, targetData }, desc: `${helper.getNumberAsPolarizedPercent(+elementalBuffs[stat])} ${helper.capitalize(elementBuffed)} ${descLabel} ${targetData}` });
        }
      });

      return {
        type: this.type,
        turnDuration: turns.value,
        originalEffect: effect,
        context,
        values,
      };
    },
  },
};

export default procs;
