import { ApiResponse } from '@nestjs/swagger';
import { ApiWrappedResponse } from './api-wrapped-response.decorator';

jest.mock('@nestjs/swagger', () => ({
  ApiResponse: jest.fn(),
  getSchemaPath: jest.fn().mockReturnValue('schema-path'),
}));

class TestDto {}

describe('ApiWrappedResponse', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create basic response schema', () => {
    ApiWrappedResponse({
      status: 200,
      description: 'Test response',
      type: TestDto,
    });

    expect(ApiResponse).toHaveBeenCalledWith({
      status: 200,
      description: 'Test response',
      schema: {
        properties: {
          data: { $ref: 'schema-path' },
          statusCode: { type: 'number' },
          timestamp: { type: 'string' },
          path: { type: 'string' },
          method: { type: 'string' },
          message: { type: 'string' },
        },
      },
    });
  });

  it('should handle paginated response', () => {
    ApiWrappedResponse({
      status: 200,
      description: 'Paginated response',
      type: TestDto,
      isPaginated: true,
    });

    expect(ApiResponse).toHaveBeenCalledWith({
      status: 200,
      description: 'Paginated response',
      schema: {
        properties: {
          data: {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                items: { $ref: 'schema-path' },
              },
              pagination: {
                type: 'object',
                properties: {
                  total: { type: 'number' },
                  page: { type: 'number' },
                  pageSize: { type: 'number' },
                  totalPages: { type: 'number' },
                  hasMore: { type: 'boolean' },
                },
              },
            },
          },
          statusCode: { type: 'number' },
          timestamp: { type: 'string' },
          path: { type: 'string' },
          method: { type: 'string' },
          message: { type: 'string' },
        },
      },
    });
  });

  it('should handle array response', () => {
    ApiWrappedResponse({
      status: 200,
      type: TestDto,
      isArray: true,
    });

    expect(ApiResponse).toHaveBeenCalledWith({
      status: 200,
      schema: {
        properties: {
          data: {
            type: 'array',
            items: { $ref: 'schema-path' },
          },
          statusCode: { type: 'number' },
          timestamp: { type: 'string' },
          path: { type: 'string' },
          method: { type: 'string' },
          message: { type: 'string' },
        },
      },
    });
  });

  it('should handle string type', () => {
    ApiWrappedResponse({
      status: 200,
      type: String,
    });

    expect(ApiResponse).toHaveBeenCalledWith({
      status: 200,
      schema: {
        properties: {
          data: { type: 'string' },
          statusCode: { type: 'number' },
          timestamp: { type: 'string' },
          path: { type: 'string' },
          method: { type: 'string' },
          message: { type: 'string' },
        },
      },
    });
  });

  it('should handle number type', () => {
    ApiWrappedResponse({
      status: 200,
      type: Number,
    });

    expect(ApiResponse).toHaveBeenCalledWith({
      status: 200,
      schema: {
        properties: {
          data: { type: 'number' },
          statusCode: { type: 'number' },
          timestamp: { type: 'string' },
          path: { type: 'string' },
          method: { type: 'string' },
          message: { type: 'string' },
        },
      },
    });
  });

  it('should handle boolean type', () => {
    ApiWrappedResponse({
      status: 200,
      type: Boolean,
    });

    expect(ApiResponse).toHaveBeenCalledWith({
      status: 200,
      schema: {
        properties: {
          data: { type: 'boolean' },
          statusCode: { type: 'number' },
          timestamp: { type: 'string' },
          path: { type: 'string' },
          method: { type: 'string' },
          message: { type: 'string' },
        },
      },
    });
  });
});
