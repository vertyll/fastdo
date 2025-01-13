import {Role} from "../enums/role.enum";

export interface JwtPayload {
    email: string;
    sub: number;
    roles: string[];
}

export interface JwtValidatedUser {
    id: number;
    email: string;
    isActive: boolean;
    roles: Role[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ValidatedUser {
    id: number;
    email: string;
    isActive: boolean;
    dateCreation?: Date;
    dateModification?: Date;
}