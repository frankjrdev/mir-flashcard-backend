export interface IUser {
  //   _id?: string;
  email: string;
  password: string;
  name: string;
  isVerified: boolean;
  verificationToken?: string;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserCreateDTO {
  email: string;
  password: string;
  name: string;
}

export interface IUserLoginDTO {
  email: string;
  password: string;
}

export interface IUserResponseDTO {
  id: string;
  email: string;
  name: string;
  isVerified: boolean;
  lastLogin?: Date;
}

export interface IAuthResponse {
  user: IUserResponseDTO;
  token: string;
  expiresIn: string;
}

export interface IVerifyEmailDTO {
  token: string;
}
