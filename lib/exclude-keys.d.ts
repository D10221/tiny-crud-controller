/**
 *
 * @param data
 * @param keys
 */
export default function excludeKeys<T extends {
    [key: string]: any;
}, TK extends keyof T & string>(...keys: TK[]): (data: T) => Partial<T>;
