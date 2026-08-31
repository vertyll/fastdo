import { PaginationParams, ProjectListFiltersConfig } from '../../shared/defs/filter.defs';
import { GetAllProjectsSearchParams, ProjectSortFieldEnum } from '../defs/project.defs';

export function getAllProjectsSearchParams(
  params: Partial<ProjectListFiltersConfig & PaginationParams>,
): GetAllProjectsSearchParams {
  return {
    ...(params.searchTerm ? { searchTerm: params.searchTerm } : {}),
    ...(params.typeId ? { typeId: params.typeId } : {}),
    onlyActive: params.onlyActive ?? true,
    includePublic: params.includePublic ?? true,
    sortBy: params.sortBy ?? ProjectSortFieldEnum.CREATED_AT,
    sortDescending: params.sortDescending ?? true,
    page: params.page ?? 0,
    size: params.pageSize ?? 10,
  };
}
