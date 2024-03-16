import { DBSchema, IDBPDatabase, openDB } from 'idb'

import delayed from '../delayed'

type UpdateEvent<T> = { type: 'update'; key: T }

class TypedBroadcastChannel<T> extends BroadcastChannel {
  public postMessage(message: T) {
    super.postMessage(message)
  }
}

/**
 * A key-value store that can be used to share and cache data between different tabs.
 *
 * There is a memory leak because the broadcast channel is never closed, so it cannot be garbage collected.
 * This is fine as long as you don't make too many stores (e.g. generating large amounts in a loop)
 */
export default class KeyValDB<K extends string, V> {
  private dbPromise: Promise<
    IDBPDatabase<
      {
        keyval: {
          key: K
          value: V
        }
      } & DBSchema
    >
  >

  private channel: TypedBroadcastChannel<UpdateEvent<K>>
  constructor(name: string) {
    this.dbPromise = openDB(name, 1, {
      upgrade(db, oldVersion, newVersion) {
        if (oldVersion === 0) {
          db.createObjectStore('keyval')
        }
      },
    })
    this.channel = new BroadcastChannel(`${name}-keyval`)
  }

  async set(key: K, value: V) {
    const db = await this.dbPromise
    return db.put('keyval', value, key).then(() => {
      delayed.call(() => this.channel.postMessage({ type: 'update', key }), 20)
    })
  }

  async get(key: K) {
    const db = await this.dbPromise
    return db.get('keyval', key)
  }

  async delete(key: K) {
    const db = await this.dbPromise
    return db.delete('keyval', key).then(() => {
      delayed.call(() => this.channel.postMessage({ type: 'update', key }), 20)
    })
  }

  async keys() {
    const db = await this.dbPromise
    return db.getAllKeys('keyval')
  }

  async clear() {
    ;(await this.keys()).forEach((key: K) => this.delete(key))
  }

  watch(key: K, onChange: (newVal: V | undefined) => void) {
    const listener = (e: MessageEvent<UpdateEvent<K>>) => {
      if (e.data.type === 'update' && e.data.key === key) {
        this.get(key).then((v) => onChange(v))
      }
    }
    this.channel.addEventListener('message', (e) => listener(e))
    return () => this.channel.removeEventListener('message', listener)
  }
}
