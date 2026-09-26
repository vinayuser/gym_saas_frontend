import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import AdminPageShell from '../../../components/fitsphere/AdminPageShell';
import AppModal from '../../../components/fitsphere/AppModal';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
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

  const load = () => {
    setLoading(true);
    getRequest(ENDPOINTS.ROLES.TEAM)
      .then((res) => {
        setRoles(res.data?.roles || []);
        setPermissions(res.data?.permissions || []);
        setAdmins(res.data?.admins || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

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
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-3xl font-bold">Roles & permissions</h1>
          <p className="mt-1 max-w-2xl text-secondary">
            Create sub-admins for this platform and give each role only the admin screens it should open.
            Gym staff access is separate and is not set here.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRoleForm({ ...emptyRole })}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold"
          >
            New role
          </button>
          <button
            type="button"
            onClick={() => setAdminForm({ ...emptyAdmin, roleId: roles[0]?.id || '' })}
            className="rounded-lg bg-primary-container px-4 py-2 text-sm font-bold text-on-primary-container"
          >
            Add sub-admin
          </button>
        </div>
      </div>

      {loading ? (
        <GlassCard className="p-6 text-secondary">Loading team…</GlassCard>
      ) : (
        <div className="space-y-8">
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

          <section>
            <h2 className="mb-3 font-display text-xl font-bold">Sub-admins</h2>
            <GlassCard className="overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-xs uppercase tracking-widest text-secondary/60">
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {admins.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-secondary">
                          No sub-admins yet.
                        </td>
                      </tr>
                    ) : (
                      admins.map((admin) => (
                        <tr key={admin.id}>
                          <td className="px-6 py-4">
                            <p className="font-medium">
                              {admin.firstName} {admin.lastName}
                            </p>
                            <p className="text-xs text-secondary">{admin.email}</p>
                          </td>
                          <td className="px-6 py-4">{admin.roleName}</td>
                          <td className="px-6 py-4 text-xs uppercase">{admin.status}</td>
                          <td className="px-6 py-4 text-right">
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
              </div>
            </GlassCard>
          </section>
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
