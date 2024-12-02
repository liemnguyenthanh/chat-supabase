import crypto from 'crypto-js';

export const getGravatarUrl = (email: string): string => {
  const hash = crypto.MD5(email.trim().toLowerCase()).toString();
  return `https://gravatar.com/avatar/${hash}?d=identicon`;
};