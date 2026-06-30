import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const DIRECTION_FILTERS = ['All', 'Inbound', 'Outbound'] as const;

/** Search + direction filters for mail history. */
export function MailHistoryFilters() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[14rem] flex-1">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
        <Input placeholder="Search sender, recipient or subject…" className="h-8 pl-8 text-xs" />
      </div>
      <div className="flex items-center gap-1">
        {DIRECTION_FILTERS.map((filter, index) => (
          <Button
            key={filter}
            variant={index === 0 ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 text-xs"
          >
            {filter}
          </Button>
        ))}
      </div>
    </div>
  );
}
