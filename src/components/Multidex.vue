<template>
  <div id="multidex-container">
    <div class='ui text container left aligned' id="content">
      <div class='ui two column stackable grid'>
        <div class='column'>
          <div class='ui fluid raised card'>
            <div class='content'>
              <div class='header'>Units</div>
              <div class='description'>
                <div class='ui sub header'>Statistics</div>
                <div class='ui small feed'>
                  <statistics-item htmlContent="Number of Overall Units"></statistics-item>
                  <statistics-item htmlContent="Element Distribution"></statistics-item>
                  <statistics-item htmlContent="Gender Distribution"></statistics-item>
                  <statistics-item htmlContent="Rarity Distribution"></statistics-item>
                  <statistics-item htmlContent="Server Distribution (shared and exclusive)">
                  </statistics-item>
                </div>
              </div>
            </div>
            <router-link
              to="/multidex/units"
              :class="{
                'ui button attached bottom': true,
                /* eslint-disable-next-line */
                disabled: !unitDataLoaded($store.state) || (unitDataLoaded($store.state) && unitData.error),
                red: unitDataLoaded($store.state) && unitData.error,
                green: unitDataLoaded($store.state) && !unitData.error
              }">
                <span v-if="unitDataLoaded($store.state)">
                  <span v-show="unitData.error === undefined">
                    Go to Unit Dex
                  </span>
                  <span v-show="unitData.error !== undefined">
                    [ERROR] {{ unitData.error }}
                  </span>
                </span>
                <span v-else>
                  Loading data...
                </span>
            </router-link>
          </div>
        </div>
        <div class='column'>
          <div class='ui fluid raised card'>
            <div class='content'>
              <div class='header'>Items</div>
              <div class='description'>
                <div class='ui sub header'>Statistics</div>
                <div class='ui small feed'>
                  <statistics-item htmlContent="Number of Overall Items"></statistics-item>
                  <statistics-item htmlContent="Item Type Distribution"></statistics-item>
                  <statistics-item htmlContent="Sphere Type Distribution"></statistics-item>
                  <statistics-item htmlContent="Rarity Distribution"></statistics-item>
                  <statistics-item htmlContent="Server Distribution (shared and exclusive)">
                  </statistics-item>
                </div>
              </div>
            </div>
            <router-link
              to="/multidex/items"
              :class="{
                'ui button attached bottom': true,
                /* eslint-disable-next-line */
                disabled: !itemDataLoaded($store.state) || (itemDataLoaded($store.state) && itemData.error),
                red: itemDataLoaded($store.state) && itemData.error,
                green: itemDataLoaded($store.state) && !itemData.error
              }">
                <span v-if="itemDataLoaded($store.state)">
                  <span v-show="itemData.error === undefined">
                    Go to Item Dex
                  </span>
                  <span v-show="itemData.error !== undefined">
                    [ERROR] {{ itemData.error }}
                  </span>
                </span>
                <span v-else>
                  Loading data...
                </span>
            </router-link>
          </div>
        </div>
        <div class='column'>
          <div class='ui fluid raised card'>
            <div class='content'>
              <div class='header'>Extra Skills</div>
              <div class='description'>
                <div class='ui sub header'>Statistics</div>
                <div class='ui small feed'>
                  <statistics-item htmlContent="Number of Extra Skills"></statistics-item>
                  <statistics-item htmlContent="Distribution of Unit and General Extra Skills"
                  ></statistics-item>
                  <statistics-item htmlContent="Server Distribution (shared and exclusive)">
                  </statistics-item>
                </div>
              </div>
            </div>
            <router-link
              to="/multidex/extraskills"
              :class="{
                'ui button attached bottom': true,
                /* eslint-disable-next-line */
                disabled: !extraSkillDataLoaded($store.state) || (extraSkillDataLoaded($store.state) && extraSkillData.error),
                red: extraSkillDataLoaded($store.state) && extraSkillData.error,
                green: extraSkillDataLoaded($store.state) && !extraSkillData.error
              }">
              <span v-if="extraSkillDataLoaded($store.state)">
                  <span v-show="extraSkillData.error === undefined">
                    Go to Extra Skill Dex
                  </span>
                  <span v-show="extraSkillData.error !== undefined">
                    [ERROR] {{ extraSkillData.error }}
                  </span>
                </span>
                <span v-else>
                  Loading data...
                </span>
            </router-link>
          </div>
        </div>
        <div class='column'>
          <div class='ui fluid raised card'>
            <div class='content'>
              <div class='header'>Brave Burst</div>
              <div class='description'>
                <div class='ui sub header'>Statistics</div>
                <div class='ui small feed'>
                  <statistics-item htmlContent="Number of Brave Bursts"></statistics-item>
                  <statistics-item htmlContent="Distribution of Unit and General Brave Bursts">
                  </statistics-item>
                  <statistics-item htmlContent="Server Distribution (shared and exclusive)">
                  </statistics-item>
                </div>
              </div>
            </div>
            <router-link
              to="/multidex/bursts"
              :class="{
                'ui button attached bottom': true,
                /* eslint-disable-next-line */
                disabled: !burstDataLoaded($store.state) || (burstDataLoaded($store.state) && burstData.error),
                red: burstDataLoaded($store.state) && burstData.error,
                green: burstDataLoaded($store.state) && !burstData.error
              }">
                <span v-if="burstDataLoaded($store.state)">
                  <span v-show="burstData.error === undefined">
                    Go to Burst Dex
                  </span>
                  <span v-show="burstData.error !== undefined">
                    [ERROR] {{ burstData.error }}
                  </span>
                </span>
                <span v-else>
                  Loading data...
                </span>
            </router-link>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import StatisticsItem from '@/components/MultidexComponents/StatisticsItem';
import { mapState } from 'vuex';
import { storeMethods } from '@/store';

/* global $ */
export default {
  components: {
    'statistics-item': StatisticsItem,
  },
  computed: {
    ...mapState([
      'unitData',
      'itemData',
      'burstData',
      'extraSkillData',
    ]),
  },
  methods: {
    ...storeMethods,
  },
  mounted() {
    this.$emit('updateheader');

    const backHeaderData = { content: 'Back', href: '/multidex' };

    $(this.$el).find('.ui.button.attached.bottom')
      .on('click', () => { this.$emit('updateheader', backHeaderData); });
  },
};
</script>
