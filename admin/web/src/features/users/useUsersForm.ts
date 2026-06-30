import { useCallback, useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAsyncData } from '@/lib/use-async';
import type { AuthUser } from '@/lib/types';
import {
  combineAliases,
  emptyForm,
  formFromUser,
  makeEmail,
  type UserFormValues,
} from './user-form.utils';

/**
 * Owns every piece of Users-page logic — list loading, the react-hook-form
 * instance, the alias field array, and the create/update/delete actions — so
 * the page and its child components stay purely declarative.
 */
export function useUsersForm() {
  const { data, loading, error, setData } = useAsyncData(api.users.list);
  const domainsState = useAsyncData(api.domains.list);
  const domains = domainsState.data?.domains ?? [];

  const [editingEmail, setEditingEmail] = useState('');
  const [busy, setBusy] = useState(false);

  const form = useForm<UserFormValues>({ defaultValues: emptyForm(), mode: 'onTouched' });
  const aliases = useFieldArray({ control: form.control, name: 'aliases' });

  const domain = form.watch('domain');
  const localPart = form.watch('localPart');
  const email = makeEmail(localPart, domain);

  // Seed the domain once the domain list arrives (and nothing is selected yet).
  useEffect(() => {
    if (!form.getValues('domain') && domains.length > 0) {
      form.setValue('domain', domains[0]);
    }
  }, [domains, form]);

  const submit = form.handleSubmit(async (values) => {
    const target = makeEmail(values.localPart, values.domain);
    if (!target) {
      toast.error('Local part and domain are required');
      return;
    }
    if (!editingEmail && !values.password) {
      toast.error('Password is required for new users');
      return;
    }

    const aliasEmails = combineAliases(values.aliases, values.domain, target);
    setBusy(true);
    try {
      const res = editingEmail
        ? await api.users.update(editingEmail, target, values.password || undefined, aliasEmails)
        : await api.users.create(target, values.password, aliasEmails);
      setData(res);
      form.reset(emptyForm(domains[0] ?? ''));
      setEditingEmail('');
      toast.success(editingEmail ? 'User updated' : 'User created');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save user');
    } finally {
      setBusy(false);
    }
  });

  const edit = useCallback(
    (user: AuthUser) => {
      setEditingEmail(user.email);
      form.reset(formFromUser(user));
    },
    [form],
  );

  const cancelEdit = useCallback(() => {
    setEditingEmail('');
    form.reset(emptyForm(domains[0] ?? ''));
  }, [domains, form]);

  const remove = useCallback(
    async (target: string) => {
      try {
        setData(await api.users.remove(target));
        toast.success(`Removed ${target}`);
        if (editingEmail === target) {
          setEditingEmail('');
          form.reset(emptyForm(domains[0] ?? ''));
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to remove user');
      }
    },
    [domains, editingEmail, form, setData],
  );

  return {
    users: data?.users ?? [],
    loading,
    error,
    domains,
    domainsError: domainsState.error,
    form,
    aliases,
    domain,
    email,
    editingEmail,
    busy,
    submit,
    edit,
    cancelEdit,
    remove,
  };
}

export type UsersFormApi = ReturnType<typeof useUsersForm>;
