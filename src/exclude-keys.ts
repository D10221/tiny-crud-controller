/**
 *
 * @param data
 * @param keys
 */
export default function excludeKeys<T extends { [key: string]: any }, TK extends keyof T & string>(
  ...keys: TK[]
) {
  return (data: T): Partial<T> => Object.keys(data)
    .filter(key => keys.indexOf(key as TK) === -1)
    .reduce((out, next) => {
      out[next] = data[next];
      return out;
    }, {} as Partial<T>);
}
