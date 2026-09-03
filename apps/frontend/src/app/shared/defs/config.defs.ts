import { RoleEnum } from '../enums/role.enum';

export interface NavModule {
  id: string;
  title: string;
  icon: string;
  route: string;
  sections: NavSection[];
  /** Roles allowed to see the module. Omit to show it to everyone signed in. */
  roles?: RoleEnum[];
}

export interface NavSection {
  id: string;
  title: string;
  icon: string;
  route: string;
}
