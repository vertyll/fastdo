import { User } from '../../../user/models/User';

export class GetCurrentUser {
  static readonly type = '[User] Get Current User';
}

export class UpdateUserProfile {
  static readonly type = '[User] Update Profile';
  constructor(public payload: FormData) {}
}

export class SetUser {
  static readonly type = '[User] Set User';
  constructor(public payload: User) {}
}

export class ClearUser {
  static readonly type = '[User] Clear User';
}

export class SetError {
  static readonly type = '[User] Set Error';
  constructor(public payload: string) {}
}
