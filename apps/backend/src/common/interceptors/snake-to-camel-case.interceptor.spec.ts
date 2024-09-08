import { SnakeToCamelCaseInterceptor } from "./snake-to-camel-case.interceptor";
import { of } from "rxjs";

describe("SnakeToCamelCaseInterceptor", () => {
  let interceptor: SnakeToCamelCaseInterceptor;

  beforeEach(() => {
    interceptor = new SnakeToCamelCaseInterceptor();
  });

  it("should be defined", () => {
    expect(interceptor).toBeDefined();
  });

  it("should transform snake_case to camelCase", () => {
    const mockExecutionContext = {} as any;
    const mockCallHandler = {
      handle: () =>
        of({ snake_case: "value", nested_object: { another_key: "value" } }),
    };

    interceptor
      .intercept(mockExecutionContext, mockCallHandler)
      .subscribe((result) => {
        expect(result).toEqual({
          snakeCase: "value",
          nestedObject: { anotherKey: "value" },
        });
      });
  });

  it("should handle arrays", () => {
    const mockExecutionContext = {} as any;
    const mockCallHandler = {
      handle: () => of([{ snake_case: "value" }, { another_key: "value" }]),
    };

    interceptor
      .intercept(mockExecutionContext, mockCallHandler)
      .subscribe((result) => {
        expect(result).toEqual([
          { snakeCase: "value" },
          { anotherKey: "value" },
        ]);
      });
  });

  it("should not modify non-object values", () => {
    const mockExecutionContext = {} as any;
    const mockCallHandler = {
      handle: () => of("string"),
    };

    interceptor
      .intercept(mockExecutionContext, mockCallHandler)
      .subscribe((result) => {
        expect(result).toBe("string");
      });
  });
});
