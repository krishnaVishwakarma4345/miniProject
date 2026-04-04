import { ActionCodeSettings } from "firebase/auth";

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, "");

const getBaseAppUrl = (): string => {
  if (typeof window !== "undefined" && window.location?.origin) {
    return trimTrailingSlash(window.location.origin);
  }

  const envUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim();

  return trimTrailingSlash(envUrl || "http://localhost:3000");
};

const buildAppUrl = (path: string): string => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getBaseAppUrl()}${normalizedPath}`;
};

export const getEmailVerificationActionCodeSettings = (): ActionCodeSettings => ({
  url: buildAppUrl("/verify-email"),
  handleCodeInApp: true,
});

export const getPasswordResetActionCodeSettings = (): ActionCodeSettings => ({
  url: buildAppUrl("/reset-password"),
  handleCodeInApp: true,
});
