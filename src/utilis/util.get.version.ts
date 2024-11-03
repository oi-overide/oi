import { version } from '../../package.json';

export const getVersion = (): string => version;

export const validateVersion = (version: string): boolean => {
  const semverRegex =
    /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+)?$/;
  return semverRegex.test(version);
};
