import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import AdminPageShell from '../../../components/fitsphere/AdminPageShell';
import AppModal from '../../../components/fitsphere/AppModal';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import TableShell, { TABLE_CLASS, TD, TH, THEAD_ROW, tableRowNumber } from '../../../components/fitsphere/TableShell';
import ENDPOINTS from '../../../config/apiUrls';
import { deleteRequest, getRequest, patchRequest, postRequest, putRequest } from '../../../config/dataApi';

const emptyRole = { id: null, name: '', description: '', permissionIds: [] };
const emptyAdmin = {
  id: null,
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  roleId: '',
  status: 'ACTIVE',
};

const RolesPermissions = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleForm, setRoleForm] = useState(null);
  const [adminForm, setAdminForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10 });
  const limit = 10;

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(() => {
    setLoading(true);
    const params = { page, limit };
    if (debouncedSearch) params.search = debouncedSearch;
    getRequest(ENDPOINTS.ROLES.TEAM, { params })
      .then((res) => {
        setRoles(res.data?.roles || []);
        setPermissions(res.data?.permissions || []);
        setAdmins(res.data?.admins || []);
        setPagination(
          res.data?.pagination ||
            res.meta?.pagination || { total: res.data?.admins?.length || 0, page, limit }
        );
      })
      .finally(() => setLoading(false));
  }, [debouncedSearch, page]);

  useEffect(() => {
    load();
  }, [load]);

  const modules = useMemo(() => {
    const grouped = new Map();
    permissions.forEach((permission) => {
      const list = grouped.get(permission.module) || [];
      list.push(permission);
      grouped.set(permission.module, list);
    });
    return [...grouped.entries()];
  }, [permissions]);

  const togglePermission = (permissionId) => {
    setRoleForm((form) => {
      const has = form.permissionIds.includes(permissionId);
      return {
        ...form,
        permissionIds: has
          ? form.permissionIds.filter((id) => id !== permissionId)
          : [...form.permissionIds, permissionId],
      };
    });
  };

  const saveRole = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: roleForm.name,
        description: roleForm.description,
        permissionIds: roleForm.permissionIds,
      };
      if (roleForm.id) {
        await putRequest(ENDPOINTS.ROLES.ROLE(roleForm.id), payload);
        toast.success('Role updated');
      } else {
        await postRequest(ENDPOINTS.ROLES.TEAM, payload);
        toast.success('Role created');
      }
      setRoleForm(null);
      load();
    } catch {
      /* toast from api */
    } finally {
      setSaving(false);
    }
  };

  const removeRole = async (role) => {
    if (!window.confirm(`Delete the ${role.name} role?`)) return;
    try {
      await deleteRequest(ENDPOINTS.ROLES.ROLE(role.id));
      toast.success('Role deleted');
      load();
    } catch {
      /* toast from api */
    }
  };

  const saveAdmin = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (adminForm.id) {
        const payload = { roleId: adminForm.roleId, status: adminForm.status };
        if (adminForm.password) payload.password = adminForm.password;
        await patchRequest(ENDPOINTS.ROLES.ADMIN(adminForm.id), payload);
        toast.success('Sub-admin updated');
      } else {
        await postRequest(ENDPOINTS.ROLES.ADMINS, {
          firstName: adminForm.firstName,
          lastName: adminForm.lastName,
          email: adminForm.email,
          phone: adminForm.phone,
          password: adminForm.password,
          roleId: adminForm.roleId,
        });
        toast.success('Sub-admin created');
      }
      setAdminForm(null);
      load();
    } catch (err) {
      if (adminForm.id) toast.error(err.response?.data?.message || 'Could not save sub-admin');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPageShell showSearch={false}>
      {loading && roles.length === 0 && admins.length === 0 ? (
        <GlassCard className="p-6 text-secondary">Loading team…</GlassCard>
      ) : (
        <div className="space-y-4">
          <section>
            <h2 className="mb-3 font-display text-xl font-bold">Roles</h2>
            {roles.length === 0 ? (
              <GlassCard className="p-6 text-sm text-secondary">
                No platform roles yet. Create one, tick the screens it can open, then assign it to a sub-admin.
              </GlassCard>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {roles.map((role) => (
                  <GlassCard key={role.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{role.name}</p>
                        {role.description ? <p className="mt-1 text-sm text-secondary">{role.description}</p> : null}
                        <p className="mt-2 text-xs text-secondary">
                          {role.permissionIds.length} permissions · {role.userCount} sub-admins
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setRoleForm({
                              id: role.id,
                              name: role.name,
                              description: role.description || '',
                              permissionIds: role.permissionIds,
                            })
                          }
                          className="rounded p-2 text-secondary hover:bg-white/10"
                          title="Edit role"
                        >
                          <Icon name="edit" size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeRole(role)}
                          className="rounded p-2 text-secondary hover:bg-white/10"
                          title="Delete role"
                        >
                          <Icon name="delete" size={18} />
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </section>

          <TableShell
            title="Sub-admins"
            search={search}
            onSearch={setSearch}
            searchPlaceholder="Search sub-admins..."
            page={page}
            total={pagination.total || 0}
            limit={limit}
            loading={loading}
            onPage={setPage}
            noun="sub-admins"
            actions={
              <>
                <button
                  type="button"
                  onClick={() => setRoleForm({ ...emptyRole })}
                  className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold"
                >
                  New role
                </button>
                <button
                  type="button"
                  onClick={() => setAdminForm({ ...emptyAdmin, roleId: roles[0]?.id || '' })}
                  className="rounded-lg bg-primary-container px-3 py-2 text-xs font-bold text-on-primary-container"
                >
                  Add sub-admin
                </button>
              </>
            }
          >
            <table className={`${TABLE_CLASS} min-w-[760px]`}>
              <thead>
                <tr className={THEAD_ROW}>
                  <th className={`w-12 ${TH}`}>#</th>
                  <th className={TH}>Name</th>
                  <th className={TH}>Role</th>
                  <th className={TH}>Status</th>
                  <th className={`${TH} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading && admins.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={`${TD} py-10 text-center text-secondary`}>
                      Loading…
                    </td>
                  </tr>
                ) : admins.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={`${TD} py-10 text-center text-secondary`}>
                      No sub-admins yet.
                    </td>
                  </tr>
                ) : (
                  admins.map((admin, i) => (
                    <tr key={admin.id} className="hover:bg-white/[0.02]">
                      <td className={`${TD} text-xs font-semibold text-secondary tabular-nums`}>
                        {tableRowNumber(page, limit, i)}
                      </td>
                      <td className={TD}>
                        <p className="font-medium">
                          {admin.firstName} {admin.lastName}
                        </p>
                        <p className="text-xs text-secondary">{admin.email}</p>
                      </td>
                      <td className={TD}>{admin.roleName}</td>
                      <td className={`${TD} text-xs uppercase`}>{admin.status}</td>
                      <td className={`${TD} text-right`}>
                        <button
                          type="button"
                          onClick={() =>
                            setAdminForm({
                              id: admin.id,
                              firstName: admin.firstName,
                              lastName: admin.lastName,
                              email: admin.email,
                              phone: admin.phone || '',
                              password: '',
                              roleId: admin.roleId || '',
                              status: admin.status,
                            })
                          }
                          className="rounded-lg px-3 py-1.5 text-xs font-bold text-primary-container hover:bg-white/5"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </TableShell>
        </div>
      )}

      <AppModal open={Boolean(roleForm)} onClose={() => setRoleForm(null)} size="lg" scrollable>
        {roleForm ? (
          <form onSubmit={saveRole}>
            <h2 className="font-display text-xl font-bold">{roleForm.id ? 'Edit role' : 'New role'}</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary">Name</label>
                <input
                  required
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  className="input-cyber"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary">
                  Description
                </label>
                <input
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  className="input-cyber"
                />
              </div>
              <div className="space-y-4">
                {modules.map(([module, items]) => (
                  <div key={module}>
                    <p className="text-xs font-semibold uppercase tracking-widest text-secondary">{module}</p>
                    <div className="mt-2 space-y-2">
                      {items.map((permission) => (
                        <label key={permission.id} className="flex items-start gap-3 text-sm">
                          <input
                            type="checkbox"
                            checked={roleForm.permissionIds.includes(permission.id)}
                            onChange={() => togglePermission(permission.id)}
                            className="mt-1 h-4 w-4 accent-[#c3f400]"
                          />
                          <span>
                            {permission.name}
                            {permission.description ? (
                              <span className="block text-xs text-secondary">{permission.description}</span>
                            ) : null}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setRoleForm(null)} className="rounded-lg px-4 py-2 text-sm">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-primary-container px-4 py-2 text-sm font-bold text-on-primary-container disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save role'}
              </button>
            </div>
          </form>
        ) : null}
      </AppModal>

      <AppModal open={Boolean(adminForm)} onClose={() => setAdminForm(null)} size="md">
        {adminForm ? (
          <form onSubmit={saveAdmin}>
            <h2 className="font-display text-xl font-bold">{adminForm.id ? 'Edit sub-admin' : 'Add sub-admin'}</h2>
            <div className="mt-4 space-y-4">
              {!adminForm.id ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary">
                        First name
                      </label>
                      <input
                        required
                        value={adminForm.firstName}
                        onChange={(e) => setAdminForm({ ...adminForm, firstName: e.target.value })}
                        className="input-cyber"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary">
                        Last name
                      </label>
                      <input
                        required
                        value={adminForm.lastName}
                        onChange={(e) => setAdminForm({ ...adminForm, lastName: e.target.value })}
                        className="input-cyber"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary">Email</label>
                    <input
                      required
                      type="email"
                      value={adminForm.email}
                      onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                      className="input-cyber"
                    />
                  </div>
                </>
              ) : (
                <p className="text-sm text-secondary">{adminForm.email}</p>
              )}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary">Role</label>
                <select
                  required
                  value={adminForm.roleId}
                  onChange={(e) => setAdminForm({ ...adminForm, roleId: e.target.value })}
                  className="input-cyber"
                >
                  <option value="">Select a role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary">
                  {adminForm.id ? 'New password' : 'Password'}
                </label>
                <input
                  type="password"
                  required={!adminForm.id}
                  minLength={8}
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  placeholder={adminForm.id ? 'Leave blank to keep the current password' : ''}
                  className="input-cyber"
                />
              </div>
              {adminForm.id ? (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary">Status</label>
                  <select
                    value={adminForm.status}
                    onChange={(e) => setAdminForm({ ...adminForm, status: e.target.value })}
                    className="input-cyber"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
              ) : null}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setAdminForm(null)} className="rounded-lg px-4 py-2 text-sm">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || roles.length === 0}
                className="rounded-lg bg-primary-container px-4 py-2 text-sm font-bold text-on-primary-container disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        ) : null}
      </AppModal>
    </AdminPageShell>
  );
};

export default RolesPermissions;
