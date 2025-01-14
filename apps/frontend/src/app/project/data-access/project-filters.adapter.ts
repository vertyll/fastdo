import { ProjectListFiltersConfig } from 'src/app/shared/types/filter.type';
import { GetAllProjectsSearchParams } from './project.api.service';

export function getAllProjectsSearchParams(
  formValue: ProjectListFiltersConfig,
): GetAllProjectsSearchParams {
  return {
    q: formValue.q || '',
    sortBy: (formValue.sortBy as 'dateCreation' | 'name' | undefined)
      || 'dateCreation',
    orderBy: formValue.orderBy || 'desc',
    createdFrom: formValue.createdFrom,
    createdTo: formValue.createdTo,
    updatedFrom: formValue.updatedFrom,
    updatedTo: formValue.updatedTo,
  };
}
