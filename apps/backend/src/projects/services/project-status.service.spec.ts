import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Language } from '../../core/language/entities/language.entity';
import { LanguageCodeEnum } from '../../core/language/enums/language-code.enum';
import { CreateProjectStatusDto } from '../dtos/create-project-status.dto';
import { UpdateProjectStatusDto } from '../dtos/update-project-status.dto';
import { ProjectStatusTranslation } from '../entities/project-status-translation.entity';
import { ProjectStatus } from '../entities/project-status.entity';
import { ProjectStatusRepository } from '../repositories/project-status.repository';
import { ProjectStatusService } from './project-status.service';

describe('ProjectStatusService', () => {
  let service: ProjectStatusService;
  let mockProjectStatusRepository: jest.Mocked<ProjectStatusRepository>;
  let mockTranslationRepository: jest.Mocked<Repository<ProjectStatusTranslation>>;
  let mockLanguageRepository: jest.Mocked<Repository<Language>>;

  beforeEach(async () => {
    mockProjectStatusRepository = {
      find: jest.fn(),
      findOneOrFail: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    } as any;

    mockTranslationRepository = {
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockLanguageRepository = {
      findOneByOrFail: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectStatusService,
        { provide: ProjectStatusRepository, useValue: mockProjectStatusRepository },
        { provide: getRepositoryToken(ProjectStatusTranslation), useValue: mockTranslationRepository },
        { provide: getRepositoryToken(Language), useValue: mockLanguageRepository },
      ],
    }).compile();

    service = module.get<ProjectStatusService>(ProjectStatusService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByProjectId', () => {
    it('should return statuses with translations for given language', async () => {
      const mockStatuses = [
        {
          id: 1,
          isActive: true,
          translations: [
            { name: 'Status PL', language: { code: LanguageCodeEnum.POLISH } },
            { name: 'Status EN', language: { code: LanguageCodeEnum.ENGLISH } },
          ],
        },
        {
          id: 2,
          isActive: true,
          translations: [
            { name: 'Drugi Status', language: { code: LanguageCodeEnum.POLISH } },
          ],
        },
      ] as any[];
      mockProjectStatusRepository.find.mockResolvedValue(mockStatuses);

      const result = await service.findByProjectId(123, LanguageCodeEnum.POLISH);
      expect(result).toEqual([
        { id: 1, name: 'Status PL' },
        { id: 2, name: 'Drugi Status' },
      ]);
      expect(mockProjectStatusRepository.find).toHaveBeenCalledWith({
        where: { project: { id: 123 }, isActive: true },
        relations: ['translations', 'translations.language'],
      });
    });

    it('should fallback to first translation if language not found', async () => {
      const mockStatuses = [
        {
          id: 1,
          isActive: true,
          translations: [
            { name: 'Status EN', language: { code: LanguageCodeEnum.ENGLISH } },
          ],
        },
      ] as any[];
      mockProjectStatusRepository.find.mockResolvedValue(mockStatuses);

      const result = await service.findByProjectId(123, LanguageCodeEnum.POLISH);
      expect(result).toEqual([
        { id: 1, name: 'Status EN' },
      ]);
    });
  });

  describe('findOne', () => {
    it('should return a single status with translations', async () => {
      const mockStatus = { id: 1, translations: [] } as unknown as ProjectStatus;
      mockProjectStatusRepository.findOneOrFail.mockResolvedValue(mockStatus);
      const result = await service.findOne(1);
      expect(result).toEqual(mockStatus);
      expect(mockProjectStatusRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['translations', 'translations.language'],
      });
    });
  });

  describe('create', () => {
    it('should create a new status with translations', async () => {
      const createDto: CreateProjectStatusDto = {
        color: '#fff',
        projectId: 1,
        translations: [
          { languageCode: LanguageCodeEnum.POLISH, name: 'Status PL', description: 'Opis' },
          { languageCode: LanguageCodeEnum.ENGLISH, name: 'Status EN', description: 'Desc' },
        ],
      };
      const mockStatus = { id: 1, color: '#fff' } as ProjectStatus;
      const mockSavedStatus = { ...mockStatus };
      const mockLangPL = { id: 1, code: LanguageCodeEnum.POLISH } as Language;
      const mockLangEN = { id: 2, code: LanguageCodeEnum.ENGLISH } as Language;
      const mockTranslationPL = {
        name: 'Status PL',
        description: 'Opis',
        projectStatus: mockSavedStatus,
        language: mockLangPL,
      } as ProjectStatusTranslation;
      const mockTranslationEN = {
        name: 'Status EN',
        description: 'Desc',
        projectStatus: mockSavedStatus,
        language: mockLangEN,
      } as ProjectStatusTranslation;
      const mockStatusWithTranslations = {
        ...mockStatus,
        translations: [mockTranslationPL, mockTranslationEN],
      } as ProjectStatus;

      mockProjectStatusRepository.create.mockReturnValue(mockStatus);
      mockProjectStatusRepository.save.mockResolvedValue(mockSavedStatus);
      mockLanguageRepository.findOneByOrFail
        .mockResolvedValueOnce(mockLangPL)
        .mockResolvedValueOnce(mockLangEN);
      mockTranslationRepository.create
        .mockReturnValueOnce(mockTranslationPL)
        .mockReturnValueOnce(mockTranslationEN);
      mockTranslationRepository.save
        .mockResolvedValueOnce(mockTranslationPL)
        .mockResolvedValueOnce(mockTranslationEN);
      jest.spyOn(service, 'findOne').mockResolvedValue(mockStatusWithTranslations);

      const result = await service.create(createDto);
      expect(result).toEqual(mockStatusWithTranslations);
      expect(mockProjectStatusRepository.create).toHaveBeenCalledWith({ color: '#fff', project: { id: 1 } });
      expect(mockProjectStatusRepository.save).toHaveBeenCalledWith(mockStatus);
      expect(mockLanguageRepository.findOneByOrFail).toHaveBeenCalledTimes(2);
      expect(mockTranslationRepository.create).toHaveBeenCalledTimes(2);
      expect(mockTranslationRepository.save).toHaveBeenCalledTimes(2);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update color and isActive only', async () => {
      const updateDto: UpdateProjectStatusDto = { color: '#000', isActive: false };
      const mockStatus = { id: 1, color: '#fff', isActive: true, translations: [] } as unknown as ProjectStatus;
      const mockUpdatedStatus = { ...mockStatus, color: '#000', isActive: false } as ProjectStatus;
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockStatus).mockResolvedValueOnce(mockUpdatedStatus);
      mockProjectStatusRepository.update.mockResolvedValue({ affected: 1 } as any);
      const result = await service.update(1, updateDto);
      expect(result).toEqual(mockUpdatedStatus);
      expect(mockProjectStatusRepository.update).toHaveBeenCalledWith(1, { color: '#000', isActive: false });
      expect(mockTranslationRepository.delete).not.toHaveBeenCalled();
    });

    it('should update translations', async () => {
      const updateDto: UpdateProjectStatusDto = {
        translations: [
          { languageCode: LanguageCodeEnum.POLISH, name: 'Nowy', description: 'Opis' },
        ],
      };
      const mockStatus = { id: 1, translations: [] } as unknown as ProjectStatus;
      const mockLang = { id: 1, code: LanguageCodeEnum.POLISH } as Language;
      const mockTranslation = {
        name: 'Nowy',
        description: 'Opis',
        projectStatus: mockStatus,
        language: mockLang,
      } as ProjectStatusTranslation;
      const mockUpdatedStatus = { ...mockStatus, translations: [mockTranslation] } as ProjectStatus;
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockStatus).mockResolvedValueOnce(mockUpdatedStatus);
      mockTranslationRepository.delete.mockResolvedValue({ affected: 1 } as any);
      mockLanguageRepository.findOneByOrFail.mockResolvedValue(mockLang);
      mockTranslationRepository.create.mockReturnValue(mockTranslation);
      mockTranslationRepository.save.mockResolvedValue(mockTranslation);
      const result = await service.update(1, updateDto);
      expect(result).toEqual(mockUpdatedStatus);
      expect(mockTranslationRepository.delete).toHaveBeenCalledWith({ projectStatus: { id: 1 } });
      expect(mockLanguageRepository.findOneByOrFail).toHaveBeenCalledWith({ code: LanguageCodeEnum.POLISH });
      expect(mockTranslationRepository.create).toHaveBeenCalledWith({
        name: 'Nowy',
        description: 'Opis',
        projectStatus: mockStatus,
        language: mockLang,
      });
      expect(mockTranslationRepository.save).toHaveBeenCalledWith(mockTranslation);
    });
  });

  describe('remove', () => {
    it('should soft delete status by setting isActive to false', async () => {
      mockProjectStatusRepository.update.mockResolvedValue({ affected: 1 } as any);
      await service.remove(1);
      expect(mockProjectStatusRepository.update).toHaveBeenCalledWith(1, { isActive: false });
    });
  });
});
