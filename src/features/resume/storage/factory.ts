import { IStorageProvider } from './types';
import { IndexedDBStorage } from './indexeddb';
import { MongoStorage } from './mongo';

export class StorageProviderFactory {
  private static indexedDBInstance: IndexedDBStorage | null = null;
  private static mongoInstance: MongoStorage | null = null;

  static getProvider(isAuthenticated: boolean): IStorageProvider {
    if (isAuthenticated) {
      if (!this.mongoInstance) {
        this.mongoInstance = new MongoStorage();
      }
      return this.mongoInstance;
    } else {
      if (!this.indexedDBInstance) {
        this.indexedDBInstance = new IndexedDBStorage();
      }
      return this.indexedDBInstance;
    }
  }
}
