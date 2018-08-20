<template>
  <v-container fluid class="pa-0">
    <v-tabs v-model="activeTab" class="pb-2">
      <v-tab>Description</v-tab>
      <v-tab v-if="effects">JSON</v-tab>
      <v-tab v-if="effects">Buff List (Alpha)</v-tab>
    </v-tabs>
    <v-tabs-items v-model="activeTab" touchless :style="tabItemsStyle" :class="tabItemsClass">
      <v-tab-item>
        <slot name="description">
          <span>{{ description }}</span>
        </slot>
        <template v-if="effects">
          <v-card-actions class="pl-0 pr-0 pt-2 pb-2">
            <v-btn flat class="ma-0" @click="showBuffList = !showBuffList">{{ showBuffList ? 'Hide' : 'Show' }} Buff List</v-btn>
          </v-card-actions>
          <v-slide-y-transition>
            <effect-list :effects="effects" v-show="showBuffList" :show-headers="true"/>  
          </v-slide-y-transition>
        </template>
      </v-tab-item>
      <v-tab-item v-if="effects">
        <json-viewer :json="effects" :change-view="activeTab"/>
      </v-tab-item>
      <v-tab-item v-if="effects">
          <v-container fluid>
            <v-layout row wrap>
              <buff-list :effects="effects"/>
            </v-layout>
          </v-container>
        </v-tab-item>
    </v-tabs-items>
  </v-container>
</template>

<script>
import JsonViewer from '@/components/Multidex/JsonViewer';
import EffectList from '@/components/Multidex/EffectList/MainTable';
import BuffList from '@/components/Multidex/BuffList/BuffList';

export default {
  props: {
    effects: {
      type: Array,
    },
    description: {
      type: String,
    },
    tabItemsStyle: {
      type: String,
    },
    tabItemsClass: {
      type: String,
    },
  },
  components: {
    'json-viewer': JsonViewer,
    'effect-list': EffectList,
    'buff-list': BuffList,
  },
  data () {
    return {
      activeTab: 0,
      showBuffList: false,
    };
  },
};
</script>
