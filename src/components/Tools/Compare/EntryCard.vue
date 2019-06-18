<template>
  <v-card>
    <component
      :is="entryCard"
      :entry="entry"
      :to="multidexLink"
    />
    <v-card-actions>
      <slot name="actions">
        <v-spacer/>
        <v-btn flat @click="$emit('remove')">
          <v-icon left>
            clear
          </v-icon>
          Remove
        </v-btn>
      </slot>
    </v-card-actions>
  </v-card>
</template>

<script>
import { COMPARE_KEY_MAPPING } from '@/modules/constants';
import { getEntryCardType } from '@/modules/core/compare';
import UnitEntryCard from '@/components/Multidex/Units/EntryCard';
import ItemEntryCard from '@/components/Multidex/Items/EntryCard';
import ExtraSkillEntryCard from '@/components/Multidex/ExtraSkills/EntryCard';
import LeaderSkillEntryCard from '@/components/Multidex/LeaderSkills/EntryCard';
import BurstEntryCard from '@/components/Multidex/Bursts/EntryCard';
import BaseEntryCard from '@/components/Multidex/BaseEntryCard';

export default {
  props: {
    entry: {
      type: Object,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    useMultidexLink: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    UnitEntryCard,
    ItemEntryCard,
    ExtraSkillEntryCard,
    LeaderSkillEntryCard,
    BurstEntryCard,
    BaseEntryCard,
  },
  computed: {
    entryCard () {
      return getEntryCardType(this.type);
    },
    multidexLink () {
      const multidexModule = (COMPARE_KEY_MAPPING[this.type] || {}).multidexKey;
      return multidexModule && this.useMultidexLink
        ? this.$store.getters[`${multidexModule}/getMultidexPathTo`](this.entry.id)
        : '';
    },
  },
};
</script>

<style>

</style>
