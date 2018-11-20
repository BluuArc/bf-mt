<template>
  <svg
    class="buff-icon"
    :width="displaySize" :height="displaySize"
    :viewBox="`0 0 ${iconSize} ${iconSize}`"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink">
    <title v-if="iconKey" v-text="iconKey"/>
    <!-- background extra buff icons -->
    <g v-if="isPassiveTypeStatIcon(iconKey)">
      <template v-if="isPassiveTypeStatIcon(iconKey) && elements.includes(getTypeInfoFromPassiveTypeStatKey(iconKey).type.toLowerCase())">
        <image
          width="156" height="26"
          :xlink:href="require('@/assets/buff-translation/common/attribute_mark.png')"
          :transform="`translate(${elements.indexOf(getTypeInfoFromPassiveTypeStatKey(iconKey).type.toLowerCase()) * -26} 0)`"/>
      </template>
      <g v-else-if="isPassiveUnitTypeStatIcon(iconKey)">
        <rect x="5" y="5" width="22" height="22" fill="white"/>
        <text x="9.5" y="19" font-family="Consolas" font-size="1.20rem" font-weight="bold" fill="black">{{ (getTypeInfoFromPassiveTypeStatKey(iconKey).type[0] || '').toUpperCase() }}</text>
      </g>


    </g>


    <!-- buff icons from sheets -->
    <!-- iconKey is on one of the buff sheets -->
    <image
      v-if="iconConfig"
      :width="iconConfig.width" :height="iconConfig.height"
      :xlink:href="iconConfig.src"
      :transform="`translate(${iconConfig.coords})`"/>
    <g v-else-if="isAttackingIcon(iconKey)">
      <!-- attack based icons are here -->
      <image
        v-if="iconKey.endsWith('ST_ATK') || iconKey === IconKeyMappings.ATK.name"
        width="30" height="32"
        :xlink:href="(IconKeyMappings[iconKey] || IconKeyMappings.ATK).src"/>
      <template v-else-if="iconKey.endsWith('AOE_ATK')">
        <image
          width="30" height="32"
          :xlink:href="(IconKeyMappings[iconKey] || IconKeyMappings.ATK).src"
          transform="translate(-4 0)"/>
        <image
          width="30" height="32"
          :xlink:href="(IconKeyMappings[iconKey] || IconKeyMappings.ATK).src"
          transform="translate(34 0) scale(-1 1)"/>
      </template>
      <template v-else-if="iconKey === IconKeyMappings.RT_ATK.name">
        <image
          width="30" height="32"
          :xlink:href="IconKeyMappings.ATK.src"/>
        <image
          width="66" height="66"
          :xlink:href="require('@/assets/buff-translation/battle/battle_target_mark.png')"
          transform="scale(0.25)"
          class="animate--random-target"/>
      </template>
    </g>
    <template v-else>
      <image
        :xlink:href="require('@/assets/item_frame_bg2.png')"
        :width="iconSize" :height="iconSize"
        class="buff-background"/>
      <image
        :xlink:href="require('@/assets/buff-translation/raid/raid_room_shadow_question.png')"
        :width="iconSize" :height="iconSize"/>
    </template>

    <!-- foreground extra buff icons -->
    <image
      v-if="iconKey === IconKeyMappings.PASSIVE_BUFF_HPRECTURNSTART.name || iconKey === IconKeyMappings.PASSIVE_BUFF_BBRECTURNSTART.name"
      width="36" height="36"
      :xlink:href="require('@/assets/buff-translation/raid/raid_room_time.png')"
      x="24" y="0"
      transform="scale(0.55)"/>
    <template v-if="['zel', 'karma'].includes(getDropType(iconKey))">
      <image
        v-if="getDropType(iconKey) === 'zel'"
        width="102" height="102"
        :xlink:href="require('@/assets/zell_thum.png')"
        transform="scale(0.3)"/>
      <image
        v-else
        width="102" height="102"
        :xlink:href="require('@/assets/karma_thum.png')"
        transform="scale(0.3)"/>
    </template>
    <image
      v-if="iconKey.includes('HPTHRESH')"
      :width="hpThreshForegroundIconConfig.width" :height="hpThreshForegroundIconConfig.height"
      :xlink:href="hpThreshForegroundIconConfig.src"
      :transform="`translate(${hpThreshForegroundIconConfig.coords})`"/>

    <!-- pulsing letters for instant/passive/timed buffs -->
    <g class="animate--pulse" v-if="isPassiveIcon(iconKey)">
      <rect x="0" y="0" width="32" height="32" rx="8" ry="8" fill="grey" style="fill-opacity: 0.5"/>
      <text x="4" y="30" font-family="Consolas" font-size="3rem" font-weight="bold" fill="white" stroke="black" stroke-width="2px">P</text>
    </g>
    <g class="animate--pulse" v-else-if="isInstantIcon(iconKey)">
      <rect x="0" y="0" width="32" height="32" rx="8" ry="8" fill="grey" style="fill-opacity: 0.5"/>
      <text x="4" y="30" font-family="Consolas" font-size="3rem" font-weight="bold" fill="white" stroke="black" stroke-width="2px">B</text>
    </g>
  </svg>
