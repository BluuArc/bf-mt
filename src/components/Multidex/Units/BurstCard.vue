<template>
  <description-card-base
    :entry="burst"
    :materialColor="titleColor"
    :titleHtmlGenerator="() => `<b>${burstLabel}: ${name}</b>`"
    :multidexPath="burst && getMultidexPathTo(burst.id) || ''"
    :descriptionGetter="() => description"
    :treeOptions="{ maxDepth: 1 }">
    <template slot="description" slot-scope="{ toggleBuffTable, showBuffTable }">
      {{ description }}
      <template v-if="burst">
        <v-card-actions class="pl-0 pr-0 pb-0">
          <v-btn flat @click="toggleBuffTable">{{ showBuffTable ? 'Hide' : 'Show' }} Buff Table</v-btn>
        </v-card-actions>
        <v-slide-y-transition>
          <v-container fluid v-show="showBuffTable" grid-list-xl>
            <v-layout row>
              <v-flex class="pt-0">
                <v-divider/>
              </v-flex>
            </v-layout>
            <v-layout row v-if="numLevels > 1">
              <v-flex xs4 md2 class="text-xs-center d-align-self-center">
                Level: {{ levelIndex + 1 }}
              </v-flex>
              <v-flex>
                <v-slider v-model="levelIndex" step="1" ticks min="0" :max="numLevels - 1"/>
              </v-flex>
            </v-layout>
            <v-layout row>
              <v-flex>
                <buff-table :effects="currentBurstEffect" :showHeaders="true"/>
              </v-flex>
            </v-layout>
          </v-container>
        </v-slide-y-transition>
      </template>
    </template>
  </description-card-base>
</template>

<script>
import { mapGetters } from 'vuex';
import DescriptionCardBase from '@/components/Multidex/DescriptionCardBase';
import BuffTable from '@/components/Multidex/BuffTable/MainTable';

export default {
  props: {
    unit: {
      type: Object,
    },
    logger: {
      required: true,
    },
    burstType: {
      type: String,
      default: 'bb',
    },
  },
  components: {
    DescriptionCardBase,
    BuffTable,
  },
  computed: {
    ...mapGetters('bursts', ['getMultidexPathTo']),
    burst () {
      return this.unit && this.unit[this.burstType];
    },
    name () {
      return this.burst ? this.burst.name : 'None';
    },
    description () {
      return this.burst ? this.burst.desc : 'None';
    },
    burstLabel () {
      const types = {
        bb: 'Brave Burst',
        sbb: 'Super Brave Burst',
        ubb: 'Ultimate Brave Burst',
      };
      return types[this.burstType];
    },
    titleColor () {
      const types = {
        bb: 'blue-grey',
        sbb: 'yellow darken-3',
        ubb: 'red darken-3',
      };
      return types[this.burstType];
    },
    numLevels () {
      return this.burst ? this.burst.levels.length : 0;
    },
    currentBurstEffect () {
      return this.burst ? this.burst.levels[this.levelIndex].effects : undefined;
    },
  },
  data () {
    return {
      levelIndex: 0,
    };
  },
  mounted () {
    this.levelIndex = (this.numLevels === 0) ? 0 : (this.numLevels - 1);
    this.logger.todo('implement grabbing existing filters for Burst');
  },
};
</script>
