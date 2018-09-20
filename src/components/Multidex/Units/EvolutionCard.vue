<template>
  <bordered-titled-card materialColor="indigo" class="evolution-card">
    <template slot="title">
      <b>Evolutions</b>
    </template>
    <loading-indicator v-if="loadingEvolutions" loadingMessage="Loading evolution data"/>
    <span v-else-if="evolutions.length === 0">No evolution data found.</span>
    <template v-else>
      <v-stepper vertical v-model="currentEvolutionIndex">
        <template v-for="(evo, i) in evolutions">
          <v-stepper-step :key="`step=${evo.current}`" edit-icon="" editable :step="i + 1">
            <template v-if="$vuetify.breakpoint.xsOnly">
              <v-layout row wrap>
                <v-flex xs12>
                  <span class="d-flex-container items-center content-center">
                    <unit-thumbnail
                      class="mr-1"
                      :src="getUnitImages(evo.current).ills_thum"
                      :rarity="getUnit(evo.current).rarity"
                      :imageTitle="getUnit(evo.current).name"
                      :displayWidth="32" :displayHeight="32"/>
                    <span class="text-xs-center">{{ getUnit(evo.current).name }} ({{ getUnit(evo.current).rarity === 8 ? 'OE' : `${getUnit(evo.current).rarity}*` }})</span>
                  </span>
                </v-flex>
                <v-flex xs12 class="text-xs-center pa-0">
                  <v-icon>keyboard_arrow_down</v-icon>
                </v-flex>
                <v-flex xs12>
                  <span class="d-flex-container items-center content-center">
                    <unit-thumbnail
                      class="mr-1"
                      :src="getUnitImages(evo.next).ills_thum"
                      :rarity="getUnit(evo.next).rarity"
                      :imageTitle="getUnit(evo.next).name"
                      :displayWidth="32" :displayHeight="32"/>
                    <span class="text-xs-center">{{ getUnit(evo.next).name }} ({{ getUnit(evo.next).rarity === 8 ? 'OE' : `${getUnit(evo.next).rarity}*` }})</span>
                  </span>
                </v-flex>
              </v-layout>
            </template>
            <template v-else>
              <span class="d-flex-container items-center content-center">
                <span class="text-xs-center">
                  <unit-thumbnail
                    class="d-block"
                    style="margin: auto;"
                    :src="getUnitImages(evo.current).ills_thum"
                    :rarity="getUnit(evo.current).rarity"
                    :imageTitle="getUnit(evo.current).name"
                    :displayWidth="32" :displayHeight="32"/>
                  <span>{{ getUnit(evo.current).name }} ({{ getUnit(evo.current).rarity === 8 ? 'OE' : `${getUnit(evo.current).rarity}*` }})</span>
                </span>
                <arrows-right class="ml-2 mr-2" :inputIndex="arrowIndex"/>
                <span class="text-xs-center">
                  <unit-thumbnail
                    class="d-block"
                    style="margin: auto;"
                    :src="getUnitImages(evo.next).ills_thum"
                    :rarity="getUnit(evo.next).rarity"
                    :imageTitle="getUnit(evo.next).name"
                    :displayWidth="32" :displayHeight="32"/>
                  <span>{{ getUnit(evo.next).name }} ({{ getUnit(evo.next).rarity === 8 ? 'OE' : `${getUnit(evo.next).rarity}*` }})</span>
                </span>
              </span>
            </template>

          </v-stepper-step>
          <v-stepper-content :key="`content-${evo.current}`" :step="i + 1">
            <v-layout row class="text-xs-center d-align-items-center">
              <v-flex xs3>
                <router-link :to="getMultidexPathForUnit(evo.current)">
                  <unit-thumbnail
                    :src="getUnitImages(evo.current).ills_thum"
                    :rarity="getUnit(evo.current).rarity"
                    :imageTitle="getUnit(evo.current).name"
                    :displayWidth="64" :displayHeight="64"/>
                </router-link>
              </v-flex>
              <v-flex xs1>
                <v-icon>chevron_right</v-icon>
              </v-flex>
              <v-flex xs4>
                <template v-for="(mat, i) in evo.mats">
                  <router-link v-if="mat.type === 'unit'" :to="getMultidexPathForUnit(mat.id)" :key="i">
                    <unit-thumbnail
                      :src="getUnitImages(mat.id).ills_thum"
                      :imageTitle="mat.name"
                      :displayWidth="64" :displayHeight="64"/>
                  </router-link>  
                  <router-link v-else :to="getMultidexPathForItem(mat.id)" :key="i">
                    <item-thumbnail
                      :src="getItemImage(mat.id)"
                      :imageTitle="mat.name"
                      type="evomat"
                      :displayWidth="64" :displayHeight="64"/>
                  </router-link>  
                </template>
              </v-flex>
              <v-flex xs1>
                <v-icon>chevron_right</v-icon>
              </v-flex>
              <v-flex xs3>
                <router-link :to="getMultidexPathForUnit(evo.next)">
                  <unit-thumbnail
                    :src="getUnitImages(evo.next).ills_thum"
                    :rarity="getUnit(evo.next).rarity"
                    :imageTitle="getUnit(evo.next).name"
                    :displayWidth="64" :displayHeight="64"/>
                </router-link>
              </v-flex>
            </v-layout>
          </v-stepper-content>
        </template>
      </v-stepper>
    </template>
  </bordered-titled-card>
