<template>
  <bordered-titled-card :materialColor="materialColor">
    <template slot="title">
      <slot name="title">
        <card-title-with-link
          :multidexPath="multidexPath || ''"
          :titleHtml="titleHtmlGenerator(entry)"/>
      </slot>
    </template>
    <card-tabs-container :tabs="tabConfig" v-model="activeTabIndex">
      <section slot="description">
        <slot name="description">
          {{ descriptionGetter(entry) }}
          <template v-if="entry">
            <v-card-actions class="pl-0 pr-0 pb-0">
              <v-btn flat @click="showBuffTable = !showBuffTable">{{ showBuffTable ? 'Hide' : 'Show' }} Buff Table</v-btn>
            </v-card-actions>
            <v-slide-y-transition>
              <buff-table :effects="entry.effects" v-show="showBuffTable" :showHeaders="true"/>
            </v-slide-y-transition>
          </template>
        </slot>
      </section>
      <section slot="json">
        <slot name="json">
          <json-viewer :json="entry" :value="activeTabIndex"/>
        </slot>
      </section>
      <section slot="buff-list">
        <slot name="buff-list">
          {{ entry }}
        </slot>
      </section>
      <section v-for="tab in extraTabConfig" :key="tab.slot">
        <slot :name="tab.slot">
          {{ tab.name }}
        </slot>
      </section>
    </card-tabs-container>
  </bordered-titled-card>
</template>

<script>
import BorderedTitledCard from '@/components/BorderedTitledCard';
import CardTitleWithLink from '@/components/CardTitleWithLink';
import BuffTable from '@/components/Multidex/BuffTable/MainTable.vue';
import CardTabsContainer from '@/components/CardTabsContainer';
import JsonViewer from '@/components/JsonViewer';

export default {
  props: {
    entry: {
      required: true,
    },
    materialColor: {
      type: String,
      required: true,
    },
    titleHtmlGenerator: {
      type: Function,
      default: () => () => `<b>Entry: Name</b>`,
    },
    multidexPath: {
      type: String,
      default: '',
    },
    tabNames: {
      type: Array,
      default: () => ['Description', 'JSON', 'Buff List']
    },
    descriptionGetter: {
      type: Function,
      default: () => entry => (entry ? (entry.desc || entry.description) : 'None'),
    },
  },
  components: {
    BorderedTitledCard,
    CardTitleWithLink,
    BuffTable,
    CardTabsContainer,
    JsonViewer,
  },
  computed: {
    tabConfig () {
      const tabs = ['Description', this.entry && 'JSON', this.entry && 'Buff List'].filter(val => val);
      return tabs.map(name => ({ name, slot: this.nameToSlot(name) }));
    },
    extraTabConfig () {
      const defaultTabs = ['Description', 'JSON', 'Buff List'];
      return this.tabConfig.filter(({ name }) => !defaultTabs.includes(name));
    },
  },
  data () {
    return {
      activeTabIndex: 0,
      showBuffTable: false,
    };
  },
  methods: {
    nameToSlot: (str) => str.replace(/ /g, '-').toLowerCase(),
  },
};
</script>
