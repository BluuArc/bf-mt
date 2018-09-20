<template>
  <generic-sprite-icon
    :iconWidth="iconSize" :iconHeight="iconSize"
    :sheetWidth="sheetSize[0]" :sheetHeight="sheetSize[1]"
    :displayWidth="displaySize" :displayHeight="displaySize"
    :src="require('@/assets/effect_anime_10001.png')"
    :iconX="xCoord" :iconY="yCoord"/>
</template>

<script>
import GenericSpriteIcon from '@/components/GenericSpriteIcon';
import { delay } from '@/modules/utils';

export default {
  props: {
    displaySize: {
      type: Number,
      default: 32,
    },
    inputIndex: {
      required: false,
    },
  },
  components: {
    GenericSpriteIcon,
  },
  computed: {
    iconSize () {
      return 56;
    },
    sheetSize () {
      return [56, 162];
    },
    xCoord () {
      return 0;
    },
    yCoord () {
      return this.currentFrame * this.iconSize;
    },
  },
  data () {
    return {
      currentFrame: 0,
      isPlaying: false,
      animationFrameId: null,
    };
  },
  methods: {
    incrementFrame () {
      this.currentFrame = (this.currentFrame < 2) ? (this.currentFrame + 1) : 0;
    },
    async loop () {
      if (this.isPlaying) {
        await delay(500);
        this.incrementFrame();
        this.animationFrameId = requestAnimationFrame(this.loop);
      }
    },
    stopLoop () {
      this.isPlaying = false;
      if (this.animationFrameId !== null) {
        cancelAnimationFrame(this.animationFrameId);
      }
      this.animationFrameId = null;
    },
  },
  mounted () {
    if (this.inputIndex === undefined) {
      this.isPlaying = true;
      this.loop();
    } else {
      this.currentFrame = this.inputIndex;
    }
  },
  watch: {
    inputIndex (newValue) {
      if (newValue !== undefined) {
        this.stopLoop();
        this.currentFrame = newValue;
      } else if (!this.isPlaying) {
        this.stopLoop();
        this.isPlaying = true;
        this.loop();
      }
    },
  },
};
</script>
