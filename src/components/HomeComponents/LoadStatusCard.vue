<template>
  <div class="ui segments" id="load-status-card">
      <div class="ui purple inverted segment left aligned">Load Status</div>
      <div class="ui segment left aligned">
        <ul>
          <li>
            <b>Unit Data:</b>
            <span v-if="fullUnitData !== undefined">
              <span v-show="fullUnitData.error === undefined">
                Loaded
              </span>
              <span v-show="fullUnitData.error !== undefined">
                [ERROR] {{ fullUnitData.error }}
              </span>
            </span>
            <span v-else>
              Loading...
            </span>
          </li>
          <li>
            <b>Item Data:</b>
            <span v-if="fullItemData !== undefined">
              <span v-show="fullItemData.error === undefined">
                Loaded
              </span>
              <span v-show="fullItemData.error !== undefined">
                [ERROR] {{ fullItemData.error }}
              </span>
            </span>
            <span v-else>
              Loading...
            </span>
          </li>
          <li>
            <b>Extra Skill Data:</b>
            <span v-if="fullExtraSkillData !== undefined">
              <span v-show="fullExtraSkillData.error === undefined">
                Loaded
              </span>
              <span v-show="fullExtraSkillData.error !== undefined">
                [ERROR] {{ fullExtraSkillData.error }}
              </span>
            </span>
            <span v-else>
              Loading...
            </span>
          </li>
          <li>
            <b>Brave Burst Data:</b>
            <span v-if="fullBurstData !== undefined">
              <span v-show="fullBurstData.error === undefined">
                Loaded
              </span>
              <span v-show="fullBurstData.error !== undefined">
                [ERROR] {{ fullBurstData.error }}
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
export default {
  props: ['fullUnitData', 'fullItemData', 'fullExtraSkillData', 'fullBurstData'],
};
</script>
