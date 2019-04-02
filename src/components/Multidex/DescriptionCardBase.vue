<template>
  <bordered-titled-card :materialColor="materialColor" class="multidex-dialog-content-card">
    <template slot="title">
      <slot name="title">
        <card-title-with-link
          :multidexPath="multidexPath || ''"
          :titleHtml="titleHtmlGenerator(entry)"/>
      </slot>
    </template>
    <card-tabs-container :tabs="tabConfig" v-model="activeTabIndex" :class="tabContainerClass">
      <section slot="description">
        <slot
          name="description"
          :toggleBuffTable="() => showBuffTable = !showBuffTable"
          :showBuffTable="showBuffTable"
          :hasShownBuffTable="hasShownBuffTable"
          :activeTabIndex="activeTabIndex">
          {{ descriptionGetter(entry) }}
          <template v-if="entry && hasEffects">
            <v-card-actions class="pl-0 pr-0 pb-0">
              <v-btn flat @click="showBuffTable = !showBuffTable">{{ showBuffTable ? 'Hide' : 'Show' }} Buff Table</v-btn>
            </v-card-actions>
            <v-slide-y-transition>
              <div v-show="showBuffTable" style="overflow-x: auto;">
                <buff-table :effects="effects" v-if="hasShownBuffTable" :showHeaders="true"/>
              </div>
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
        <slot name="buff-list" :activeTabIndex="activeTabIndex" :effects="effects">
          <buff-list :effects="effects" :contextHandler="contextHandler"/>
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
import BuffList from '@/components/Multidex/BuffList/BuffList';
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
      default: () => ['Description', 'JSON', 'Buff List'],
    },
    descriptionGetter: {
      type: Function,
      default: entry => (entry ? (entry.desc || entry.description) : 'None'),
    },
    // input: entry, output: array of effects
    effectGetter: {
      type: Function,
      default: entry => (entry.effects || []),
    },
    // input: entry & index, output: object with context options
    contextHandler: {
      type: Function,
    },
    treeOptions: {
      default: undefined,
    },
    tabContainerClass: {
      default: undefined,
    },
  },
  components: {
    BorderedTitledCard,
    CardTitleWithLink,
    BuffTable,
    BuffList,
    CardTabsContainer,
    JsonViewer,
  },
  computed: {
    tabConfig () {
      const customConfig = {
        JSON: () => this.entry && 'JSON',
        'Buff List': () => this.hasEffects && 'Buff List',
      };
      const tabs = this.tabNames
        .map(name => customConfig[name] !== undefined ? customConfig[name]() : name)
        .filter(val => val);
      return tabs.map(name => ({ name, slot: this.nameToSlot(name) }));
    },
    extraTabConfig () {
      const defaultTabs = ['Description', 'JSON', 'Buff List'];
      return this.tabConfig.filter(({ name }) => !defaultTabs.includes(name));
    },
    hasEffects () {
      return Array.isArray(this.effects) && this.effects.length > 0;
    },
    effects () {
      return this.entry ? this.effectGetter(this.entry) : [];
    },
  },
  data () {
    return {
      activeTabIndex: 0,
      showBuffTable: false,
      hasShownBuffTable: false,
    };
  },
  methods: {
    nameToSlot: (str) => str.replace(/ /g, '-').toLowerCase(),
  },
  watch: {
    showBuffTable (isShowing) {
      if (isShowing) {
        this.hasShownBuffTable = true;
      }
    },
  },
};
</script>
