import { applyDecorators } from '@nestjs/common';
import { ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { ApiWrappedResponseOptions } from '../types/api-responses.interface';

export function ApiWrappedResponse(options: ApiWrappedResponseOptions) {
  let dataSchema: any;

  if (options.type) {
    if (options.isPaginated) {
      dataSchema = {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { $ref: getSchemaPath(options.type) },
          },
          pagination: {
            type: 'object',
            properties: {
              total: { type: 'number' },
              page: { type: 'number' },
              pageSize: { type: 'number' },
              totalPages: { type: 'number' },
            },
          },
        },
      };
    } else if (options.type === String) {
      dataSchema = { type: 'string' };
    } else if (options.type === Number) {
      dataSchema = { type: 'number' };
    } else if (options.type === Boolean) {
      dataSchema = { type: 'boolean' };
    } else if (options.isArray) {
      dataSchema = {
        type: 'array',
        items: { $ref: getSchemaPath(options.type) },
      };
    } else {
      dataSchema = { $ref: getSchemaPath(options.type) };
    }
  }

  return applyDecorators(
    ApiResponse({
      status: options.status,
      description: options.description,
      schema: {
        properties: {
          data: dataSchema,
          statusCode: { type: 'number' },
          timestamp: { type: 'string' },
          path: { type: 'string' },
          method: { type: 'string' },
          message: { type: 'string' },
        },
      },
    }),
  );
}
