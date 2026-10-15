export type IconName = 'layout-dashboard' | 'shopping-bag' | 'calendar-days' | 'clipboard-list' | 'door-open' | 'calendar-plus' | 'sparkles' | 'users-round' | 'contact-round' | 'map-pinned' | 'user-round' | 'wallet' | 'users';

export const ICON_PATHS: Record<IconName, readonly string[]> = {
  'layout-dashboard': ['M3 3h7v9H3z', 'M14 3h7v5h-7z', 'M14 12h7v9h-7z', 'M3 16h7v5H3z'],
  'shopping-bag': ['M6 7V6a6 6 0 0 1 12 0v1', 'M4 7h16l1 14H3L4 7Z', 'M9 11v2a3 3 0 0 0 6 0v-2'],
  'calendar-days': ['M8 2v4', 'M16 2v4', 'M3 10h18', 'M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z', 'M8 14h.01', 'M12 14h.01', 'M16 14h.01', 'M8 18h.01', 'M12 18h.01'],
  'clipboard-list': ['M9 5h6', 'M9 3h6v4H9z', 'M7 5H5v16h14V5h-2', 'M9 12h6', 'M9 16h6'],
  'door-open': ['M13 4l7-2v20l-7-2', 'M13 4v16', 'M3 12h11', 'm10 9 4 3-4 3', 'M17 12h.01'],
  'calendar-plus': ['M8 2v4', 'M16 2v4', 'M3 10h18', 'M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z', 'M12 14v6', 'M9 17h6'],
  sparkles: ['m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z', 'm19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z', 'm5 2 .8 2.2L8 5l-2.2.8L5 8l-.8-2.2L2 5l2.2-.8L5 2Z'],
  'users-round': ['M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M20 8v6', 'M23 11h-6'],
  'contact-round': ['M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M16 3.1a4 4 0 0 1 0 7.8', 'M20 21v-2a4 4 0 0 0-3-3.9'],
  'map-pinned': ['M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z', 'M12 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z', 'M4 14l-2 1v6l6-3 8 3 6-3v-2'],
  'user-round': ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z'],
  wallet: ['M3 6.5A2.5 2.5 0 0 1 5.5 4H21v16H5a2 2 0 0 1-2-2V6.5Z', 'M3 7h18', 'M16 14h.01'],
  users: ['M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M20 21v-2a4 4 0 0 0-3-3.9', 'M16 3.1a4 4 0 0 1 0 7.8'],
};
