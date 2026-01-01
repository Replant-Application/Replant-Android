import { useMemo } from 'react';
import { Mission } from '../types';

export type MissionFilter = 'all' | 'daily' | 'completed';

export const useMissionFilters = (missions: Mission[], selectedFilter: MissionFilter) => {
  const today = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const filteredMissions = useMemo(() => {
    switch (selectedFilter) {
      case 'daily':
        return missions.filter(mission => {
          if (mission.completed && mission.completed_at) {
            const completedDate = mission.completed_at.split('T')[0];
            return completedDate === today;
          }
          return false;
        });
      case 'completed':
        return missions.filter(mission => mission.completed);
      case 'all':
      default:
        return missions;
    }
  }, [missions, selectedFilter, today]);

  const completedMissions = useMemo(() =>
    missions.filter(mission => mission.completed).length,
    [missions]
  );

  const totalMissions = missions.length;
  const progressPercentage = totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0;

  return {
    filteredMissions,
    completedMissions,
    totalMissions,
    progressPercentage,
  };
};
