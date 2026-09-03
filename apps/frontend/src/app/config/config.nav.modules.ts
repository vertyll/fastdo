import { NavModule } from '../shared/defs/config.defs';
import { RoleEnum } from '../shared/enums/role.enum';

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
  {
    id: 'admin',
    title: 'Navbar.admin',
    icon: 'heroCog6Tooth',
    route: '/admin/translations',
    roles: [RoleEnum.Admin],
    sections: [
      {
        id: 'translations',
        title: 'Sidebar.translations',
        icon: 'heroLanguage',
        route: '/admin/translations',
      },
    ],
  },
];
