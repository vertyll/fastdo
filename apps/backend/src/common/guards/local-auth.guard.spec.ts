import { LocalAuthGuard } from "./local-auth.guard";
import { AuthGuard } from "@nestjs/passport";

describe("LocalAuthGuard", () => {
  let guard: LocalAuthGuard;

  beforeEach(() => {
    guard = new LocalAuthGuard();
  });

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  it("should extend AuthGuard with 'local' strategy", () => {
    expect(guard).toBeInstanceOf(AuthGuard("local"));
  });
});
