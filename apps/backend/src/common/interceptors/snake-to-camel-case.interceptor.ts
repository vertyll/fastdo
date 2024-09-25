import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable()
export class SnakeToCamelCaseInterceptor implements NestInterceptor {
  public intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<any> {
    return next.handle().pipe(map((data) => this.keysToCamel(data)));
  }

  private toCamel(s: string): string {
    return s.replace(/([-_][a-z])/gi, ($1) => {
      return $1.toUpperCase().replace("-", "").replace("_", "");
    });
  }

  private isObject(obj: any): boolean {
    return (
      obj === Object(obj) && !Array.isArray(obj) && typeof obj !== "function"
    );
  }

  private keysToCamel(obj: any): any {
    if (this.isObject(obj)) {
      const n = {};
      Object.keys(obj).forEach((k) => {
        n[this.toCamel(k)] = this.keysToCamel(obj[k]);
      });
      return n;
    } else if (Array.isArray(obj)) {
      return obj.map((i) => {
        return this.keysToCamel(i);
      });
    }
    return obj;
  }
}
