const UNSERIALIZABLE = '[Unserializable]';

const curlyWrapString = (value: string): string => `{${value}}`;
const arrWrapString = (value: string): string => `[${value}]`;

export const objToString = (value: object, checkLevel = 1): string => {
  try {
    return JSON.stringify(value);
  } catch (_) {
    if (checkLevel > 0) {
      return curlyWrapString(
        Object.entries(value as object).reduce((result, [key, val]) => {
          return `${result}${key}: ${objToString(val, checkLevel - 1)}, `;
        }, '')
      );
    }
    return UNSERIALIZABLE;
  }
};

export const arrToString = (value: unknown[]): string => {
  return arrWrapString(value.map((item) => stringify(item)).join(', '));
};

export const stringify = (
  value: unknown,
  { nullValue = '', undefinedValue = '' } = {}
): string => {
  if (value === null) return nullValue;
  if (value === undefined) return undefinedValue;
  if (typeof value === 'string') return value as string;
  if (typeof value === 'boolean') return value.toString();
  if (typeof value === 'number') return value.toString();
  if (Array.isArray(value)) return arrToString(value);
  else return objToString(value as object);
};
