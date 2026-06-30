import { Page, PageScroll } from '@/components/page';
import { useUsersForm } from './useUsersForm';
import { UserForm } from './components/UserForm';
import { UsersTable } from './components/UsersTable';

export function UsersPage() {
  const {
    users,
    loading,
    error,
    domains,
    domainsError,
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
  } = useUsersForm();

  return (
    <Page>
      <UserForm
        form={form}
        aliases={aliases}
        domains={domains}
        domain={domain}
        email={email}
        editingEmail={editingEmail}
        busy={busy}
        domainsError={domainsError}
        onSubmit={submit}
        onCancel={cancelEdit}
      />

      <PageScroll>
        <UsersTable
          users={users}
          loading={loading}
          error={error}
          editingEmail={editingEmail}
          onEdit={edit}
          onRemove={remove}
        />
      </PageScroll>
    </Page>
  );
}
