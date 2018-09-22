<script>
import GenericTernaryFilterPanel from '@/components/Multidex/Filters/GenericTernaryFilterPanel';
import { defaultTernaryOptions } from '@/modules/constants';

export default {
  extends: GenericTernaryFilterPanel,
  computed: {
    title: () => 'Associated Units',
    filterKey: () => 'associatedUnits',
    labelMapping: () => ['All', 'With Associated Units', 'Without Associated Units'],
    ternary: () => defaultTernaryOptions,
  },
};
</script>

