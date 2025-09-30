import { fromEvent } from 'rxjs/internal/observable/fromEvent';
import { filter } from 'rxjs/internal/operators/filter';
import { map } from 'rxjs/internal/operators/map';
import { startWith } from 'rxjs/internal/operators/startWith';
import { Observable } from 'rxjs/internal/Observable';

type Key = string | number | symbol;

export class LocalStorage<SKey extends Key> {
  protected storage: Storage = localStorage;
  protected storage$: Observable<StorageEvent>;
  protected event = 'storage';

  constructor() {
    this.storage$ = fromEvent<StorageEvent>(window, this.event);
  }

  public remove(key: SKey): void {
    const oldValue = this.storage.getItem(key as string);
    this.storage.removeItem(key as string);
    this.sendEvent(key, oldValue as string, null);
  }

  // JSON.stringify can crash or behave unexpectedly (e.g. undefined, functions, BigInt, ...)
  // but good and simple enough for most cases
  public set(key: SKey, value: unknown): void {
    try {
      const oldValue = this.storage.getItem(key as string);
      const newValue = JSON.stringify(value);
      this.storage.setItem(key as string, newValue);
      this.sendEvent(key, oldValue as string, newValue);
    } catch (e) {
      console.error('Error setting localStorage value', key, value, e);
    }
  }

  public get<T = unknown>(key: SKey): T | null {
    const item = this.storage.getItem(key as string);
    try {
      return JSON.parse(item as string); // handles null ok
    } catch (e) {
      console.warn('Error parsing value from localStorage', key, e);
      return item as T; // could be an item stored directly bypassing this service
    }
  }

  public value$<T>(key: SKey): Observable<T | null> {
    return this.storage$.pipe(
      filter((ch) => ch.key === key),
      map(() => this.get<T>(key)),
      startWith(this.get<T>(key))
    );
  }

  private sendEvent(
    key: SKey,
    oldValue: string,
    newValue: string | null
  ): void {
    window.dispatchEvent(
      new StorageEvent(this.event, {
        key: key as string,
        oldValue,
        newValue,
        url: window.location.href,
        storageArea: this.storage,
      })
    );
  }
}
