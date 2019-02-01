<template>
  <v-container fluid>
    <v-layout row wrap>
      <v-flex>
        <v-card class="pa-2">
          <v-layout row>
            <v-flex>
              <h1 class="title">
                {{ sampleSquad.name }}
              </h1>
            </v-flex>
            <v-spacer/>
            <v-flex style="flex-grow: 0;">
              <h2 class="subheading">
                Squad cost
              </h2>
            </v-flex>
          </v-layout>
          <v-layout row wrap>
            <v-flex
              v-for="(unit, i) in sampleSquad.units"
              :key="[JSON.stringify(unit), i].join('-')"
              xs12 md6>
              {{ unit }}
            </v-flex>
          </v-layout>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  computed: {
    sampleSquad: () => ({
      id: Math.random().toString().split('.')[1],
      name: 'Example Squad',
      units: (new Array(6))
        .fill(0)
        .map((_, i) => ({
          id: '10017',
          es: null,
          spheres: [],
          sp: [],
          bbOrder: i,
          bbType: ['bb', 'sbb', 'ubb'][Math.floor(Math.random() * 3)],
        })),
    }),
  },
};
</script>
