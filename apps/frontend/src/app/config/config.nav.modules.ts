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
    id: 'projects',
    title: 'Navbar.projects',
    icon: 'heroClipboardDocumentList',
    route: '/projects',
    sections: [
      {
        id: 'projects',
        title: 'Sidebar.projects',
        icon: 'heroClipboardDocumentList',
        route: '/projects',
      },
    ],
  },
];
