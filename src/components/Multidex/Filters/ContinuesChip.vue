<script>
import GenericTernaryChip from '@/components/Multidex/Filters/GenericTernaryChip';
import { defaultTernaryOptions } from '@/modules/constants';

export default {
  extends: GenericTernaryChip,
  computed: {
    truthyLabel: () => 'With Continues Only',
    falsyLabel: () => 'Without Continues Only',
    ternary: () => defaultTernaryOptions,
    filterKey: () => 'continues',
  },
};
</script>
