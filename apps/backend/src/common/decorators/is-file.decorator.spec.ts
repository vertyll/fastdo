import { registerDecorator } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { IsFile } from './is-file.decorator';

jest.mock('class-validator', () => ({
  registerDecorator: jest.fn(),
  ValidationOptions: jest.fn(),
}));

jest.mock('nestjs-i18n', () => ({
  i18nValidationMessage: jest.fn(() => jest.fn()),
}));

describe('IsFile Decorator', () => {
  it('should register the decorator with correct options', () => {
    const options = { maxSize: 1024 * 1024, mimeTypes: ['image/jpeg', 'image/png'] };
    const target = {};
    const propertyName = 'file';

    IsFile(options)(target, propertyName);

    expect(registerDecorator).toHaveBeenCalledWith({
      name: 'isFile',
      target: target.constructor,
      propertyName: propertyName,
      options: options,
      validator: {
        validate: expect.any(Function),
        defaultMessage: expect.any(Function),
      },
    });
  });

  it('should use i18nValidationMessage for defaultMessage', () => {
    const options = { maxSize: 1024 * 1024, mimeTypes: ['image/jpeg', 'image/png'] };
    const target = {};
    const propertyName = 'file';

    IsFile(options)(target, propertyName);

    const decoratorCall = (registerDecorator as jest.Mock).mock.calls[0][0];
    const defaultMessage = decoratorCall.validator.defaultMessage;

    const validationArgs = { value: {}, constraints: [], targetName: '', property: 'file', object: {} };
    defaultMessage(validationArgs);

    expect(i18nValidationMessage).toHaveBeenCalledWith('messages.File.errors.invalidFile');
  });

  it('should validate file correctly', () => {
    const options = { maxSize: 1024 * 1024, mimeTypes: ['image/jpeg', 'image/png'] };
    const target = {};
    const propertyName = 'file';

    IsFile(options)(target, propertyName);

    const decoratorCall = (registerDecorator as jest.Mock).mock.calls[0][0];
    const validate = decoratorCall.validator.validate;

    // Testowanie walidacji
    expect(validate(null)).toBe(true); // Brak pliku
    expect(validate({ type: 'text' })).toBe(false); // Nieprawidłowy typ
    expect(validate({ type: 'file', mimetype: 'image/jpeg', file: { bytesRead: 500 } })).toBe(true); // Poprawny plik
    expect(validate({ type: 'file', mimetype: 'image/gif', file: { bytesRead: 500 } })).toBe(false); // Nieprawidłowy MIME
    expect(validate({ type: 'file', mimetype: 'image/jpeg', file: { bytesRead: 1024 * 1024 + 1 } })).toBe(false); // Przekroczony rozmiar
  });
});
