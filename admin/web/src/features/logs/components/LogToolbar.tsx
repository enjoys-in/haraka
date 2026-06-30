import { Search, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { LogLevel } from '@/lib/types';

/** Filter / search / follow controls for the log viewer. */
export function LogToolbar({
  query,
  onQueryChange,
  level,
  onLevelChange,
  levels,
  follow,
  onFollowChange,
  onExport,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  level: 'all' | LogLevel;
  onLevelChange: (value: 'all' | LogLevel) => void;
  levels: LogLevel[];
  follow: boolean;
  onFollowChange: (value: boolean) => void;
  onExport: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[12rem] flex-1">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
        <Input
          placeholder="Filter logs…"
          className="h-8 pl-8 text-xs"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant={level === 'all' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-8 text-xs capitalize"
          onClick={() => onLevelChange('all')}
        >
          all
        </Button>
        {levels.map((entry) => (
          <Button
            key={entry}
            variant={level === entry ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 text-xs capitalize"
            onClick={() => onLevelChange(entry)}
          >
            {entry}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Switch id="log-follow" checked={follow} onCheckedChange={onFollowChange} />
        <Label htmlFor="log-follow" className="text-xs">
          Follow
        </Label>
      </div>

      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={onExport}>
        <Download className="h-3.5 w-3.5" />
        Export
      </Button>
    </div>
  );
}
