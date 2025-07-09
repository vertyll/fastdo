import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Language } from '../../core/language/entities/language.entity';
import { LanguageCodeEnum } from '../../core/language/enums/language-code.enum';
import { CreateProjectTypeDto } from '../dtos/create-project-type.dto';
import { ProjectTypeDto } from '../dtos/project-type.dto';
import { UpdateProjectTypeDto } from '../dtos/update-project-type.dto';
import { ProjectTypeTranslation } from '../entities/project-type-translation.entity';
import { ProjectType } from '../entities/project-type.entity';
import { ProjectTypeRepository } from '../repositories/project-type.repository';
import { ProjectTypeService } from './project-type.service';

describe('ProjectTypeService', () => {
  let service: ProjectTypeService;
  let mockProjectTypeRepository: jest.Mocked<ProjectTypeRepository>;
  let mockTranslationRepository: jest.Mocked<Repository<ProjectTypeTranslation>>;
  let mockLanguageRepository: jest.Mocked<Repository<Language>>;

  beforeEach(async () => {
    mockProjectTypeRepository = {
      findOneOrFail: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      find: jest.fn(),
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
        ProjectTypeService,
        { provide: ProjectTypeRepository, useValue: mockProjectTypeRepository },
        { provide: getRepositoryToken(ProjectTypeTranslation), useValue: mockTranslationRepository },
        { provide: getRepositoryToken(Language), useValue: mockLanguageRepository },
      ],
    }).compile();

    service = module.get<ProjectTypeService>(ProjectTypeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a single project type with translations', async () => {
      const mockProjectType = {
        id: 1,
        code: 'test-type',
        isActive: true,
        translations: [
          {
            id: 1,
            name: 'Test Type',
            description: 'Test Description',
            language: { id: 1, code: LanguageCodeEnum.POLISH, isDefault: true },
          },
        ],
      } as ProjectType;

      mockProjectTypeRepository.findOneOrFail.mockResolvedValue(mockProjectType);

      const result = await service.findOne(1);

      expect(result).toEqual(mockProjectType);
      expect(mockProjectTypeRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['translations', 'translations.language'],
      });
    });

    it('should throw error if project type not found', async () => {
      mockProjectTypeRepository.findOneOrFail.mockRejectedValue(new Error('Not found'));

      await expect(service.findOne(999)).rejects.toThrow('Not found');
    });
  });

  describe('create', () => {
    it('should create a new project type with translations', async () => {
      const createDto: CreateProjectTypeDto = {
        translations: [
          {
            languageCode: LanguageCodeEnum.POLISH,
            name: 'Nowy Typ',
            description: 'Opis nowego typu',
          },
          {
            languageCode: LanguageCodeEnum.ENGLISH,
            name: 'New Type',
            description: 'New type description',
          },
        ],
      };

      const mockProjectType = { id: 1, code: 'new-type', isActive: true } as ProjectType;
      const mockLanguagePolish = { id: 1, code: LanguageCodeEnum.POLISH, isDefault: true } as Language;
      const mockLanguageEnglish = { id: 2, code: LanguageCodeEnum.ENGLISH, isDefault: false } as Language;
      const mockTranslation1 = {
        id: 1,
        name: 'Nowy Typ',
        description: 'Opis nowego typu',
        projectType: mockProjectType,
        language: mockLanguagePolish,
      } as ProjectTypeTranslation;
      const mockTranslation2 = {
        id: 2,
        name: 'New Type',
        description: 'New type description',
        projectType: mockProjectType,
        language: mockLanguageEnglish,
      } as ProjectTypeTranslation;

      const mockProjectTypeWithTranslations = {
        ...mockProjectType,
        translations: [mockTranslation1, mockTranslation2],
      } as ProjectType;

      mockProjectTypeRepository.create.mockReturnValue(mockProjectType);
      mockProjectTypeRepository.save.mockResolvedValue(mockProjectType);
      mockLanguageRepository.findOneByOrFail
        .mockResolvedValueOnce(mockLanguagePolish)
        .mockResolvedValueOnce(mockLanguageEnglish);
      mockTranslationRepository.create
        .mockReturnValueOnce(mockTranslation1)
        .mockReturnValueOnce(mockTranslation2);
      mockTranslationRepository.save
        .mockResolvedValueOnce(mockTranslation1)
        .mockResolvedValueOnce(mockTranslation2);

      // Mock findOne method for the return call
      jest.spyOn(service, 'findOne').mockResolvedValue(mockProjectTypeWithTranslations);

      const result = await service.create(createDto);

      expect(result).toEqual(mockProjectTypeWithTranslations);
      expect(mockProjectTypeRepository.create).toHaveBeenCalledWith({});
      expect(mockProjectTypeRepository.save).toHaveBeenCalledWith(mockProjectType);
      expect(mockLanguageRepository.findOneByOrFail).toHaveBeenCalledTimes(2);
      expect(mockTranslationRepository.create).toHaveBeenCalledTimes(2);
      expect(mockTranslationRepository.save).toHaveBeenCalledTimes(2);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw error if language not found', async () => {
      const createDto: CreateProjectTypeDto = {
        translations: [
          {
            languageCode: LanguageCodeEnum.POLISH,
            name: 'Nowy Typ',
            description: 'Opis',
          },
        ],
      };

      const mockProjectType = { id: 1, code: 'test-type', isActive: true } as ProjectType;
      mockProjectTypeRepository.create.mockReturnValue(mockProjectType);
      mockProjectTypeRepository.save.mockResolvedValue(mockProjectType);
      mockLanguageRepository.findOneByOrFail.mockRejectedValue(new Error('Language not found'));

      await expect(service.create(createDto)).rejects.toThrow('Language not found');
    });
  });

  describe('update', () => {
    it('should update project type with isActive flag only', async () => {
      const updateDto: UpdateProjectTypeDto = {
        isActive: false,
      };

      const mockProjectType = {
        id: 1,
        code: 'test-type',
        isActive: true,
        translations: [],
      } as unknown as ProjectType;

      const mockUpdatedProjectType = {
        ...mockProjectType,
        isActive: false,
      } as ProjectType;

      jest.spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockProjectType)
        .mockResolvedValueOnce(mockUpdatedProjectType);

      mockProjectTypeRepository.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(mockUpdatedProjectType);
      expect(mockProjectTypeRepository.update).toHaveBeenCalledWith(1, { isActive: false });
      expect(mockTranslationRepository.delete).not.toHaveBeenCalled();
    });

    it('should update project type with translations', async () => {
      const updateDto: UpdateProjectTypeDto = {
        translations: [
          {
            languageCode: LanguageCodeEnum.POLISH,
            name: 'Zaktualizowany Typ',
            description: 'Nowy opis',
          },
        ],
      };

      const mockProjectType = {
        id: 1,
        code: 'update-type',
        isActive: true,
        translations: [
          {
            id: 1,
            name: 'Stary Typ',
            description: 'Stary opis',
            language: { id: 1, code: LanguageCodeEnum.POLISH },
          },
        ],
      } as ProjectType;

      const mockLanguage = { id: 1, code: LanguageCodeEnum.POLISH } as Language;
      const mockNewTranslation = {
        id: 2,
        name: 'Zaktualizowany Typ',
        description: 'Nowy opis',
        projectType: mockProjectType,
        language: mockLanguage,
      } as ProjectTypeTranslation;

      const mockUpdatedProjectType = {
        ...mockProjectType,
        translations: [mockNewTranslation],
      } as ProjectType;

      jest.spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockProjectType)
        .mockResolvedValueOnce(mockUpdatedProjectType);

      mockTranslationRepository.delete.mockResolvedValue({ affected: 1 } as any);
      mockLanguageRepository.findOneByOrFail.mockResolvedValue(mockLanguage);
      mockTranslationRepository.create.mockReturnValue(mockNewTranslation);
      mockTranslationRepository.save.mockResolvedValue(mockNewTranslation);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(mockUpdatedProjectType);
      expect(mockTranslationRepository.delete).toHaveBeenCalledWith({ projectType: { id: 1 } });
      expect(mockLanguageRepository.findOneByOrFail).toHaveBeenCalledWith({
        code: LanguageCodeEnum.POLISH,
      });
      expect(mockTranslationRepository.create).toHaveBeenCalledWith({
        name: 'Zaktualizowany Typ',
        description: 'Nowy opis',
        projectType: mockProjectType,
        language: mockLanguage,
      });
      expect(mockTranslationRepository.save).toHaveBeenCalledWith(mockNewTranslation);
    });

    it('should update both isActive and translations', async () => {
      const updateDto: UpdateProjectTypeDto = {
        isActive: false,
        translations: [
          {
            languageCode: LanguageCodeEnum.ENGLISH,
            name: 'Updated Type',
            description: 'Updated description',
          },
        ],
      };

      const mockProjectType = {
        id: 1,
        code: 'combo-update-type',
        isActive: true,
        translations: [],
      } as unknown as ProjectType;

      const mockLanguage = { id: 2, code: LanguageCodeEnum.ENGLISH } as Language;
      const mockUpdatedProjectType = {
        ...mockProjectType,
        isActive: false,
        translations: [
          {
            id: 1,
            name: 'Updated Type',
            description: 'Updated description',
            language: mockLanguage,
          },
        ],
      } as ProjectType;

      jest.spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockProjectType)
        .mockResolvedValueOnce(mockUpdatedProjectType);

      mockProjectTypeRepository.update.mockResolvedValue({ affected: 1 } as any);
      mockTranslationRepository.delete.mockResolvedValue({ affected: 0 } as any);
      mockLanguageRepository.findOneByOrFail.mockResolvedValue(mockLanguage);
      mockTranslationRepository.create.mockReturnValue({} as any);
      mockTranslationRepository.save.mockResolvedValue({} as any);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(mockUpdatedProjectType);
      expect(mockProjectTypeRepository.update).toHaveBeenCalledWith(1, { isActive: false });
      expect(mockTranslationRepository.delete).toHaveBeenCalledWith({ projectType: { id: 1 } });
    });
  });

  describe('remove', () => {
    it('should soft delete project type by setting isActive to false', async () => {
      mockProjectTypeRepository.update.mockResolvedValue({ affected: 1 } as any);

      await service.remove(1);

      expect(mockProjectTypeRepository.update).toHaveBeenCalledWith(1, { isActive: false });
    });
  });

  describe('findAll', () => {
    it('should return all active project types with Polish translations', async () => {
      const mockProjectTypes = [
        {
          id: 1,
          code: 'type-1',
          isActive: true,
          translations: [
            {
              id: 1,
              name: 'Typ Polski',
              description: 'Opis po polsku',
              language: { id: 1, code: LanguageCodeEnum.POLISH, isDefault: true },
            },
            {
              id: 2,
              name: 'English Type',
              description: 'English description',
              language: { id: 2, code: LanguageCodeEnum.ENGLISH, isDefault: false },
            },
          ],
        },
        {
          id: 2,
          code: 'type-2',
          isActive: true,
          translations: [
            {
              id: 3,
              name: 'Drugi Typ',
              description: 'Drugi opis',
              language: { id: 1, code: LanguageCodeEnum.POLISH, isDefault: true },
            },
          ],
        },
      ] as ProjectType[];

      mockProjectTypeRepository.find.mockResolvedValue(mockProjectTypes);

      const result = await service.findAll(LanguageCodeEnum.POLISH);

      const expected: ProjectTypeDto[] = [
        {
          id: 1,
          name: 'Typ Polski',
          description: 'Opis po polsku',
        },
        {
          id: 2,
          name: 'Drugi Typ',
          description: 'Drugi opis',
        },
      ];

      expect(result).toEqual(expected);
      expect(mockProjectTypeRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        relations: ['translations', 'translations.language'],
      });
    });

    it('should return project types with default language when requested language not found', async () => {
      const mockProjectTypes = [
        {
          id: 1,
          code: 'default-type',
          isActive: true,
          translations: [
            {
              id: 1,
              name: 'Default Type',
              description: 'Default description',
              language: { id: 1, code: LanguageCodeEnum.POLISH, isDefault: true },
            },
          ],
        },
      ] as ProjectType[];

      mockProjectTypeRepository.find.mockResolvedValue(mockProjectTypes);

      const result = await service.findAll(LanguageCodeEnum.ENGLISH);

      const expected: ProjectTypeDto[] = [
        {
          id: 1,
          name: 'Default Type',
          description: 'Default description',
        },
      ];

      expect(result).toEqual(expected);
    });

    it('should return project types with first translation when no default language', async () => {
      const mockProjectTypes = [
        {
          id: 1,
          code: 'first-trans-type',
          isActive: true,
          translations: [
            {
              id: 1,
              name: 'First Translation',
              description: 'First description',
              language: { id: 1, code: LanguageCodeEnum.ENGLISH, isDefault: false },
            },
            {
              id: 2,
              name: 'Second Translation',
              description: 'Second description',
              language: { id: 2, code: LanguageCodeEnum.POLISH, isDefault: false },
            },
          ],
        },
      ] as ProjectType[];

      mockProjectTypeRepository.find.mockResolvedValue(mockProjectTypes);

      const result = await service.findAll(LanguageCodeEnum.POLISH);

      const expected: ProjectTypeDto[] = [
        {
          id: 1,
          name: 'Second Translation',
          description: 'Second description',
        },
      ];

      expect(result).toEqual(expected);
    });

    it('should return empty name and undefined description when no translations', async () => {
      const mockProjectTypes = [
        {
          id: 1,
          code: 'no-trans-type',
          isActive: true,
          translations: [],
        },
      ] as unknown as ProjectType[];

      mockProjectTypeRepository.find.mockResolvedValue(mockProjectTypes);

      const result = await service.findAll();

      const expected: ProjectTypeDto[] = [
        {
          id: 1,
          name: '',
          description: undefined,
        },
      ];

      expect(result).toEqual(expected);
    });

    it('should use Polish as default language when no language code provided', async () => {
      const mockProjectTypes = [
        {
          id: 1,
          code: 'polish-default-type',
          isActive: true,
          translations: [
            {
              id: 1,
              name: 'Polski Typ',
              description: 'Polski opis',
              language: { id: 1, code: LanguageCodeEnum.POLISH, isDefault: true },
            },
          ],
        },
      ] as ProjectType[];

      mockProjectTypeRepository.find.mockResolvedValue(mockProjectTypes);

      const result = await service.findAll();

      const expected: ProjectTypeDto[] = [
        {
          id: 1,
          name: 'Polski Typ',
          description: 'Polski opis',
        },
      ];

      expect(result).toEqual(expected);
    });
  });
});
