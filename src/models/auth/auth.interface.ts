interface IRegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  address: string;
}
interface ILoginData {
  email: string;
  password: string;
}

interface IVerifyOtpData {
  otp: string;
}

interface IForgotPasswordData {
  email: string;
}
interface IResendOtpData {
  email: string;
}
interface IResetPasswordData {
  newPassword: string;
}
export {
  IRegisterData,
  ILoginData,
  IVerifyOtpData,
  IForgotPasswordData,
  IResendOtpData,
  IResetPasswordData,
};
