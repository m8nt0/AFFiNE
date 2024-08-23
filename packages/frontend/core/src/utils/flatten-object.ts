export function flattenObject(ob: any, target: any = {}, prefix = '') {
  for (const key in ob) {
    if (!Object.prototype.hasOwnProperty.call(ob, key)) continue;

    if (typeof ob[key] === 'object' && ob[key] !== null) {
      flattenObject(ob[key], target, prefix + key + '.');
    } else {
      target[prefix + key] = ob[key];
    }
  }
  return target;
}

export function expandFlattenObject(ob: any) {
  const result: any = {};

  for (const key in ob) {
    if (!Object.prototype.hasOwnProperty.call(ob, key)) continue;

    const keys = key.split('.');
    let current = result;

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (i === keys.length - 1) {
        current[k] = ob[key];
      } else {
        current[k] = current[k] || {};
        current = current[k];
      }
    }
  }

  return result;
}
