import 'reflect-metadata';

export const MULTIPART_ARRAY_FIELDS = Symbol('multipart:arrayFields');
export const MULTIPART_BOOLEAN_FIELDS = Symbol('multipart:booleanFields');
export const MULTIPART_NUMBER_FIELDS = Symbol('multipart:numberFields');
export const MULTIPART_JSON_FIELDS = Symbol('multipart:jsonFields');
export const MULTIPART_BASE_CLASSES = Symbol('multipart:baseClasses');

export function MultipartArray(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    const existingFields = Reflect.getMetadata(MULTIPART_ARRAY_FIELDS, target.constructor) || [];
    Reflect.defineMetadata(MULTIPART_ARRAY_FIELDS, [...existingFields, propertyKey], target.constructor);
  };
}

export function MultipartBoolean(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    const existingFields = Reflect.getMetadata(MULTIPART_BOOLEAN_FIELDS, target.constructor) || [];
    Reflect.defineMetadata(MULTIPART_BOOLEAN_FIELDS, [...existingFields, propertyKey], target.constructor);
  };
}

export function MultipartNumber(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    const existingFields = Reflect.getMetadata(MULTIPART_NUMBER_FIELDS, target.constructor) || [];
    Reflect.defineMetadata(MULTIPART_NUMBER_FIELDS, [...existingFields, propertyKey], target.constructor);
  };
}

export function MultipartJSON(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    const existingFields = Reflect.getMetadata(MULTIPART_JSON_FIELDS, target.constructor) || [];
    Reflect.defineMetadata(MULTIPART_JSON_FIELDS, [...existingFields, propertyKey], target.constructor);
  };
}

export function InheritsMultipartMetadata(baseClass: new () => object): ClassDecorator {
  return (target: object) => {
    const baseArrayFields = Reflect.getMetadata(MULTIPART_ARRAY_FIELDS, baseClass) || [];
    const baseBooleanFields = Reflect.getMetadata(MULTIPART_BOOLEAN_FIELDS, baseClass) || [];
    const baseNumberFields = Reflect.getMetadata(MULTIPART_NUMBER_FIELDS, baseClass) || [];
    const baseJsonFields = Reflect.getMetadata(MULTIPART_JSON_FIELDS, baseClass) || [];

    const existingArrayFields = Reflect.getMetadata(MULTIPART_ARRAY_FIELDS, target) || [];
    const existingBooleanFields = Reflect.getMetadata(MULTIPART_BOOLEAN_FIELDS, target) || [];
    const existingNumberFields = Reflect.getMetadata(MULTIPART_NUMBER_FIELDS, target) || [];
    const existingJsonFields = Reflect.getMetadata(MULTIPART_JSON_FIELDS, target) || [];

    Reflect.defineMetadata(MULTIPART_ARRAY_FIELDS, [...baseArrayFields, ...existingArrayFields], target);
    Reflect.defineMetadata(MULTIPART_BOOLEAN_FIELDS, [...baseBooleanFields, ...existingBooleanFields], target);
    Reflect.defineMetadata(MULTIPART_NUMBER_FIELDS, [...baseNumberFields, ...existingNumberFields], target);
    Reflect.defineMetadata(MULTIPART_JSON_FIELDS, [...baseJsonFields, ...existingJsonFields], target);

    const existingBaseClasses = Reflect.getMetadata(MULTIPART_BASE_CLASSES, target) || [];
    Reflect.defineMetadata(MULTIPART_BASE_CLASSES, [...existingBaseClasses, baseClass], target);
  };
}
