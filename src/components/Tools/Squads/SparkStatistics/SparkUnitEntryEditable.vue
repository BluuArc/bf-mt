<template>
  <v-flex class="spark-unit-entry--editable" v-bind="$attrs" v-on="$listeners">
    <slot name="before-content"/>
    <div style="display: flex;">
      <v-layout
        column class="mx-2"
        :style="`flex-grow: 0!important; min-width: ${thumbnailSize}px; max-width: ${thumbnailSize}px;`">
        <v-flex text-xs-center v-if="$vuetify.breakpoint.xsOnly" style="flex-grow: 0;">
          <span class="caption text-no-wrap">{{ unit.position }}</span>
        </v-flex>
        <v-layout
          :align-content-end="$vuetify.breakpoint.smAndUp"
          :style="$vuetify.breakpoint.xsOnly ? 'flex-grow: 0;' : undefined"
        >
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
                {{ bbOrderToShow }}
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
        <v-flex
          v-if="warnings.length > 0"
          align-content-end
          class="text-xs-center"
          style="flex-grow: 0;"
        >
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
                    <v-alert outline :value="true" type="warning">
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
      <v-layout column style="align-self: flex-start;">
        <!-- name and leader/friend icon -->
        <v-layout align-center>
          <v-flex class="d-flex-container align-center font-weight-bold subheading">
            <span v-if="rarity < 8">{{ rarity }}</span>
            <rarity-icon
              :class="{ 'ml-1': rarity !== 8, 'mr-1': true, }"
              :rarity="rarity || 0"
              :displaySize="18"/>
            <span>{{ nameLabel }}</span>
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
        <v-layout row wrap>
          <v-flex xs12 md4>
            <v-select
              label="Action"
              :disabled="isEmptyUnit"
              :items="actionPossibilities"
              :value="actionToShow"
              @input="$v => emitChangedValue({ action: $v })"
            />
          </v-flex>
          <v-flex xs12 md4>
            <v-select
              label="BB Order"
              :value="sparkSimUnitConfig.bbOrder || unit.bbOrder"
              :items="bbOrderPossibilities"
              @input="$v => emitChangedValue({ bbOrder: $v })"
            />
          </v-flex>
          <v-flex xs12 md4>
            <v-text-field
              label="Delay"
              :disabled="isEmptyUnit"
              type="number"
              :value="!isNaN(sparkSimUnitConfig.delay) ? +sparkSimUnitConfig.delay : 0"
              @input="$v => emitChangedValue({ delay: $v })"
            />
          </v-flex>
          <v-flex>
            <v-text-field
              label="Weight"
              hint="Higher weight means unit will be prioritized over units with lesser weight for spark results. Weight of zero and below means ignore that unit completely."
              persistent-hint
              :disabled="isEmptyUnit || isAnyUnit"
              type="number"
              :value="!isNaN(sparkSimUnitConfig.weight) ? +sparkSimUnitConfig.weight : 1"
              @input="$v => emitChangedValue({ weight: $v })"
            />
          </v-flex>
          <v-flex xs12 style="padding: 0 0.5em">
            <v-btn
              :outline="!sparkSimUnitConfig.lockPosition"
              block
              @click="emitChangedValue({ lockPosition: !sparkSimUnitConfig.lockPosition })"
            >
              <v-icon left>{{ sparkSimUnitConfig.lockPosition ? 'lock' : 'lock_open' }}</v-icon>
              <span style="text-transform: capitalize;">Position</span>
            </v-btn>
          </v-flex>
        </v-layout>
      </v-layout>
    </div>
  </v-flex>
</template>

<script>
import { squadFillerMapping, squadUnitActions, ANY_BB_ORDER } from '@/modules/constants';
import { getMoveType } from '@/modules/core/units';
import { getSparkSimUnitConfig } from '@/modules/spark-simulator/utils';
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
    sparkSimUnitConfig: {
      type: Object,
      default: () => {},
    },
    warnings: {
      type: Array,
      default: () => [],
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
        text: (hasBbOrder && this.actionText) || '-',
        ...(hasBbOrder && this.colorSetBasedOnAction) || undefined,
      };
    },
    rarity () {
      return this.unitData.rarity || 0;
    },
    name () {
      return this.unitData.name || this.unit.id;
    },
    isEmptyUnit () {
      return this.name === squadFillerMapping.EMPTY;
    },
    isAnyUnit () {
      return this.name === squadFillerMapping.ANY;
    },
    actionPossibilities () {
      const availableBurstTypes = [
        {
          text: 'BB',
          value: squadUnitActions.BB,
        },
        {
          text: 'SBB',
          value: squadUnitActions.SBB,
        },
        {
          text: 'UBB',
          value: squadUnitActions.UBB,
        },
      ].filter(({ value }) => this.unit.id === squadFillerMapping.ANY || this.unitData[value] || this.unit.action === value);

      const nonBurstActions = [
        (this.isEmptyUnit && {
          text: 'None',
          value: squadUnitActions.NONE,
        }),
        (!this.isEmptyUnit && {
          text: 'Attack',
          value: squadUnitActions.ATK,
        }),
      ].filter(v => v);
      return nonBurstActions.concat(availableBurstTypes);
    },
    bbOrderPossibilities: () => [ANY_BB_ORDER]
      .concat(new Array(6).fill(0).map((_, i) => i + 1)),
    moveTypeText () {
      const moveType = Object.keys(this.unitData).length > 0 && getMoveType(this.unitData);
      return (moveType && ` (${moveType})`) || '';
    },
    nameLabel () {
      return `${this.name}${this.moveTypeText}`;
    },
    actionToShow () {
      return this.sparkSimUnitConfig.action || this.unit.action;
    },
    colorSetBasedOnAction () {
      const colorKey = (this.actionToShow === squadUnitActions.UBB && 'red') ||
        (this.actionToShow === squadUnitActions.SBB && 'amber') ||
        (this.actionToShow === squadUnitActions.BB && 'blueGrey') ||
        'grey';

      return {
        border: colors[colorKey].base,
        background: colors[colorKey].lighten4,
        foreground: colors[colorKey].darken4,
      };
    },
    actionText () {
      // default to SBB or below (depending on if the unit has it)
      const action = this.actionToShow ||
        (this.unitData.sbb && squadUnitActions.SBB) ||
        (this.unitData.bb && squadUnitActions.BB) ||
        (squadUnitActions.ATK);
      return action.toUpperCase();
    },
    bbOrderToShow () {
      return [
        !isNaN(this.sparkSimUnitConfig.bbOrder) && this.sparkSimUnitConfig.bbOrder,
        this.sparkSimUnitConfig.bbOrder === ANY_BB_ORDER && '-',
        !isNaN(this.unit.bbOrder) && this.unit.bbOrder,
        '-',
      ].find(v => v);
    },
  },
  data () {
    return {
      showWarningDialog: false,
    };
  },
  methods: {
    emitChangedValue (newVal = {}) {
      this.$emit('input', getSparkSimUnitConfig({ ...this.sparkSimUnitConfig, ...newVal }));
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
    margin-top: auto;
    font: bold 4.5em sans-serif;
    stroke: black;
    stroke-width: 2px;
    fill: white;
    border: 1px solid white;
  }

  .v-input {
    margin: 0.5em;
  }
}
</style>
