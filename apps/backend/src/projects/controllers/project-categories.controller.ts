import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBody, ApiHeader, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '../../common/decorators/api-wrapped-response.decorator';
import { LanguageCodeEnum } from '../../core/language/enums/language-code.enum';
import { CreateProjectCategoryDto } from '../dtos/create-project-category.dto';
import { ProjectCategoryResponseDto } from '../dtos/project-category-response.dto';
import { UpdateProjectCategoryDto } from '../dtos/update-project-category.dto';
import { ProjectCategory } from '../entities/project-category.entity';
import { ProjectCategoriesService } from '../services/project-categories.service';

@ApiTags('project-categories')
@Controller('projects/:projectId/categories')
export class ProjectCategoriesController {
  constructor(
    private readonly projectCategoryService: ProjectCategoriesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories for a project' })
  @ApiParam({ name: 'projectId', type: 'number' })
  @ApiHeader({ name: 'x-lang', enum: LanguageCodeEnum, required: false })
  @ApiWrappedResponse({
    status: 200,
    description: 'Return all categories for the project with translated names.',
    type: ProjectCategoryResponseDto,
    isArray: true,
  })
  public async getProjectCategories(
    @Param('projectId') projectId: string,
  ): Promise<ProjectCategoryResponseDto[]> {
    return this.projectCategoryService.findByProjectId(+projectId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new category for a project' })
  @ApiParam({ name: 'projectId', type: 'number' })
  @ApiBody({ type: CreateProjectCategoryDto })
  @ApiWrappedResponse({
    status: 201,
    description: 'The category has been successfully created.',
    type: ProjectCategory,
  })
  public async createCategory(
    @Param('projectId') projectId: string,
    @Body() createCategoryDto: CreateProjectCategoryDto,
  ): Promise<ProjectCategory> {
    createCategoryDto.projectId = +projectId;
    return this.projectCategoryService.create(createCategoryDto);
  }

  @Put(':categoryId')
  @ApiOperation({ summary: 'Update a category' })
  @ApiParam({ name: 'projectId', type: 'number' })
  @ApiParam({ name: 'categoryId', type: 'number' })
  @ApiBody({ type: UpdateProjectCategoryDto })
  @ApiWrappedResponse({
    status: 200,
    description: 'The category has been successfully updated.',
    type: ProjectCategory,
  })
  public async updateCategory(
    @Param('categoryId') categoryId: string,
    @Body() updateCategoryDto: UpdateProjectCategoryDto,
  ): Promise<ProjectCategory> {
    return this.projectCategoryService.update(+categoryId, updateCategoryDto);
  }

  @Delete(':categoryId')
  @ApiOperation({ summary: 'Delete a category' })
  @ApiParam({ name: 'projectId', type: 'number' })
  @ApiParam({ name: 'categoryId', type: 'number' })
  @ApiWrappedResponse({
    status: 204,
    description: 'The category has been successfully deleted.',
  })
  public async deleteCategory(
    @Param('categoryId') categoryId: string,
  ): Promise<void> {
    await this.projectCategoryService.remove(+categoryId);
  }
}
