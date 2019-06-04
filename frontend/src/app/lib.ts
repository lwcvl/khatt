export type ListType<T> = T extends (infer U)[] ? U : never;
