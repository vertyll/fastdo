import { WrapResponseInterceptor } from "./wrap-response.interceptor";
import { CallHandler, ExecutionContext } from "@nestjs/common";
import { of } from "rxjs";

describe("WrapResponseInterceptor", () => {
  let interceptor: WrapResponseInterceptor;
  let mockContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(() => {
    interceptor = new WrapResponseInterceptor();
    mockContext = {} as ExecutionContext;
    mockCallHandler = {
      handle: jest.fn(),
    } as unknown as CallHandler;
  });

  it("should be defined", () => {
    expect(interceptor).toBeDefined();
  });

  it("should wrap the response data in a data property", (done) => {
    const testData = { test: "wartość" };
    (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: (value) => {
        expect(value).toEqual({ data: testData });
        done();
      },
      error: () => {
        done.fail("Should not throw error");
      },
    });
  });

  it("should handle null response", (done) => {
    (mockCallHandler.handle as jest.Mock).mockReturnValue(of(null));

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: (value) => {
        expect(value).toEqual({ data: null });
        done();
      },
      error: () => {
        done.fail("Should not throw error");
      },
    });
  });

  it("should handle undefined response", (done) => {
    (mockCallHandler.handle as jest.Mock).mockReturnValue(of(undefined));

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: (value) => {
        expect(value).toEqual({ data: undefined });
        done();
      },
      error: () => {
        done.fail("Should not throw error");
      },
    });
  });
});
