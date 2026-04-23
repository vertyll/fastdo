import { User } from '../../../user/defs/user.defs';

export class GetCurrentUser {
  public static readonly type = '[User] Get Current User';
}

export class UpdateUserProfile {
  public static readonly type = '[User] Update Profile';
  constructor(public payload: FormData) {}
}

export class SetUser {
  public static readonly type = '[User] Set User';
  constructor(public payload: User) {}
}

export class ClearUser {
  public static readonly type = '[User] Clear User';
}

export class SetError {
  public static readonly type = '[User] Set Error';
  constructor(public payload: string) {}
}
