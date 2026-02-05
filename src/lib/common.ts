/**
 * Pick properties from an object and copy them to a new object
 * @param obj
 * @param keys
 */
// @todo fix any type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function pick(obj: Record<string, any>, keys: string[]) {
  // @todo fix any type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ret: Record<string, any> = {};

  keys.forEach(k => {
    if (k in obj) {
      ret[k] = obj[k];
    }
  });

  return ret;
}

/**
 * Remove properties that are `null` or `undefined` from the object.
 * @param obj
 */
// @todo fix any type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function cleanNonValues(obj: Record<string, any>) {
  // @todo fix any type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ret: Record<string, any> = {};

  for (const key in obj) {
    if (obj[key] !== null && typeof obj[key] !== 'undefined') {
      ret[key] = obj[key];
    }
  }

  return ret;
}
