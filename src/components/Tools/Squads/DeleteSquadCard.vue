<template>
  <v-card>
    <v-card-title>
      <h1 class="title">Delete Confirmation</h1>
    </v-card-title>
    <v-container fluid>
      <v-flex>Are you sure you want to delete the following squad?</v-flex>
      <squad-list-card
        :squad="squad"
        :getUnit="getUnit"
        :getItem="getItem"
        :getExtraSkill="getExtraSkill">
        <div slot="card-actions"/>
      </squad-list-card>
    </v-container>
    <v-card-actions style="justify-content: space-between;">
      <v-btn :disabled="isDeleting" flat color="error" @click="deleteSquad">
        <v-icon left>delete</v-icon>
        Delete
      </v-btn>
      <v-btn flat @click="$emit('cancel')">
        Cancel
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import SquadListCard from '@/components/Tools/Squads/SquadListCard';
import GettersMixin from '@/components/Tools/Squads/SynchronousGettersMixin';

export default {
  mixins: [GettersMixin],
  props: {
    squad: {
      type: Object,
      required: true,
    },
    squadId: {
      type: Number,
      required: true,
    },
  },
  components: {
    SquadListCard,
  },
  data () {
    return {
      isDeleting: false,
    };
  },
  methods: {
    async deleteSquad () {
      this.isDeleting = true;
      try {
        const result = await this.$store.dispatch('squads/deleteSquad', { id: this.squadId });
        this.$emit('delete', result);
      } finally {
        this.isDeleting - false;
      }
    },
  },
};
</script>

