<script>
import GenericTernaryFilterPanel from '@/components/Multidex/Filters/GenericTernaryFilterPanel';
import { usageFilterOptions } from '@/modules/constants';

export default {
  extends: GenericTernaryFilterPanel,
  computed: {
    title: () => 'Usage',
    filterKey: () => 'usage',
    labelMapping: () => ['All', 'Used in Other Items Only', 'Not Used in Other Items'],
    ternary: () => usageFilterOptions,
  },
};
</script>

