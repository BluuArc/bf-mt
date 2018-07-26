import EffectTypes from './effect-types';
import helper from './processor-helper';
import knownConstants from '../../modules/constants';
import IconKeyMappings from './icon-key-mappings';
const procTypes = require('@/assets/buff-translation/procs.json');

const procs = {
  ...(() => {
    const entries = {};
    Object.keys(procTypes.proc).forEach(id => {
      entries[id] = helper.generateDefaultEntry(id);
    });
    return entries;
  })(),
  '1': {
    desc: 'Regular Attack',
    config: {},
    possibleIcons: () => ['ST_ATK', 'AOE_ATK'].map(helper.getIconKey),
    type: [EffectTypes.ATTACK.name],
    process (effect = {}, context = {}) {
      const values = [];
      const targetData = (effect['target area'] || '').toUpperCase() === 'SINGLE' ? 'ST' : (effect['target area'] || '').toUpperCase();
      const targetType = effect['target type'];
      const { damageFrames = {} } = context;

      const iconKey = helper.getIconKey(`${targetData || 'ST'}_ATK`);
      const hits = +(damageFrames.hits || 0);
      const bbAtk = effect['bb atk%'] || 0;

      const bbDmg = effect['bb dmg%'];
      const flatAtk = effect['bb flat atk'];
      const distribution = damageFrames['hit dmg% distribution (total)'];

      const extraModifiers = [];
      if (bbDmg) {
        extraModifiers.push(`${bbDmg}% BB DMG`);
      }
      if (flatAtk) {
        extraModifiers.push(`${helper.getNumberAsPolarizedNumber(flatAtk)} flat ATK`);
      }
      if (distribution !== undefined && +distribution !== 100) {
        extraModifiers.push(`${distribution}% power`);
      }

      const innateModifiers = helper.getInnateAttackBoosts(effect);

      const fullModifiers = extraModifiers.concat(innateModifiers);
      let desc = [`${hits} hit ${bbAtk}%`, targetData || 'attack', fullModifiers.length > 0 ? `(${fullModifiers.join(', ')})` : ''].join(' ');
      if (targetType && targetType !== 'enemy') {
        desc += ` to ${targetType}`;
      }

      values.push({ iconKey, value: { hits, bbAtk, bbDmg, flatAtk, distribution }, desc });

      return {
        type: this.type,
        originalEffect: effect,
        context,
        values,
      };
    },
  },
  '2': {
    desc: 'Burst Heal',
    config: {},
    possibleIcons: () => [IconKeyMappings.INSTANT_BUFF_HPREC.name],
    type: [EffectTypes['INSTANT/BURST'].name],
    process (effect = {}, context = {}) {
      const values = [];
      const targetData = helper.getTargetData(effect);
      const { damageFrames = {} } = context;
      const { hits = 1 } = damageFrames;

      const healerRec = +effect['rec added% (from healer)'];
      const healLow = +effect['heal low'];
      const healHigh = +effect['heal high'];

      let desc = `Recover ${helper.getFormattedMinMax(healLow, healHigh)} HP (${helper.getNumberAsPolarizedPercent(healerRec)} healer REC)`;
      if (hits > 1) {
        desc += ` over ${hits} hits`;
      }

      const iconKey = IconKeyMappings.INSTANT_BUFF_HPREC.name;
      values.push({ iconKey, value: { healLow, healHigh, healerRec, targetData }, desc: [desc, targetData].join(' ') });

      return {
        type: this.type,
        originalEffect: effect,
        context,
        values,
      };
    },
  },
  '3': {
    desc: 'Heal over Time (HoT)',
    config: {},
    possibleIcons: () => [IconKeyMappings.BUFF_HPREC.name],
    type: [EffectTypes.ACTIVE.name],
    process (effect = {}, context) {
      const values = [];
      const targetData = helper.getTargetData(effect);
      const turns = helper.getTurns(effect['gradual heal turns (8)']);

      const targetRec = +effect['rec added% (from target)'];
      const healLow = +effect['gradual heal low'] || 0;
      const healHigh = +effect['gradual heal high'] || 0;

      const iconKey = IconKeyMappings.BUFF_HPREC.name;
      values.push({ iconKey, value: { healLow, healHigh, targetRec, turns, targetData }, desc: `${helper.getFormattedMinMax(healLow, healHigh)} HP/Turn (${helper.getNumberAsPolarizedPercent(targetRec)} target REC) ${targetData}` });

      return {
        type: this.type,
        turnDuration: turns.value,
        originalEffect: effect,
        context,
        values,
      };
    },
  },
  '4': {
    desc: 'Instant BB Gauge Refill',
    config: {},
    possibleIcons: () => [IconKeyMappings.INSTANT_BUFF_BBREC.name],
    type: [EffectTypes['INSTANT/BURST'].name],
    process (effect = {}, context) {
      const values = [];
      const targetData = helper.getTargetData(effect);

      const fillPercent = effect['bb bc fill%'] || 0;
      const fillRaw = effect['bb bc fill'];

      const iconKey = IconKeyMappings.INSTANT_BUFF_BBREC.name;
      if ((fillPercent && fillPercent > 0) || (!fillPercent && !fillRaw)) {
        const desc = (+fillPercent === 100 ? 'Fills BB gauge to max' : `${helper.getNumberAsPolarizedPercent(fillPercent)} BB gauge fill`);
        values.push({ iconKey, value: { fillPercent, targetData }, desc: [desc, targetData].join(' ') });
      }

      if (fillRaw && fillRaw > 0) {
        const desc = `${helper.getNumberAsPolarizedNumber(fillRaw)} BC fill ${targetData}`;
        values.push({ iconKey, value: { fillRaw, targetData }, desc });
      }

      return {
        type: this.type,
        originalEffect: effect,
        context,
        values,
      };
    },
  },
  '5': {
    desc: 'Regular/Elemental ATK/DEF/REC/Crit Rate',
    config: {
      processOrder: ['atk', 'def', 'rec', 'crit'],
      regular: {
        atk: 'atk% buff (1)',
        def: 'def% buff (3)',
        rec: 'rec% buff (5)',
        crit: 'crit% buff (7)',
        [helper.iconGeneratorSymbol]: stat => helper.getIconKey(stat !== 'crit' ? `BUFF_${stat.toUpperCase()}UP` : 'BUFF_CRTRATEUP'),
      },
      reduction: {
        atk: 'atk% buff (2)',
        def: 'def% buff (4)',
        rec: 'rec% buff (6)',
        crit: 'crit% buff (8)',
        [helper.iconGeneratorSymbol]: stat => helper.getIconKey(stat !== 'crit' ? `BUFF_${stat.toUpperCase()}DOWN` : 'BUFF_CRTRATEDOWN'),
      },
      elemental: {
        atk: 'atk% buff (13)',
        def: 'def% buff (14)',
        rec: 'rec% buff (15)',
        crit: 'crit% buff (16)',
        [helper.iconGeneratorSymbol]: (stat, elementBuffed = 'FIRE') => helper.getIconKey(stat !== 'crit' ? `BUFF_${elementBuffed}${stat.toUpperCase()}UP` : `BUFF_${elementBuffed}CRTRATEUP`),
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
    possibleIcons () {
      const iconKeys = [];
      const { elements } = knownConstants;
      const addToIconKeys = (key) => {
        if (!iconKeys.includes(key)) {
          iconKeys.push(key);
        }
      };
      Object.keys(this.config).forEach(configKey => {
        const entry = this.config[configKey];
        if (entry[helper.iconGeneratorSymbol]) {
          const iconGenerator = entry[helper.iconGeneratorSymbol];
          if (configKey === 'elemental') {
            elements.forEach(e => {
              this.config.processOrder.forEach(stat => {
                addToIconKeys(iconGenerator(stat, e.toUpperCase()));
              });
            });
          } else {
            this.config.processOrder.forEach(stat => {
              addToIconKeys(iconGenerator(stat));
            });
          }
        }
      });

      return iconKeys;
    },
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
          // const iconKey = helper.getIconKey(stat !== 'crit' ? `BUFF_${stat.toUpperCase()}UP` : 'BUFF_CRTRATEUP');
          const iconKey = this.config.regular[helper.iconGeneratorSymbol](stat);
          const descLabel = stat !== 'crit' ? stat.toUpperCase() : 'Critical Hit Rate';
          values.push({ iconKey, value: { value: +regularBuffs[stat], element: elementBuffed, turns, targetData }, desc: `${helper.getNumberAsPolarizedPercent(+regularBuffs[stat])} ${descLabel} ${targetData}` });
        }
      });

      const reductionBuffs = getBuffsFor(this.config.reduction);
      this.config.processOrder.forEach(stat => {
        if (reductionBuffs[stat]) {
          // const iconKey = helper.getIconKey(stat !== 'crit' ? `BUFF_${stat.toUpperCase()}DOWN` : 'BUFF_CRTRATEDOWN');
          const iconKey = this.config.reduction[helper.iconGeneratorSymbol](stat);
          const descLabel = stat !== 'crit' ? stat.toUpperCase() : 'Critical Hit Rate';
          values.push({ iconKey, value: { value: +reductionBuffs[stat], element: elementBuffed, turns, targetData }, desc: `${helper.getNumberAsPolarizedPercent(+reductionBuffs[stat])} ${descLabel} ${targetData}` });
        }
      });

      const elementalBuffs = getBuffsFor(this.config.elemental);
      this.config.processOrder.forEach(stat => {
        if (elementalBuffs[stat]) {
          // const iconKey = helper.getIconKey(stat !== 'crit' ? `BUFF_${elementBuffed}${stat.toUpperCase()}UP` : `BUFF_${elementBuffed}CRTRATEDOWN`);
          const iconKey = this.config.elemental[helper.iconGeneratorSymbol](stat, elementBuffed);
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
  '6': {
    desc: 'HC/BC/Item Drop Rate',
    config: {
      processOrder: ['hc', 'bc', 'item'],
      [helper.iconGeneratorSymbol]: type => `BUFF_${type.toUpperCase()}DROP`,
      keyMapping: {
        hc: 'hc drop rate% buff (9)',
        bc: 'bc drop rate% buff (10)',
        item: 'item drop rate% buff (11)',
      },
      nameMapping: {
        hc: 'HC',
        bc: 'BC',
        item: 'Item',
      },
    },
    possibleIcons () {
      return this.config.processOrder.map(type => this.config[helper.iconGeneratorSymbol](type));
    },
    type: [EffectTypes.ACTIVE.name],
    process (effect = {}, context) {
      const values = [];
      const targetData = helper.getTargetData(effect);
      const turns = helper.getTurns(effect['drop rate buff turns']);

      this.config.processOrder.forEach(type => {
        const value = effect[this.config.keyMapping[type]];
        if (value) {
          const iconKey = this.config[helper.iconGeneratorSymbol](type);
          const desc = [helper.getNumberAsPolarizedPercent(+value), this.config.nameMapping[type], 'drop rate', targetData].join(' ');
          values.push({ iconKey, value: { value, turns, targetData }, desc });
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
  '18': {
    desc: 'Damage Reduction/Mitigation',
    config: {},
    possibleIcons: () => [IconKeyMappings.BUFF_DAMAGECUT.name],
    type: [EffectTypes.ACTIVE.name],
    process (effect = {}, context) {
      const values = [];
      const targetData = helper.getTargetData(effect);
      const turns = helper.getTurns(effect['dmg% reduction turns (36)']);

      const iconKey = IconKeyMappings.BUFF_DAMAGECUT.name;
      const value = effect['dmg% reduction'];

      values.push({ iconKey, value: { value, turns, targetData }, desc: `${helper.getNumberAsPolarizedPercent(+value)} mitigation ${targetData}` });

      return {
        type: this.type,
        turnDuration: turns.value,
        originalEffect: effect,
        context,
        values,
      };
    },
  },
  '19': {
    desc: 'BC Fill per Turn',
    config: {},
    possibleIcons: () => [IconKeyMappings.BUFF_BBREC.name],
    type: [EffectTypes.ACTIVE.name],
    process (effect = {}, context) {
      const values = [];
      const targetData = helper.getTargetData(effect);
      const turns = helper.getTurns(effect['increase bb gauge gradual turns (37)']);

      const iconKey = IconKeyMappings.BUFF_BBREC.name;
      const fillPerTurn = effect['increase bb gauge gradual'];
      values.push({ iconKey, value: { fillPerTurn, turns, targetData }, desc: `${helper.getNumberAsPolarizedNumber(fillPerTurn)} BC/turn ${targetData}` });

      return {
        type: this.type,
        turnDuration: turns.value,
        originalEffect: effect,
        context,
        values,
      };
    },
  },
  '31': {
    desc: 'Instant BC fill/Flat BB Gauge Increase',
    config: {},
    possibleIcons: () => [IconKeyMappings.INSTANT_BUFF_BBREC.name],
    type: [EffectTypes['INSTANT/BURST'].name],
    process (effect = {}, context) {
      const values = [];
      const targetData = helper.getTargetData(effect);

      const fillAmount = effect['increase bb gauge'];

      const iconKey = IconKeyMappings.INSTANT_BUFF_BBREC.name;
      values.push({ iconKey, value: { value: fillAmount, targetData }, desc: `${helper.getNumberAsPolarizedNumber(fillAmount)} BC fill ${targetData}` });

      return {
        type: this.type,
        originalEffect: effect,
        context,
        values,
      };
    },
  },
  '56': {
    desc: 'Chance Angel Idol (AI)',
    config: {},
    possibleIcons: () => [IconKeyMappings.BUFF_KOBLOCK.name],
    type: [EffectTypes.ACTIVE.name],
    process (effect = {}, context) {
      const values = [];
      const targetData = helper.getTargetData(effect);
      const turns = helper.getTurns(effect['angel idol buff turns (91)']);

      const iconKey = IconKeyMappings.BUFF_KOBLOCK.name;
      const recoverChance = effect['angel idol recover chance%'] || 0;
      const recoverHp = effect['angel idol recover hp%'] || 0;

      values.push({ iconKey, value: { value: recoverChance, hp: recoverHp, turns, targetData }, desc: `${recoverChance}% chance to prevent one knockout (recover ${recoverHp}% on use) ${targetData}` });
      return {
        type: this.type,
        turnDuration: turns.value,
        originalEffect: effect,
        context,
        values,
      };
    },
  },
  '76': {
    desc: 'Extra Action',
    config: {},
    possibleIcons: () => [IconKeyMappings.BUFF_DBLSTRIKE.name],
    type: [EffectTypes.ACTIVE.name],
    process (effect = {}, context) {
      const values = [];
      const targetData = helper.getTargetData(effect);
      const turns = helper.getTurns(effect['extra action buff turns (123)']);

      const iconKey = IconKeyMappings.BUFF_DBLSTRIKE.name;
      const chance = +effect['chance% for extra action'] || 0;
      const maxActions = +effect['max number of extra actions'] || 0;

      values.push({ iconKey, value: { chance, maxActions, turns, targetData }, desc: `${helper.getNumberAsPolarizedPercent(chance)} chance to perform up to ${maxActions} extra ${maxActions === 1 ? 'action' : 'actions'} ${targetData}` });
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
