<template>
  <span>
    <span class="item-thumbnail-group" :style="imgStyle">
      <img
        src="@/assets/item_frame_1.png"
        v-if="type === 'consumable' && !raid"
        :style="imgStyle"
        :class="imgClass"
        :align="align"
        :title="title"
        :alt="alt"
        class="item-thumbnail-frame"/>
      <img
        src="@/assets/item_frame_2.png"
        v-else-if="type === 'material' && !raid"
        :style="imgStyle"
        :class="imgClass"
        :align="align"
        :title="title"
        :alt="alt"
        class="item-thumbnail-frame"/>
      <img
        src="@/assets/item_frame_3.png"
        v-else-if="type === 'sphere'"
        :style="imgStyle"
        :class="imgClass"
        :align="align"
        :title="title"
        :alt="alt"
        class="item-thumbnail-frame"/>
      <img
        src="@/assets/item_frame_4.png"
        v-else-if="type === 'evomat'"
        :style="imgStyle"
        :class="imgClass"
        :align="align"
        :title="title"
        :alt="alt"
        class="item-thumbnail-frame"/>
      <img
        src="@/assets/item_frame_6.png"
        v-else-if="type === 'summoner_consumable'"
        :style="imgStyle"
        :class="imgClass"
        :align="align"
        :title="title"
        :alt="alt"
        class="item-thumbnail-frame"/>
      <img
        src="@/assets/item_frame_5.png"
        v-else-if="raid"
        :style="imgStyle"
        :class="imgClass"
        :align="align"
        :title="title"
        :alt="alt"
        class="item-thumbnail-frame"/>
      <img
        src="@/assets/item_frame_7.png"
        v-else-if="type === 'ls_sphere'"
        :style="imgStyle"
        :class="imgClass"
        :align="align"
        :title="title"
        :alt="alt"
        class="item-thumbnail-frame"/>
      <img
        src="@/assets/item_frame_0.png"
        v-else
        :style="imgStyle"
        :class="imgClass"
        :align="align"
        :title="title"
        :alt="alt"
        class="item-thumbnail-frame"/>
      <img
        :src="src"
        :style="imgStyle"
        :class="imgClass"
        :align="align"
        :title="title"
        :alt="alt"
        class="item-thumbnail"/>
      <img
        src="@/assets/item_frame_bg2.png"
        :style="imgStyle"
        :class="imgClass"
        :align="align"
        :title="title"
        :alt="alt"
        class="item-thumbnail-background"/>
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
  props: ['imgClass', 'imgStyle', 'src', 'rarity', 'title', 'alt', 'align', 'type', 'raid'],
  mounted () {
    const placeholderImage = this.$el.querySelector('img.item-filler-thumbnail');
    const actualImage = this.$el.querySelector('img.item-thumbnail');
    const imageGroup = this.$el.querySelector('.item-thumbnail-group');

    placeholderImage.style.display = 'initial';
    imageGroup.style.display = 'none';

    actualImage.onload = () => {
      placeholderImage.style.display = 'none';
      imageGroup.style.display = '';
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
