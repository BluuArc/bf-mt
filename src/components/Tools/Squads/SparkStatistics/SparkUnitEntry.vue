<template>
  <v-flex class="spark-unit-entry" v-bind="$attrs" v-on="$listeners">
    <slot name="before-content"/>
    <div style="display: flex;">
      <v-layout
        column class="mx-2"
        :style="`flex-grow: 0!important; min-width: ${thumbnailSize}px; max-width: ${thumbnailSize}px;`">
        <v-flex text-xs-center v-if="$vuetify.breakpoint.xsOnly">
          <span class="caption text-no-wrap">{{ position }}</span>
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
                :y="thumbnailSize * 0.75"
                :style="bbOrderStyle"
              >
                {{ !isNaN(bbOrder) ? bbOrder : '-' }}
              </text>
            </template>
          </unit-thumbnail>
        </v-layout>
        <v-flex class="text-xs-center" v-if="orderSettings">
          <v-chip
            tabindex="-1"
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
        <v-layout column>
          <v-flex>
            <span class="headline" v-text="sparkFraction"/>
            <span class="subheading" v-text="'SPARKS'" style="margin-left: 0.5em"/>
          </v-flex>
          <v-layout row>
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
              ,
              <v-tooltip bottom>
                <span slot="activator" style="text-decoration: underline dashed">
                  Weight:
                </span>
                <span>Represents how much this unit contributes to the overall spark percentage of the squad.</span>
              </v-tooltip>
              {{ sparkResultForUnit.weight }} ({{ relativeWeight }}%)
            </v-flex>
            <v-flex style="flex-grow: 0" v-if="warnings.length > 0">
              <v-dialog v-model="showWarningDialog" max-width="500px">
                <v-btn
                  fab
                  small
                  color="warning"
                  slot="activator"
                >
                  <v-icon>info</v-icon>
                </v-btn>
                <v-card>
                  <v-card-text>
                    <v-container fluid class="pa-0">
                      <v-flex>
                        <v-alert outline :value="true" type="warning" style="overflow-x: auto;">
                          <span>This unit has issues that may affect the accuracy of results.</span>
                          <v-list>
                            <v-list-tile
                              v-for="message in warnings"
                              :key="message">
                              <v-list-tile-content>
                                <v-list-tile-title>
                                  {{ message }}
                                </v-list-tile-title>
                              </v-list-tile-content>
                            </v-list-tile>
                          </v-list>
                        </v-alert>
                      </v-flex>
                    </v-container>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer/>
                    <v-btn flat @click="showWarningDialog = false">
                      Back
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-flex>
          </v-layout>
        </v-layout>
      </v-layout>
    </div>
  </v-flex>
</template>

<script>
import { squadUnitActions } from '@/modules/constants';
import { getDelayDescriptionForSparkUnitResult } from '@/modules/spark-simulator/utils';
import { mapGetters } from 'vuex';
import colors from 'vuetify/es5/util/colors';
import UnitThumbnail from '@/components/Multidex/Units/UnitThumbnail';
import RarityIcon from '@/components/Multidex/RarityIcon';
import LeaderIcon from '@/components/Multidex/MiniLeaderIcon';
import FriendIcon from '@/components/Multidex/MiniFriendIcon';
import GettersMixin from '@/components/Tools/Squads/SynchronousGettersMixin';

const colorConfigByBbOrder = [
  { stroke: colors.red.darken4, fill: colors.red.lighten4 },
  { stroke: colors.blue.darken4, fill: colors.blue.lighten4 },
  { stroke: colors.green.darken4, fill: colors.green.lighten4 },
  { stroke: colors.yellow.darken4, fill: colors.yellow.lighten4 },
  { stroke: colors.grey.darken4, fill: colors.grey.lighten4 },
  { stroke: colors.purple.darken4, fill: colors.purple.lighten4 },
];
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
    sparkResultForUnit: {
      type: Object,
      required: true,
    },
    warnings: {
      type: Array,
      default: () => [],
    },
    burstCutins: {
      type: Boolean,
      default: false,
    },
    relativeWeight: {
      type: Number,
      default: 0,
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
      const hasBbOrder = !isNaN(this.bbOrder);
      return {
        text: (hasBbOrder && this.getOrderText({
          id: this.unit.id,
          action: this.action,
        })) || '-',
        ...this.getColorSetBasedOnAction((hasBbOrder && this.action) || undefined),
      };
    },
    rarity () {
      return this.unitData.rarity || 0;
    },
    name () {
      return this.unitData.name || this.unit.id;
    },
    sparkFraction () {
      return `${this.sparkResultForUnit.actualSparks} / ${this.sparkResultForUnit.possibleSparks}`;
    },
    delayDescription () {
      return getDelayDescriptionForSparkUnitResult({
        sparkUnitResult: this.sparkResultForUnit,
        unitData: this.unitData,
        burstCutins: !!this.burstCutins,
      });
    },
    bbOrder () {
      return this.sparkResultForUnit.bbOrder || this.unit.bbOrder;
    },
    action () {
      return this.sparkResultForUnit.action || this.unit.action;
    },
    position () {
      return this.sparkResultForUnit.position || this.unit.position;
    },
    bbOrderStyle () {
      let style;
      if (this.$store.state.showBbOrderColors && !isNaN(this.bbOrder) && colorConfigByBbOrder[+this.bbOrder - 1]) {
        style = { ...colorConfigByBbOrder[+this.bbOrder - 1] };
      }
      return style;
    },
  },
  data () {
    return {
      showWarningDialog: false,
    };
  },
  methods: {
    getColorSetBasedOnAction (action) {
      const colorKey = (action === squadUnitActions.UBB && 'red') ||
        (action === squadUnitActions.SBB && 'amber') ||
        (action === squadUnitActions.BB && 'blueGrey') ||
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
.spark-unit-entry {
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
    margin-top: auto;
    font: bold 4.5em sans-serif;
    stroke: black;
    stroke-width: 2px;
    fill: white;
    border: 1px solid white;
  }
}
</style>
