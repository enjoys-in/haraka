import { useState } from 'react';
import { Controller } from 'react-hook-form';
import type { UseFieldArrayReturn, UseFormReturn } from 'react-hook-form';
import { UserPlus, Save, Eye, EyeOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AliasFields } from './AliasFields';
import type { UserFormValues } from '../user-form.utils';

interface UserFormProps {
  form: UseFormReturn<UserFormValues>;
  aliases: UseFieldArrayReturn<UserFormValues, 'aliases'>;
  domains: string[];
  domain: string;
  email: string;
  editingEmail: string;
  busy: boolean;
  domainsError: string | null;
  onSubmit: () => void;
  onCancel: () => void;
}

export function UserForm({
  form,
  aliases,
  domains,
  domain,
  email,
  editingEmail,
  busy,
  domainsError,
  onSubmit,
  onCancel,
}: UserFormProps) {
  const { register, control } = form;
  const [showPassword, setShowPassword] = useState(false);
  const hasDomains = domains.length > 0;
  const isEditing = Boolean(editingEmail);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? `Edit ${editingEmail}` : 'SMTP users'}</CardTitle>
        <CardDescription>
          AUTH accounts in <code>config/auth_flat_file.ini</code>. Passwords are stored as
          plaintext (flat_file compares plaintext) — always require TLS in production.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="user-local">Username</Label>
              <div className="grid gap-2 sm:grid-cols-[1fr_1.2fr]">
                <Input
                  id="user-local"
                  placeholder="user"
                  autoComplete="off"
                  {...register('localPart')}
                />
                <Controller
                  control={control}
                  name="domain"
                  render={({ field }) => (
                    <Combobox
                      value={field.value}
                      onChange={field.onChange}
                      options={domains.map((d) => ({ value: d, label: d }))}
                      placeholder={hasDomains ? 'Select domain' : 'No domains configured'}
                      searchPlaceholder="Search domains..."
                      emptyText="No matching domains"
                      disabled={!hasDomains}
                    />
                  )}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Email: <span className="font-mono text-foreground">{email || 'user@example.com'}</span>
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="user-password">Password</Label>
              <div className="relative">
                <Input
                  id="user-password"
                  type={showPassword ? 'text' : 'password'}
                  className="pr-9"
                  autoComplete="new-password"
                  placeholder={isEditing ? 'New password (leave blank to keep)' : 'Password'}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Stored verbatim — use a strong password and enforce TLS.
              </p>
            </div>
          </div>

          <div className="border-t border-border/40 pt-4">
            <AliasFields form={form} aliases={aliases} domain={domain} />
          </div>

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={busy || !hasDomains}>
              {isEditing ? <Save className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
              {isEditing ? 'Update user' : 'Add user'}
            </Button>
            {isEditing && (
              <Button type="button" variant="ghost" onClick={onCancel}>
                <X className="h-4 w-4" />
                Cancel
              </Button>
            )}
          </div>

          {domainsError && (
            <p className="text-xs text-destructive">Failed to load domains: {domainsError}</p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
