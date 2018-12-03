/**
 *
 * @param data
 * @param keys
 */
export default function excludeKeys<T extends { [key: string]: any }>(
  ...keys: (keyof T & string)[]
) {
  return (data: T): Partial<T> => Object.keys(data)
    .filter(key => keys.indexOf(key as keyof T & string) === -1)
    .reduce((out, next) => {
      out[next] = data[next];
      return out;
    }, {} as Partial<T>);
}
