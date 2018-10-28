<script>
import GenericTernaryChip from '@/components/Multidex/Filters/GenericTernaryChip';
import { defaultTernaryOptions } from '@/modules/constants';

export default {
  extends: GenericTernaryChip,
  computed: {
    truthyLabel: () => 'With Gems Only',
    falsyLabel: () => 'Without Gems Only',
    ternary: () => defaultTernaryOptions,
    filterKey: () => 'gems',
  },
};
</script>
