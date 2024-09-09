import { Reflector } from "@nestjs/core";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { AuthGuard } from "@nestjs/passport";

describe("JwtAuthGuard", () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard(new Reflector());
  });

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  it("should extend AuthGuard with 'jwt' strategy", () => {
    expect(guard).toBeInstanceOf(AuthGuard("jwt"));
  });
});