</template>

<script>
import {
  battleBuffIconKeys,
  sgBattleBuffIconKeys,
  customBuffIconKeys,
  ailmentBuffIconKeys,
  unitTypes,
  elements,
  dropTypes,
} from '@/modules/constants';
import IconKeyMappings from '@/modules/EffectProcessor/icon-key-mappings';
import logger from '@/modules/Logger';

export default {
  props: {
    iconKey: {
      type: String,
      default: '',
    },
    displaySize: {
      type: Number,
      default: 32,
    },
  },
  computed: {
    IconKeyMappings: () => IconKeyMappings,
    elements: () => elements,
    iconSize () {
      return 32;
    },
    battleBuffMetaData: () => ({
      src: require('@/assets/buff-translation/battle/battle_buff_icon.png'),
      width: 480,
      height: 416,
    }),
    sgBattleBuffMetaData: () => ({
      src: require('@/assets/buff-translation/battle/battle_buff_icon_sg.png'),
      width: 480,
      height: 192,
    }),
    ailmentBuffMetaData: () => ({
      src: require('@/assets/buff-translation/battle/battle_bad_icon.png'),
      width: 192,
      height: 32,
    }),
    customBuffMetaData: () => ({
      src: require('@/assets/buff-translation/battle/custom-icons.png'),
      width: 480,
      height: 416,
    }),
    iconConfig () {
      let result;
      try {
        result = this.getIconConfigForKey(this.iconKey);
      } catch (err) {
        logger.error(err);
      }
      return result;
    },
    passiveTypeStatKeyBlacklist: () => [
      'PASSIVE_BUFF_HCREC',
    ],
    hpThreshForegroundIconConfig () {
      return {
        ...this.customBuffMetaData,
        coords: this.getIconCoordinates(customBuffIconKeys.indexOf('BUFF_HPTHRESHGENERIC')),
      };
    },
  },
  methods: {
    getIconCoordinates (index = 0, rowLength = 15) {
      const y = Math.floor(index / rowLength);
      const x = index - (y * rowLength);
      return [x, y].map(c => c * -this.iconSize).join(' ');
    },
    getBattleBuffKeyFromCustomKey (customKey = 'INSTANT_SOME_BUFF') {
      if (customKey === IconKeyMappings.PASSIVE_BUFF_HPRECTURNSTART.name) {
        return IconKeyMappings.BUFF_HPREC.name;
      } else if (customKey === IconKeyMappings.PASSIVE_BUFF_BBRECTURNSTART.name) {
        return IconKeyMappings.BUFF_BBREC.name;
      } else {
        // eslint-disable-next-line no-unused-vars
        const [ customPrefix, ...battleBuffIconKey ] = customKey.split('_');
        return battleBuffIconKey.join('_');
      }
    },
    getIconConfigForKey (iconKeyInput = '') {
      let config = {};
      let iconKey;

      if (this.isPassiveTypeStatIcon(iconKeyInput) && !['PASSIVE_BUFF_HPUP', 'PASSIVE_BUFF_HCREC', 'INSTANT_BUFF_ALLAILNULL'].includes(iconKey)) {
        // handles HP threshold and elemental stat boosting icons
        iconKey = [
          'BUFF_',
          !iconKeyInput.includes('HPTHRESH') ? 'ELEMENTAL': '',
          this.getTypeInfoFromPassiveTypeStatKey(iconKeyInput).stat,
          'UP'
        ].filter(v => v).join('');
      } else if (['zel', 'karma'].includes(this.getDropType(iconKeyInput))) {
        iconKey = 'BUFF_GENERICDROP';
      } else if (this.isDropType(iconKeyInput)) {
        iconKey = `BUFF_${this.getDropType(iconKeyInput).toUpperCase()}DROP`
      } else if (this.isPassiveIcon(iconKeyInput) || this.isInstantIcon(iconKeyInput)) {
        iconKey = this.getBattleBuffKeyFromCustomKey(iconKeyInput);
      } else {
        iconKey = iconKeyInput.slice();
      }

      if (battleBuffIconKeys.includes(iconKey)) {
        config = {
          ...this.battleBuffMetaData,
          coords: this.getIconCoordinates(battleBuffIconKeys.indexOf(iconKey)),
        };
      } else if (sgBattleBuffIconKeys.includes(iconKey)) {
        config = {
          ...this.sgBattleBuffMetaData,
          coords: this.getIconCoordinates(sgBattleBuffIconKeys.indexOf(iconKey)),
        };
      } else if (customBuffIconKeys.includes(iconKey)) {
        config = {
          ...this.customBuffMetaData,
          coords: this.getIconCoordinates(customBuffIconKeys.indexOf(iconKey)),
        };
      }  else if (ailmentBuffIconKeys.includes(iconKey)) {
        config = {
          ...this.ailmentBuffMetaData,
          coords: this.getIconCoordinates(ailmentBuffIconKeys.indexOf(iconKey)),
        };
      }

      return Object.keys(config).length > 0
        ? config
        : null;
    },
    isAttackingIcon (iconKey = '') {
      return iconKey === IconKeyMappings.ATK.name
        || iconKey === IconKeyMappings.RT_ATK.name
        || iconKey.endsWith('ST_ATK')
        || iconKey.endsWith('AOE_ATK');
    },
    isPassiveIcon (iconKey = '') {
      return iconKey.startsWith('PASSIVE');
    },
    isInstantIcon (iconKey = '') {
      return iconKey.startsWith('INSTANT');
    },
    getTypeInfoFromPassiveTypeStatKey (iconKey = 'PASSIVE_BUFF_ELEMENTHPUP') {
      const regexMatch = iconKey.match(/^PASSIVE_BUFF_(?<element>.+)(CRTRATE|HP|ATK|DEF|REC)UP$/);
      return regexMatch && !this.passiveTypeStatKeyBlacklist.includes(iconKey) && {
        type: regexMatch[1],
        stat: regexMatch[2],
      };
    },
    isPassiveTypeStatIcon (iconKey) {
      return !!this.getTypeInfoFromPassiveTypeStatKey(iconKey);
    },
    isPassiveUnitTypeStatIcon (iconKey) {
      const match = this.getTypeInfoFromPassiveTypeStatKey(iconKey) || {};
      const isPassiveType = !!match.type && unitTypes.includes(match.type.toLowerCase());
      return isPassiveType;
    },
    getDropType (iconKey) {
      return dropTypes.find(type => iconKey.endsWith(`${type.toUpperCase()}DROP`));
    },
    isDropType (iconKey) {
      return !!this.getDropType(iconKey);
    },
  },
};
</script>

<style lang="less">
.buff-icon {
  .animate--random-target {
    animation-name: random-target;
    animation-timing-function: ease;
    animation-duration: 3s;
    animation-iteration-count: infinite;
  }

  @keyframes random-target {
    0%, 100% {
      transform: translate(-100%,-100%) scale(0.25);
    }
    12.5%, 62.5% {
      transform: translate(17.5%,17.5%) scale(0.35);
    }
    25% {
      transform: translate(100%,100%) scale(0.25);
    }
    50% {
      transform: translate(100%,-100%) scale(0.25);
    }
    75% {
      transform: translate(-100%,100%) scale(0.25);
    }
  }

  .animate--pulse {
    animation-name: pulse;
    animation-duration: 2s;
    animation-iteration-count: infinite;
    animation-direction: alternate;
  }

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50%, 75% {
      opacity: 0;
    }
  }
}
</style>
