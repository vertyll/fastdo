import { ProjectsListFiltersFormValue } from '../ui/project-list-filters.component';
import { GetAllProjectsSearchParams } from './project.api.service';

export function getAllProjectsSearchParams(
  formValue: ProjectsListFiltersFormValue,
): GetAllProjectsSearchParams {
  let searchParams: GetAllProjectsSearchParams = {
    q: formValue.q || '',
    sortBy:
      (formValue.sortBy as 'dateCreation' | 'name' | undefined) ||
      'dateCreation',
    orderBy: formValue.orderBy || 'desc',
    createdFrom: formValue.createdFrom,
    createdTo: formValue.createdTo,
    updatedFrom: formValue.updatedFrom,
    updatedTo: formValue.updatedTo,
  };

  return searchParams;
}
