import { NavModule } from '../shared/types/config.type';

export const configNavModules: NavModule[] = [
  {
    id: 'dashboard',
    title: 'Navbar.dashboard',
    icon: 'heroSquares2x2',
    route: '/dashboard',
    sections: [
      {
        id: 'dashboard',
        title: 'Sidebar.dashboard',
        icon: 'heroSquares2x2',
        route: '/dashboard',
      },
    ],
  },
  {
    id: 'todo',
    title: 'Navbar.todo',
    icon: 'heroClipboardDocumentList',
    route: '/tasks',
    sections: [
      {
        id: 'tasks',
        title: 'Sidebar.tasks',
        icon: 'heroListBullet',
        route: '/tasks',
      },
      {
        id: 'urgent',
        title: 'Sidebar.urgentTasks',
        icon: 'heroExclamationCircle',
        route: '/tasks/urgent',
      },
      {
        id: 'projects',
        title: 'Sidebar.projects',
        icon: 'heroClipboardDocumentList',
        route: '/projects',
      },
    ],
  },
];
