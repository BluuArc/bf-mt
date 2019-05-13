<template>
  <v-flex class="spark-unit-entry--editable" v-bind="$attrs" v-on="$listeners">
    <slot name="before-content"/>
    <div style="display: flex;">
      <v-layout
        column class="mx-2"
        :style="`flex-grow: 0!important; min-width: ${thumbnailSize}px; max-width: ${thumbnailSize}px;`">
        <v-flex text-xs-center v-if="$vuetify.breakpoint.xsOnly">
          <span class="caption text-no-wrap">{{ unit.position }}</span>
        </v-flex>
        <v-layout align-content-center row>
          <unit-thumbnail
            class="unit-thumbnail"
            :style="`border-color: ${orderSettings.border};`"
            :src="getImageUrls(unit.id).ills_battle"
            :rarity="rarity"
            :imageTitle="name"
            :displayWidth="thumbnailSize" :displayHeight="thumbnailSize">
            <template slot="after-image">
              <text
                :x="0"
                :y="thumbnailSize * 0.75">
                {{ !isNaN(unit.bbOrder) ? unit.bbOrder : '-' }}
              </text>
            </template>
          </unit-thumbnail>
        </v-layout>
        <v-flex class="text-xs-center" v-if="orderSettings">
          <v-chip
            :style="`
              background-color: ${orderSettings.background};
              color: ${orderSettings.foreground};
              border-color: ${orderSettings.border};
            `"
            class="bb-order-chip"
            small>
            <b>{{ orderSettings.text }}</b>
          </v-chip>
        </v-flex>
      </v-layout>
      <v-layout column style="align-self: flex-start;">
        <!-- name and leader/friend icon -->
        <v-layout align-center>
          <v-flex class="d-flex-container align-center font-weight-bold subheading">
            <span v-if="rarity < 8">{{ rarity }}</span>
            <rarity-icon
              :class="{ 'ml-1': rarity !== 8, 'mr-1': true, }"
              :rarity="rarity || 0"
              :displaySize="18"/>
            <span>{{ name }}</span>
          </v-flex>
          <v-spacer/>
          <v-flex
            v-if="isLead || isFriend"
            style="flex-grow: 0;">
            <leader-icon
              v-if="isLead"
              :displaySize="18"/>
            <friend-icon
              v-else-if="isFriend"
              :displaySize="18"/>
          </v-flex>
        </v-layout>
        <v-layout>
          form options here for action, BB order, delay, relative priority
        </v-layout>
        <!-- <v-layout column>
          <v-flex>
            <span class="headline" v-text="sparkFraction"/>
            <span class="subheading" v-text="'SPARKS'" style="margin-left: 0.5em"/>
          </v-flex>
          <v-flex class="body-1">
            Delay:
            <template v-for="(entry, i) in delayDescription">
              <v-tooltip
                :key="entry.description"
                bottom
              >
                <span
                  slot="activator"
                  v-text="entry.delay"
                  style="text-decoration: underline dashed"
                />
                <span v-text="entry.description"/>
              </v-tooltip>
              <span
                v-if="i !== delayDescription.length - 1"
                :key="i"
                style="margin: 0 0.5em"
                v-text="'+'"
              />
            </template>
          </v-flex>
        </v-layout> -->
      </v-layout>
    </div>
  </v-flex>
</template>

<script>
import { squadUnitActions } from '@/modules/constants';
// import { getDelayDescriptionForSparkUnitResult } from '@/modules/spark-simulator/utils';
import { mapGetters } from 'vuex';
import colors from 'vuetify/es5/util/colors';
import UnitThumbnail from '@/components/Multidex/Units/UnitThumbnail';
import RarityIcon from '@/components/Multidex/RarityIcon';
import LeaderIcon from '@/components/Multidex/MiniLeaderIcon';
import FriendIcon from '@/components/Multidex/MiniFriendIcon';
import GettersMixin from '@/components/Tools/Squads/SynchronousGettersMixin';

export default {
  mixins: [GettersMixin],
  components: {
    UnitThumbnail,
    RarityIcon,
    LeaderIcon,
    FriendIcon,
  },
  props: {
    unit: {
      type: Object,
      required: true,
    },
    isLead: {
      type: Boolean,
      default: false,
    },
    isFriend: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapGetters('units', {
      getImageUrls: 'getImageUrls',
    }),
    thumbnailSize () {
      return 64;
    },
    iconSize () {
      return 22;
    },
    unitData () {
      return this.getUnit(this.unit.id) || {};
    },
    orderSettings () {
      const hasBbOrder = !isNaN(this.unit.bbOrder);
      return {
        text: (hasBbOrder && this.getOrderText(this.unit)) || '-',
        ...this.getColorSetBasedOnAction((hasBbOrder && this.unit) || undefined),
      };
    },
    rarity () {
      return this.unitData.rarity || 0;
    },
    name () {
      return this.unitData.name || this.unit.id;
    },
    // sparkFraction () {
    //   return `${this.sparkResultForUnit.actualSparks} / ${this.sparkResultForUnit.possibleSparks}`;
    // },
    // delayDescription () {
    //   return getDelayDescriptionForSparkUnitResult({
    //     sparkUnitResult: this.sparkResultForUnit,
    //     unitData: this.unitData,
    //   });
    // },
  },
  methods: {
    getColorSetBasedOnAction (unit = {}) {
      const colorKey = (unit.action === squadUnitActions.UBB && 'red') ||
        (unit.action === squadUnitActions.SBB && 'amber') ||
        (unit.action === squadUnitActions.BB && 'blueGrey') ||
        'grey';

      return {
        border: colors[colorKey].base,
        background: colors[colorKey].lighten4,
        foreground: colors[colorKey].darken4,
      };
    },
    getOrderText (unit = {}) {
      // default to SBB or below (depending on if the unit has it)
      const action = unit.action ||
        (this.getUnit(unit.id).sbb && squadUnitActions.SBB) ||
        (this.getUnit(unit.id).bb && squadUnitActions.BB) ||
        (squadUnitActions.ATK);
      return action.toUpperCase();
    },
  },
};
</script>

<style lang="less">
.spark-unit-entry--editable {
  .bb-order-chip {
    justify-content: center;
    margin: auto;
    width: 100%;
    border-top-left-radius: 0; 
    border-top-right-radius: 0;
    margin-top: 0;
  }

  image.lazy-actual {
    min-width: 64px;
  }

  .unit-thumbnail {
    flex: 0 1 auto;
    margin: auto;
    font: bold 4.5em sans-serif;
    stroke: black;
    stroke-width: 2px;
    fill: white;
    border: 1px solid white;
  }
}
</style>
