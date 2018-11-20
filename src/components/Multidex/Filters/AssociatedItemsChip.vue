<script>
import GenericTernaryChip from '@/components/Multidex/Filters/GenericTernaryChip';
import { defaultTernaryOptions } from '@/modules/constants';

export default {
  extends: GenericTernaryChip,
  computed: {
    truthyLabel: () => 'With Associated Items Only',
    falsyLabel: () => 'Without Associated Items Only',
    ternary: () => defaultTernaryOptions,
    filterKey: () => 'associatedItems',
  },
};
</script>
