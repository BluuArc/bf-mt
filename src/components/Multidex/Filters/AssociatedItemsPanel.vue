<script>
import GenericTernaryFilterPanel from '@/components/Multidex/Filters/GenericTernaryFilterPanel';
import { defaultTernaryOptions } from '@/modules/constants';

export default {
  extends: GenericTernaryFilterPanel,
  computed: {
    title: () => 'Associated Items',
    filterKey: () => 'associatedItems',
    labelMapping: () => ['All', 'With Associated Items', 'Without Associated Items'],
    ternary: () => defaultTernaryOptions,
  },
};
</script>

