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
        <slot name="description" :toggleBuffTable="() => showBuffTable = !showBuffTable" :showBuffTable="showBuffTable" :activeTabIndex="activeTabIndex">
          {{ descriptionGetter(entry) }}
          <template v-if="entry && effectGetter(entry)">
            <v-card-actions class="pl-0 pr-0 pb-0">
              <v-btn flat @click="showBuffTable = !showBuffTable">{{ showBuffTable ? 'Hide' : 'Show' }} Buff Table</v-btn>
            </v-card-actions>
            <v-slide-y-transition>
              <buff-table :effects="effectGetter(entry)" v-show="showBuffTable" :showHeaders="true"/>
            </v-slide-y-transition>
          </template>
        </slot>
      </section>
      <section slot="json">
        <slot name="json" :activeTabIndex="activeTabIndex">
          <json-viewer :json="entry" :value="activeTabIndex" :treeOptions="treeOptions"/>
        </slot>
      </section>
      <section slot="buff-list">
        <slot name="buff-list" :activeTabIndex="activeTabIndex">
          TODO: {{ entry }}
        </slot>
      </section>
      <section v-for="tab in extraTabConfig" :key="tab.slot" :slot="tab.slot">
        <slot :name="tab.slot" :activeTabIndex="activeTabIndex">
          {{ tab.name }}
        </slot>
      </section>
    </card-tabs-container>
  </bordered-titled-card>
</template>

<script>
import BorderedTitledCard from '@/components/BorderedTitledCard';
import CardTitleWithLink from '@/components/CardTitleWithLink';
import BuffTable from '@/components/Multidex/BuffTable/MainTable';
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
      default: () => `<b>Entry: Name</b>`,
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
      default: entry => (entry ? (entry.desc || entry.description) : 'None'),
    },
    effectGetter: {
      type: Function,
      default: entry => (entry.effects || []),
    },
    treeOptions: {
      default: undefined,
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
      const customConfig = {
        JSON: () => this.entry && 'JSON',
        'Buff List': () => this.entry && 'Buff List',
      }
      const tabs = this.tabNames
        .map(name => customConfig[name] !== undefined ? customConfig[name]() : name)
        .filter(val => val);
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
