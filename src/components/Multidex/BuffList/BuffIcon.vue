<template>
  <svg
    class="buff-icon"
    :width="displaySize" :height="displaySize"
    :viewBox="`0 0 ${iconSize} ${iconSize}`"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink">
    <title v-if="iconKey" v-text="iconKey"/>
    <template v-if="iconConfig">
      <!-- iconKey is on one of the buff sheets -->
      <image
        :width="iconConfig.width" :height="iconConfig.height"
        :xlink:href="iconConfig.src"
        :transform="`translate(${iconConfig.coords})`"
      />
    </template>
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
    <g class="animate--pulse" v-if="isPassiveIcon(iconKey)">
      <rect x="0" y="0" width="32" height="32" rx="8" ry="8" fill="grey" style="fill-opacity: 0.5"/>
      <text x="4" y="30" font-family="Consolas" font-size="3rem" font-weight="bold" fill="white" stroke="black" stroke-width="2px">P</text>
    </g>
  </svg>
</template>

<script>
import {
  battleBuffIconKeys,
  sgBattleBuffIconKeys,
  customBuffIconKeys,
  ailmentBuffIconKeys,
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
  },
  methods: {
    getIconCoordinates (index = 0, rowLength = 15) {
      const y = Math.floor(index / rowLength);
      const x = index - (y * rowLength);
      return [x, y].map(c => c * -this.iconSize).join(' ');
    },
    getBattleBuffKeyFromCustomKey (customKey = 'INSTANT_SOME_BUFF') {
      // eslint-disable-next-line no-unused-vars
      const [ customPrefix, ...battleBuffIconKey ] = customKey.split('_');
      return battleBuffIconKey.join('_');
    },
    getIconConfigForKey (iconKeyInput = '') {
      let config = {};
      let iconKey;

      if (this.isPassiveIcon(iconKeyInput)) {
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
