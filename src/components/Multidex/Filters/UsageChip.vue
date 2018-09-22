<script>
import GenericTernaryChip from '@/components/Multidex/Filters/GenericTernaryChip';
import { usageFilterOptions } from '@/modules/constants';

export default {
  extends: GenericTernaryChip,
  computed: {
    truthyLabel: () => 'Used Items Only',
    falsyLabel: () => 'Unused Items Only',
    ternary: () => usageFilterOptions,
    filterKey: () => 'usage',
  },
};
</script>
