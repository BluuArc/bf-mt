<template>
  <table class="ui striped compact unstackable table">
    <thead>
      <tr>
        <th class="center aligned">Hit #</th>
        <th class="center aligned">Frame #</th>
        <th class="center aligned">DMG%/hit</th>
        <th class="center aligned">Time Diff</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(frame, frameIndex) in attack['frame times']"
        :key="frameIndex">
        <td class="center aligned">
          {{ frameIndex + 1 }}
        </td>
        <td class="center aligned">
          {{ frame }}
        </td>
        <td class="center aligned">
          {{ attack['hit dmg% distribution'][frameIndex] }}
        </td>
        <td class="center aligned" v-if="frameIndex === 0">0</td>
        <td class="center aligned" v-else>
          {{ frame - attack['frame times'][frameIndex - 1] }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  props: ['attack'],
};
</script>
