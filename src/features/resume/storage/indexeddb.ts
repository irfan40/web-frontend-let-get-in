import { openDB, IDBPDatabase } from 'idb';
import { IStorageProvider } from './types';
import { IResume } from '../types';

const DB_NAME = 'ResumeBuildDB';
const STORE_NAME = 'guest_resumes';
const DB_VERSION = 1;

export class IndexedDBStorage implements IStorageProvider {
  private dbPromise: Promise<IDBPDatabase>;

  constructor() {
    this.dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }

  async save(resume: IResume): Promise<IResume> {
    const db = await this.dbPromise;
    const updatedResume = {
      ...resume,
      updatedAt: new Date().toISOString(),
    };
    await db.put(STORE_NAME, updatedResume);
    return updatedResume;
  }

  async load(id: string): Promise<IResume | null> {
    const db = await this.dbPromise;
    const resume = await db.get(STORE_NAME, id);
    return resume || null;
  }

  async list(): Promise<IResume[]> {
    const db = await this.dbPromise;
    return await db.getAll(STORE_NAME);
  }

  async delete(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete(STORE_NAME, id);
  }
}
