import Icon from './Icon';
import AppModal from './AppModal';

const MemberFormModal = ({ open, onClose, form, setForm, onSubmit, editing, loading }) => (
  <AppModal open={open} onClose={onClose} size="lg">
    <div className="mb-6 flex items-center justify-between">
      <h2 className="font-display text-xl font-semibold">
        {editing ? 'Edit Member' : 'Add Member'}
      </h2>
      <button type="button" onClick={onClose} className="text-secondary hover:text-on-surface">
        <Icon name="close" size={24} />
      </button>
    </div>
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          required
          placeholder="First Name"
          value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          className="fitsphere-input"
        />
        <input
          required
          placeholder="Last Name"
          value={form.lastName}
          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          className="fitsphere-input"
        />
      </div>
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="fitsphere-input"
      />
      <input
        placeholder="Phone"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        className="fitsphere-input"
      />
      <select
        value={form.gender}
        onChange={(e) => setForm({ ...form, gender: e.target.value })}
        className="fitsphere-input"
      >
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select>
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm font-medium hover:bg-white/5"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="neon-glow flex-1 rounded-lg bg-primary-fixed py-2.5 text-sm font-bold text-on-primary-fixed disabled:opacity-50"
        >
          {loading ? 'Saving...' : editing ? 'Update Member' : 'Save Member'}
        </button>
      </div>
    </form>
  </AppModal>
);

export default MemberFormModal;
