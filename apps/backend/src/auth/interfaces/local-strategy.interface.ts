import {User} from "../../users/entities/user.entity";

export interface ILocalStrategy {
    validate(email: string, password: string): Promise<Omit<User, 'password'>>;
}
