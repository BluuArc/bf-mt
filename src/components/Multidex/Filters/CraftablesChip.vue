<script>
import GenericTernaryChip from '@/components/Multidex/Filters/GenericTernaryChip';
import { craftableFilterOptions } from '@/modules/constants';

export default {
  extends: GenericTernaryChip,
  computed: {
    truthyLabel: () => 'Craftables Only',
    falsyLabel: () => 'Non-Craftables Only',
    ternary: () => craftableFilterOptions,
    filterKey: () => 'craftables',
  },
};
</script>
