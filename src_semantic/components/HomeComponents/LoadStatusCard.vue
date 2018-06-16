<template>
  <div class="ui segments" id="load-status-card">
      <div class="ui purple inverted segment left aligned">Load Status</div>
      <div class="ui segment left aligned">
        <ul>
          <li v-for="(value, key) in structure" :key="key">
            <p><b>{{ value.name }}:</b> {{ loadProgress[key] }}</p>
            <span v-if="value.isLoaded($store.state)">
              <ul v-if="value.stateProperty.error === undefined">
                <li v-for="server in servers" :key="server">
                  <b>{{ server.toUpperCase() }}: </b>
                  <span v-if="value.stateProperty[server]">
                    Loaded {{ Object.keys(value.stateProperty[server]).length }} {{ value.name }}
                  </span>
                  <span v-else>
                    Not loaded.
                  </span>
                </li>
              </ul>
            </span>
            <!-- <span v-else>
              Loading...
            </span> -->
          </li>
        </ul>
        <!-- {{ loadProgress }} -->
      </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import { storeMethods } from '@/store';

export default {
  props: ['loadProgress'],
  computed: {
    ...mapState([
      'unitData',
      'itemData',
      'burstData',
      'extraSkillData',
    ]),
    structure() {
      return {
        units: {
          name: 'Units',
          isLoaded: this.unitDataLoaded,
          stateProperty: this.unitData,
        },
        items: {
          name: 'Items',
          isLoaded: this.itemDataLoaded,
          stateProperty: this.itemData,
        },
        bursts: {
          name: 'Brave Bursts',
          isLoaded: this.burstDataLoaded,
          stateProperty: this.burstData,
        },
        extraSkills: {
          name: 'Extra Skills',
          isLoaded: this.extraSkillDataLoaded,
          stateProperty: this.extraSkillData,
        },
      };
    },
    servers: () => ['gl', 'eu', 'jp'],
  },
  methods: {
    ...storeMethods,
  },
};
</script>
