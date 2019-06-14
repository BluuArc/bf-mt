<template>
  <v-stepper vertical v-model="currentStep" class="add-compare-entry-area">
    <v-stepper-step
      step="1"
      editable
      :complete="validTypeSelected"
    >
      Select Entry Type
    </v-stepper-step>
    <v-stepper-content step="1">
      <section class="entry-type-selector-area">
        <v-btn
          v-for="pairing in allTypePairings"
          :key="pairing.value"
          outline
          @click="selectType(pairing.value)"
        >
          {{ pairing.name }}
        </v-btn>
        <div style="width: 100%; display: flex; justify-content: flex-end;">
          <v-btn
            flat
            style="flex: none;"
            @click="$emit('cancel')"
          >
            Cancel
          </v-btn>
        </div>
      </section>
    </v-stepper-content>

    <v-stepper-step step="2">
      Select {{ selectedTypeName || 'Entry' }}
    </v-stepper-step>

    <v-stepper-content step="2">
      <template v-if="activeSelectorComponent">
        <component
          :is="activeSelectorComponent"
          @input="onEntrySelect"
          @cancel="$emit('cancel')"
        />
      </template>
      <span v-else>
        Selector of type [{{ selectedTypeName || selectedType }}] is not supported.
      </span>
    </v-stepper-content>
  </v-stepper>
</template>

<script>
import { COMPARE_KEY_ORDER, COMPARE_KEY_MAPPING } from '@/modules/constants';
import UnitSelector from '@/components/Tools/Squads/MultidexSelectors/UnitSelector';
import ExtraSkillSelector from '@/components/Tools/Squads/MultidexSelectors/ExtraSkillSelector';
import SphereSelector from '@/components/Tools/Squads/MultidexSelectors/SphereSelector';
import BurstSelector from '@/components/Tools/Squads/MultidexSelectors/BurstSelector';
import LeaderSkillSelector from '@/components/Tools/Squads/MultidexSelectors/LeaderSkillSelector';

export default {
  props: {
    type: {
      type: String,
      default: '',
    },
    step: {
      type: Number,
      default: 1,
    },
  },
  components: {
    UnitSelector,
    ExtraSkillSelector,
    SphereSelector,
    BurstSelector,
    LeaderSkillSelector,
  },
  computed: {
    validTypeSelected () {
      return COMPARE_KEY_ORDER.includes(this.selectedType);
    },
    allTypePairings () {
      return COMPARE_KEY_ORDER.map(value => ({ value, name: COMPARE_KEY_MAPPING[value].name }));
    },
    selectedTypeName () {
      return (COMPARE_KEY_MAPPING[this.selectedType] || '').name;
    },
    activeSelectorComponent () {
      switch (this.selectedTypeName) {
        case COMPARE_KEY_MAPPING.unit.name: return 'UnitSelector';
        case COMPARE_KEY_MAPPING.item.name: return 'SphereSelector';
        case COMPARE_KEY_MAPPING.es.name: return 'ExtraSkillSelector';
        case COMPARE_KEY_MAPPING.bb.name: return 'BurstSelector';
        case COMPARE_KEY_MAPPING.ls.name: return 'LeaderSkillSelector';
        default: return '';
      }
    },
  },
  data () {
    return {
      selectedType: '',
      currentStep: 1,
    };
  },
  methods: {
    selectType (value) {
      this.selectedType = value;
      this.currentStep = 2;
    },
    onEntrySelect (selection) {
      this.$emit('input', { id: selection.id, type: this.selectedType });
    },
  },
  watch: {
    type: {
      immediate: true,
      handler (newType) {
        this.selectedType = newType || '';
      },
    },
    step: {
      immediate: true,
      handler (newValue) {
        this.currentStep = Math.max(1, +newValue);
      },
    },
    currentStep (newValue) {
      if (+newValue !== +this.step) {
        this.$emit('step', +newValue);
      }
    },
  },
};
</script>

<style lang="less">
.add-compare-entry-area {
  .entry-type-selector-area {
    display: flex;
    flex-wrap: wrap;
    button {
      flex: auto;
    }
  }
}
</style>
