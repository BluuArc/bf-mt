<script>
import GenericTernaryFilterPanel from '@/components/Multidex/Filters/GenericTernaryFilterPanel';
import { defaultTernaryOptions } from '@/modules/constants';

export default {
  extends: GenericTernaryFilterPanel,
  computed: {
    title: () => 'Gems',
    filterKey: () => 'gems',
    labelMapping: () => ['All', 'With Gems', 'Without Gems'],
    ternary: () => defaultTernaryOptions,
  },
};
</script>

