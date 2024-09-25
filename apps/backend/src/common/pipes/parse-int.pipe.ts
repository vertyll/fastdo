import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from "@nestjs/common";

@Injectable()
export class ParseIntPipe implements PipeTransform<string | number, number> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public transform(value: string | number, metadata: ArgumentMetadata): number {
    if (typeof value === "number") {
      if (!Number.isInteger(value)) {
        throw new BadRequestException("Value must be an integer");
      }
      return value;
    }

    const val = Number(value);
    if (isNaN(val) || !Number.isInteger(val)) {
      throw new BadRequestException("Value must be an integer");
    }
    return val;
  }
}
