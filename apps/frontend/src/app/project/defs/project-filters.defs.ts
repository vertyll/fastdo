import { FilterTypeEnum } from '../../shared/enums/filter-type.enum';
import { FilterMetadata } from '../../shared/defs/filter.defs';
import { ProjectSortFieldEnum } from './project.defs';

export interface ProjectListFiltersConfig {
  searchTerm?: string;
  typeId?: string;
  onlyActive?: boolean;
  includePublic?: boolean;
  sortBy?: ProjectSortFieldEnum;
  sortDescending?: boolean;
  page?: number;
  pageSize?: number;
}

export const PROJECT_LIST_FILTERS: FilterMetadata[] = [
  {
    type: FilterTypeEnum.Text,
    formControlName: 'searchTerm',
    labelKey: 'Filters.search',
  },
  {
    type: FilterTypeEnum.Select,
    formControlName: 'typeId',
    labelKey: 'Filters.projectTypes',
    options: [],
  },
  {
    type: FilterTypeEnum.Select,
    formControlName: 'sortBy',
    labelKey: 'Filters.sortBy',
    defaultValue: ProjectSortFieldEnum.CREATED_AT,
    options: [
      { value: ProjectSortFieldEnum.CREATED_AT, label: 'Filters.sortByCreatedAt' },
      { value: ProjectSortFieldEnum.UPDATED_AT, label: 'Filters.sortByUpdatedAt' },
      { value: ProjectSortFieldEnum.NAME, label: 'Filters.sortByName' },
    ],
  },
  {
    type: FilterTypeEnum.Select,
    formControlName: 'sortDescending',
    labelKey: 'Filters.orderBy',
    defaultValue: true,
    options: [
      { value: true, label: 'Filters.orderByDesc' },
      { value: false, label: 'Filters.orderByAsc' },
    ],
  },
];
