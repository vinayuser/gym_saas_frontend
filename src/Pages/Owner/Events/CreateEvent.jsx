import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

/** Legacy routes redirect to calendar page with modal open. */
const CreateEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/owner/events', {
      replace: true,
      state: eventId ? { editEventId: eventId } : { openCreate: true },
    });
  }, [eventId, navigate]);

  return null;
};

export default CreateEvent;
