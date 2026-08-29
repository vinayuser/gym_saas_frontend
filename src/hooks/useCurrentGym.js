import { useSelector } from 'react-redux';

export const useCurrentGym = () => {
  const { currentGym, gyms } = useSelector((state) => state.gym);
  return { currentGym, gyms, gymId: currentGym?.id };
};

export default useCurrentGym;
