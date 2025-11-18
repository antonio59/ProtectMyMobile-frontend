import { atom } from 'nanostores';

export const statsRefreshTrigger = atom(0);

export function triggerStatsRefresh() {
  statsRefreshTrigger.set(statsRefreshTrigger.get() + 1);
}
