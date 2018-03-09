<template>
  <div class="ui segments" id="load-status-card">
      <div class="ui purple inverted segment left aligned">Load Status</div>
      <div class="ui segment left aligned">
        <ul>
          <li>
            <b>Unit Data:</b>
            <span v-if="unitDataLoaded($store.state)">
              <span v-show="unitData.error === undefined">
                Loaded
              </span>
              <span v-show="unitData.error !== undefined">
                [ERROR] {{ unitData.error }}
              </span>
            </span>
            <span v-else>
              Loading...
            </span>
          </li>
          <li>
            <b>Item Data:</b>
            <span v-if="itemDataLoaded($store.state)">
              <span v-show="itemData.error === undefined">
                Loaded
              </span>
              <span v-show="itemData.error !== undefined">
                [ERROR] {{ itemData.error }}
              </span>
            </span>
            <span v-else>
              Loading...
            </span>
          </li>
          <li>
            <b>Extra Skill Data:</b>
            <span v-if="extraSkillDataLoaded($store.state)">
              <span v-show="extraSkillData.error === undefined">
                Loaded
              </span>
              <span v-show="extraSkillData.error !== undefined">
                [ERROR] {{ extraSkillData.error }}
              </span>
            </span>
            <span v-else>
              Loading...
            </span>
          </li>
          <li>
            <b>Brave Burst Data:</b>
            <span v-if="burstDataLoaded($store.state)">
              <span v-show="burstData.error === undefined">
                Loaded
              </span>
              <span v-show="burstData.error !== undefined">
                [ERROR] {{ burstData.error }}
              </span>
            </span>
            <span v-else>
              Loading...
            </span>
          </li>
        </ul>
      </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import { storeMethods } from '@/store';

export default {
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
};
</script>
