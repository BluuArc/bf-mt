<script>
import GenericTernaryChip from '@/components/Multidex/Filters/GenericTernaryChip';
import { defaultTernaryOptions } from '@/modules/constants';

export default {
  extends: GenericTernaryChip,
  computed: {
    truthyLabel: () => 'With Associated Units Only',
    falsyLabel: () => 'Without Associated Units Only',
    ternary: () => defaultTernaryOptions,
    filterKey: () => 'associatedUnits',
  },
};
</script>
