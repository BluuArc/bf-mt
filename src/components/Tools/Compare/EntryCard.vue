<template>
  <v-card>
    <component
      :is="entryCard"
      :entry="entry"
      :to="multidexLink"
    />
    <v-card-actions>
      <v-spacer/>
      <v-btn flat>
        <v-icon left>
          clear
        </v-icon>
        Remove
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { COMPARE_KEY_MAPPING } from '@/modules/constants';
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
      switch(this.type) {
        case 'unit': return 'UnitEntryCard';
        case 'item': return 'ItemEntryCard';
        case 'es': return 'ExtraSkillEntryCard';
        case 'ls': return 'LeaderSkillEntryCard';
        case 'burst': return 'BurstEntryCard';
        default: return 'BaseEntryCard';
      }
    },
    multidexLink () {
      const multidexModule = (COMPARE_KEY_MAPPING[this.type] || {}).multidexKey;
      return multidexModule
        ? this.$store.getters[`${multidexModule}/getMultidexPathTo`](this.entry.id)
        : '';
    },
  },
};
</script>

<style>

</style>