</template>

<script>
import { mapGetters } from 'vuex';
import BorderedTitledCard from '@/components/BorderedTitledCard';
import LoadingIndicator from '@/components/LoadingIndicator';
import UnitThumbnail from '@/components/Multidex/Units/UnitThumbnail';
import ArrowsRight from '@/components/Multidex/ArrowsRight';
import ItemThumbnail from '@/components/Multidex/Items/ItemThumbnail';
import { getEvolutions } from '@/modules/core/units';
import { delay } from '@/modules/utils';

export default {
  props: {
    unit: {
      type: Object,
    },
    logger: {
      required: true,
    },
    pageDb: {
      type: Object,
      required: true,
    },
  },
  components: {
    BorderedTitledCard,
    LoadingIndicator,
    UnitThumbnail,
    ArrowsRight,
    ItemThumbnail,
  },
  computed: {
    ...mapGetters('units', {
      getUnitImages: 'getImageUrls',
      getMultidexPathForUnit: 'getMultidexPathTo'
    }),
    ...mapGetters('items', {
      getItemImage: 'getImageUrl',
      getMultidexPathForItem: 'getMultidexPathTo'
    }),
  },
  data () {
    return {
      loadingEvolutions: true,
      evolutions: [],
      currentEvolutionIndex: 0,
      getterCache: {},
      arrowIndex: 0,
    };
  },
  methods: {
    getUnit (id) {
      if (!this.getterCache[id]) {
        this.getterCache[id] = this.pageDb[id];
      }
      return this.getterCache[id];
    },
    async loop () {
      await delay(500);
      this.arrowIndex = (this.arrowIndex < 2) ? this.arrowIndex + 1 : 0;
      requestAnimationFrame(this.loop);
    },
  },
  async mounted () {
    this.loadingEvolutions = true;

    try {
      this.evolutions = await getEvolutions(this.unit, this.getUnit);

      const id = this.unit.id.toString();

      const relevantIndices = this.evolutions.map(({ current, next }, index) => ({ current, next, index }))
        .filter(e => e.current === id || e.next === id)
        .map(({ index }) => index + 1); // offset by 1 for stepper

      if (relevantIndices.length > 0) {
        this.currentEvolutionIndex = (relevantIndices.length === 1) ? relevantIndices[0] : relevantIndices[relevantIndices.length - 1];
      }

      if (this.evolutions.length > 0) {
        this.loop();
      }
    } catch (err) {
      this.logger.error('error getting evolutions', err);
    }

    this.loadingEvolutions = false;
  },
};
</script>

<style lang="less">
.evolution-card {
  .v-stepper {
    .v-stepper__step {
      padding-top: 16px;

      .v-stepper__label {
        width: 100%;
        display: inline-block;
      }
    }
  }
}
</style>
