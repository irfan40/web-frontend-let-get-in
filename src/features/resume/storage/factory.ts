import { IStorageProvider } from './types';
import { MongoStorage } from './mongo';

export class StorageProviderFactory {
  private static mongoInstance: MongoStorage | null = null;

  static getProvider(_isAuthenticated: boolean = true): IStorageProvider {
    if (!this.mongoInstance) {
      this.mongoInstance = new MongoStorage();
    }
    return this.mongoInstance;
  }
}
