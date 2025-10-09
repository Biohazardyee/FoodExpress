export abstract class Service<T, ID = string> {
    abstract getAll(): Promise<T[]>;
    abstract getById(id: ID): Promise<T>;
    abstract add(data: T): Promise<T>;
    abstract update(id: ID, data: Partial<T>): Promise<T>;
    abstract delete(id: ID): Promise<T>;
}