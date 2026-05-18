export declare class UserResponseDto {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class AuthResponseDto {
    access_token: string;
    user: UserResponseDto;
}
