<script>
import GenericTernaryFilterPanel from '@/components/Multidex/Filters/GenericTernaryFilterPanel';
import { craftableFilterOptions } from '@/modules/constants';

export default {
  extends: GenericTernaryFilterPanel,
  computed: {
    title: () => 'Craftables',
    filterKey: () => 'craftables',
    labelMapping: () => ['All', 'Craftables Only', 'Non-Craftables Only'],
    ternary: () => craftableFilterOptions,
  },
};
</script>

