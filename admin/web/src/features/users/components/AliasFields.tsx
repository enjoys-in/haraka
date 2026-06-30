import type { UseFieldArrayReturn, UseFormReturn } from 'react-hook-form';
import { Plus, X, AtSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isValidLocalPart, type UserFormValues } from '../user-form.utils';

interface AliasFieldsProps {
  form: UseFormReturn<UserFormValues>;
  aliases: UseFieldArrayReturn<UserFormValues, 'aliases'>;
  domain: string;
}

/**
 * Dynamic list of alias inputs backed by react-hook-form's useFieldArray. Each
 * row captures only the local part — the domain suffix is fixed to the user's
 * selected domain, so an alias can never be active on another domain.
 */
export function AliasFields({ form, aliases, domain }: AliasFieldsProps) {
  const {
    register,
    watch,
    trigger,
    formState: { errors },
  } = form;
  const { fields, append, remove } = aliases;
  const suffix = `@${domain || 'domain'}`;

  // Don't allow a new (empty) alias row until the last one is a valid name.
  const lastIndex = fields.length - 1;
  const lastLocal = watch(`aliases.${lastIndex}.local`) ?? '';
  const lastInvalid = fields.length > 0 && !isValidLocalPart(lastLocal);
  const canAdd = domain.length > 0 && !lastInvalid;

  const handleAdd = () => {
    if (lastInvalid) {
      void trigger(`aliases.${lastIndex}.local`);
      return;
    }
    append({ local: '' });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Aliases</Label>
        <Button type="button" variant="outline" size="sm" onClick={handleAdd} disabled={!canAdd}>
          <Plus className="h-3.5 w-3.5" />
          Add alias
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="rounded-md border border-dashed border-border/60 px-3 py-3 text-center text-xs text-muted-foreground">
          No aliases. Mail sent to an alias is forwarded to this account.
        </p>
      ) : (
        <ul className="space-y-2">
          {fields.map((field, index) => {
            const fieldError = errors.aliases?.[index]?.local;
            return (
              <li key={field.id} className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex w-full items-center rounded-md border border-input bg-transparent focus-within:ring-1 focus-within:ring-ring sm:w-72">
                    <AtSign className="ml-2.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <Input
                      className="border-0 px-2 shadow-none focus-visible:ring-0"
                      placeholder="alias"
                      aria-invalid={fieldError ? true : undefined}
                      {...register(`aliases.${index}.local` as const, {
                        validate: (value) =>
                          isValidLocalPart(value) || 'Enter a valid alias name',
                      })}
                    />
                    <span className="shrink-0 select-none pr-3 text-sm text-muted-foreground">
                      {suffix}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    title="Remove alias"
                  >
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                {fieldError && <p className="text-xs text-destructive">{fieldError.message}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
