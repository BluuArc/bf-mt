<template>
  <base-entry-card :to="to" style="height: 100%;">
    <v-container fluid class="pa-3">
      <v-layout row>
        <v-flex>
          <div class="d-flex-container items-center">
            <h1 class="subheading d-inline-block" style="word-break: break-word;">
              <b v-text="entryKey" title="key"/>
            </h1>
          </div>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex style="word-break: break-word;">
          <span title="value">{{ entry || '(Empty String)' }}</span>
        </v-flex>
      </v-layout>
    </v-container>
  </base-entry-card>
</template>

<script>
import EntryCardMixin from '@/components/Multidex/BaseEntryCardMixin';

export default {
  mixins: [EntryCardMixin],
  props: {
    entryKey: {
      required: true,
    },
  },
};
</script>
