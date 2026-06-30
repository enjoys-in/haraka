import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { MailDirection } from '@/lib/types';

type DirectionFilter = 'all' | MailDirection;

const DIRECTION_FILTERS: { label: string; value: DirectionFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Inbound', value: 'inbound' },
  { label: 'Outbound', value: 'outbound' },
];

interface MailHistoryFiltersProps {
  query: string;
  direction: DirectionFilter;
  onQueryChange: (value: string) => void;
  onDirectionChange: (value: DirectionFilter) => void;
}

/** Search + direction filters for mail history. */
export function MailHistoryFilters({
  query,
  direction,
  onQueryChange,
  onDirectionChange,
}: MailHistoryFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[14rem] flex-1">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search sender, recipient or subject…"
          className="h-8 pl-8 text-xs"
        />
      </div>
      <div className="flex items-center gap-1">
        {DIRECTION_FILTERS.map((filter) => (
          <Button
            key={filter.value}
            variant={direction === filter.value ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 text-xs"
            onClick={() => onDirectionChange(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
