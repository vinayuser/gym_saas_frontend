import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import ENDPOINTS from '../../../config/apiUrls';
import { deleteRequest, getRequest, postRequest } from '../../../config/dataApi';
import GlassCard from '../../../components/fitsphere/GlassCard';
import OwnerPageShell from '../../../components/fitsphere/OwnerPageShell';
import SectionLoader from '../../../components/Loader/SectionLoader';
import { formatDate } from '../../../helpers/formatUtils';

const MemberCare = () => {
  const { memberId } = useParams();
  const { currentGym } = useSelector((s) => s.gym);
  const [member, setMember] = useState(null);
  const [care, setCare] = useState({ workouts: [], diets: [], measurements: [] });
  const [loading, setLoading] = useState(true);
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [dietTitle, setDietTitle] = useState('');
  const [dietNotes, setDietNotes] = useState('');
  const [weight, setWeight] = useState('');

  const load = () => {
    if (!currentGym?.id || !memberId) return;
    setLoading(true);
    Promise.all([
      getRequest(ENDPOINTS.MEMBERS.BY_ID(currentGym.id, memberId)),
      getRequest(ENDPOINTS.MEMBERS.CARE(currentGym.id, memberId)),
    ])
      .then(([mem, plans]) => {
        setMember(mem.data);
        setCare(plans.data || { workouts: [], diets: [], measurements: [] });
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [currentGym?.id, memberId]);

  const addWorkout = async (e) => {
    e.preventDefault();
    await postRequest(ENDPOINTS.MEMBERS.WORKOUTS(currentGym.id, memberId), {
      title: workoutTitle,
      description: workoutNotes,
      exercises: workoutNotes ? workoutNotes.split('\n').filter(Boolean) : [],
    });
    toast.success('Workout assigned');
    setWorkoutTitle('');
    setWorkoutNotes('');
    load();
  };

  const addDiet = async (e) => {
    e.preventDefault();
    await postRequest(ENDPOINTS.MEMBERS.DIETS(currentGym.id, memberId), {
      title: dietTitle,
      description: dietNotes,
    });
    toast.success('Diet assigned');
    setDietTitle('');
    setDietNotes('');
    load();
  };

  const addMeasurement = async (e) => {
    e.preventDefault();
    await postRequest(ENDPOINTS.MEMBERS.MEASUREMENTS(currentGym.id, memberId), { weight: Number(weight) });
    toast.success('Measurement saved');
    setWeight('');
    load();
  };

  return (
    <SectionLoader show={loading}>
      <OwnerPageShell showSearch={false}>
        <div className="space-y-6">
          <div>
            <Link to="/owner/members" className="text-xs text-secondary hover:text-primary-fixed">
              Members
            </Link>
            <h1 className="font-display text-3xl font-bold">
              {member ? `${member.firstName} ${member.lastName}` : 'Member plans'}
            </h1>
            <p className="text-sm text-secondary">Workout, diet, and measurements</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <GlassCard className="p-5">
              <h2 className="mb-3 font-semibold">Assign workout</h2>
              <form onSubmit={addWorkout} className="space-y-2">
                <input
                  required
                  value={workoutTitle}
                  onChange={(e) => setWorkoutTitle(e.target.value)}
                  placeholder="Plan title"
                  className="input-cyber w-full rounded-lg px-3 py-2"
                />
                <textarea
                  value={workoutNotes}
                  onChange={(e) => setWorkoutNotes(e.target.value)}
                  placeholder="One exercise per line"
                  rows={4}
                  className="input-cyber w-full rounded-lg px-3 py-2"
                />
                <button type="submit" className="rounded-lg bg-primary-fixed px-4 py-2 text-sm font-bold text-on-primary-fixed">
                  Save workout
                </button>
              </form>
              <div className="mt-4 space-y-2">
                {care.workouts.map((plan) => (
                  <div key={plan.id} className="flex items-start justify-between rounded-lg border border-white/10 p-3">
                    <div>
                      <p className="font-medium">{plan.title}</p>
                      <p className="text-xs text-secondary">{plan.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await deleteRequest(ENDPOINTS.MEMBERS.WORKOUT(currentGym.id, memberId, plan.id));
                        load();
                      }}
                      className="text-xs text-error"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <h2 className="mb-3 font-semibold">Assign diet</h2>
              <form onSubmit={addDiet} className="space-y-2">
                <input
                  required
                  value={dietTitle}
                  onChange={(e) => setDietTitle(e.target.value)}
                  placeholder="Diet title"
                  className="input-cyber w-full rounded-lg px-3 py-2"
                />
                <textarea
                  value={dietNotes}
                  onChange={(e) => setDietNotes(e.target.value)}
                  placeholder="Meals / notes"
                  rows={4}
                  className="input-cyber w-full rounded-lg px-3 py-2"
                />
                <button type="submit" className="rounded-lg bg-primary-fixed px-4 py-2 text-sm font-bold text-on-primary-fixed">
                  Save diet
                </button>
              </form>
              <div className="mt-4 space-y-2">
                {care.diets.map((plan) => (
                  <div key={plan.id} className="flex items-start justify-between rounded-lg border border-white/10 p-3">
                    <div>
                      <p className="font-medium">{plan.title}</p>
                      <p className="text-xs text-secondary">{plan.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await deleteRequest(ENDPOINTS.MEMBERS.DIET(currentGym.id, memberId, plan.id));
                        load();
                      }}
                      className="text-xs text-error"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          <GlassCard className="p-5">
            <h2 className="mb-3 font-semibold">Body measurements</h2>
            <form onSubmit={addMeasurement} className="mb-4 flex max-w-sm gap-2">
              <input
                required
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Weight kg"
                className="input-cyber flex-1 rounded-lg px-3 py-2"
              />
              <button type="submit" className="rounded-lg bg-primary-fixed px-4 text-sm font-bold text-on-primary-fixed">
                Log
              </button>
            </form>
            {care.measurements.map((row) => (
              <p key={row.id} className="text-sm text-secondary">
                {formatDate(row.measuredAt)} · {row.weight ?? '—'} kg
              </p>
            ))}
          </GlassCard>
        </div>
      </OwnerPageShell>
    </SectionLoader>
  );
};

export default MemberCare;
