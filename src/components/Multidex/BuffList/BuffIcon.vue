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
    <template v-else>
      <image
        :xlink:href="require('@/assets/item_frame_bg2.png')"
        :width="iconSize" :height="iconSize"
        class="buff-background"/>
      <image
        :xlink:href="require('@/assets/buff-translation/raid/raid_room_shadow_question.png')"
        :width="iconSize" :height="iconSize"/>
    </template>
  </svg>
</template>

<script>
import {
  battleBuffIconKeys,
  sgBattleBuffIconKeys,
  customBuffIconKeys,
  ailmentBuffIconKeys,
} from '@/modules/constants';
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
    getIconConfigForKey (iconKey) {
      let config = {};
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
  },
};
</script>

<style>

</style>
