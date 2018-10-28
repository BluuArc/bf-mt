<script>
import GenericTernaryFilterPanel from '@/components/Multidex/Filters/GenericTernaryFilterPanel';
import { defaultTernaryOptions } from '@/modules/constants';

export default {
  extends: GenericTernaryFilterPanel,
  computed: {
    title: () => 'Continues',
    filterKey: () => 'continues',
    labelMapping: () => ['All', 'Quest Continues Allowed', 'No Quest Continues'],
    ternary: () => defaultTernaryOptions,
  },
};
</script>

