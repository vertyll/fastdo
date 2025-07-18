import { PaginationParams, ProjectListFiltersConfig } from 'src/app/shared/types/filter.type';
import { GetAllProjectsSearchParams } from '../../shared/types/project.type';

export function getAllProjectsSearchParams(
  params: Partial<ProjectListFiltersConfig & PaginationParams>,
): GetAllProjectsSearchParams {
  return {
    q: params.q || '',
    sortBy: params.sortBy || 'dateCreation',
    orderBy: params.orderBy || 'desc',
    typeIds: params.typeIds || [],
    createdFrom: params.createdFrom || '',
    createdTo: params.createdTo || '',
    updatedFrom: params.updatedFrom || '',
    updatedTo: params.updatedTo || '',
    page: params.page || 0,
    pageSize: params.pageSize || 10,
  };
}
