<template>
  <span>
    <svg
      :width="width" :height="height"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      :title="title"
      :style="imgStyle">
      <title v-if="title" v-text="title"/>
      <image
        xlink:href="@/assets/item_frame_bg2.png"
        :width="width" :height="height"
        :style="imgStyle"
        :class="imgClass"
        :align="align"
        :title="title"
        :alt="alt"
        class="item-thumbnail-background"/>
       <image
        :xlink:href="src"
        :width="width" :height="height"
        :style="imgStyle"
        :class="imgClass"
        :align="align"
        :title="title"
        :alt="alt"
        class="item-thumbnail"/>
      <image
        xlink:href="@/assets/item_frame_1.png"
        :width="width" :height="height"
        v-if="type === 'consumable' && !raid"
        :style="imgStyle"
        :class="imgClass"
        :align="align"
        :title="title"
        :alt="alt"
        class="item-thumbnail-frame"/>
      <image
        xlink:href="@/assets/item_frame_2.png"
        :width="width" :height="height"
        v-else-if="type === 'material' && !raid"
        :style="imgStyle"
        :class="imgClass"
        :align="align"
        :title="title"
        :alt="alt"
        class="item-thumbnail-frame"/>
      <image
        xlink:href="@/assets/item_frame_3.png"
        :width="width" :height="height"
        v-else-if="type === 'sphere'"
        :style="imgStyle"
        :class="imgClass"
        :align="align"
        :title="title"
        :alt="alt"
        class="item-thumbnail-frame"/>
      <image
        xlink:href="@/assets/item_frame_4.png"
        :width="width" :height="height"
        v-else-if="type === 'evomat'"
        :style="imgStyle"
        :class="imgClass"
        :align="align"
        :title="title"
        :alt="alt"
        class="item-thumbnail-frame"/>
      <image
        xlink:href="@/assets/item_frame_6.png"
        :width="width" :height="height"
        v-else-if="type === 'summoner_consumable'"
        :style="imgStyle"
        :class="imgClass"
        :align="align"
        :title="title"
        :alt="alt"
        class="item-thumbnail-frame"/>
      <image
        xlink:href="@/assets/item_frame_5.png"
        :width="width" :height="height"
        v-else-if="raid"
        :style="imgStyle"
        :class="imgClass"
        :align="align"
        :title="title"
        :alt="alt"
        class="item-thumbnail-frame"/>
      <image
        xlink:href="@/assets/item_frame_7.png"
        :width="width" :height="height"
        v-else-if="type === 'ls_sphere'"
        :style="imgStyle"
        :class="imgClass"
        :align="align"
        :title="title"
        :alt="alt"
        class="item-thumbnail-frame"/>
      <image
        xlink:href="@/assets/item_frame_0.png"
        :width="width" :height="height"
        v-else
        :style="imgStyle"
        :class="imgClass"
        :align="align"
        :title="title"
        :alt="alt"
        class="item-thumbnail-frame"/>
    </svg>
    <span class="item-thumbnail-group" style="display: none;">
      <img
        :src="src"
        :style="imgStyle"
        :class="imgClass"
        :align="align"
        :title="title"
        :alt="alt"
        class="item-thumbnail"/>
    </span>
    <img
      src="@/assets/secret.png"
      :style="imgStyle"
      :class="imgClass"
      :align="align"
      :title="title"
      :alt="alt"
      class="item-filler-thumbnail"/>
  </span>
</template>

<script>
export default {
  props: ['imgClass', 'imgStyle', 'src', 'rarity', 'title', 'alt', 'align', 'type', 'raid', 'width', 'height'],
  mounted () {
    const placeholderImage = this.$el.querySelector('img.item-filler-thumbnail');
    const actualImage = this.$el.querySelector('img.item-thumbnail');
    const svg = this.$el.getElementsByTagName('svg')[0];

    placeholderImage.style.display = 'initial';
    svg.style.display = 'none';

    actualImage.onload = () => {
      placeholderImage.style.display = 'none';
      svg.style.display = '';
    };
  },
};
</script>

<style>
.item-thumbnail-group img {
  position: absolute;
  top: 0;
  left: 0;
}

.item-thumbnail-group .item-thumbnail-background {
  z-index: 1;
}

.item-thumbnail-group .item-thumbnail {
  z-index: 2;
}

.item-thumbnail-group .item-thumbnail-frame {
  z-index: 3;
}
</style>
