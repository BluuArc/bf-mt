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
            <router-link to="/multidex/units" class='ui button attached bottom'>
              Go to Unit Dex
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
            <router-link to="/multidex/items" class='ui button attached bottom'>
              Go to Item Dex
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
            <router-link to="/multidex/extraskills" class='ui button attached bottom'>
              Go to Extra Skill Dex
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
            <router-link to="/multidex/bursts" class='ui button attached bottom'>
              Go to Burst Dex
            </router-link>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import StatisticsItem from '@/components/MultidexComponents/StatisticsItem';

/* global $ */
export default {
  components: {
    'statistics-item': StatisticsItem,
  },
  mounted() {
    this.$emit('updateheader');

    const backHeaderData = { content: 'Back', href: '/multidex' };

    $(this.$el).find('.ui.button.attached.bottom')
      .on('click', () => { this.$emit('updateheader', backHeaderData); });
  },
};
</script>
