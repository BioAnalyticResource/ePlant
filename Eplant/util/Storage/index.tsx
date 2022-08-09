import { openDB, deleteDB, wrap, unwrap, IDBPDatabase, DBSchema } from 'idb'

type UpdateEvent<T> = { type: 'update'; key: T }

class TypedBroadcastChannel<T> extends BroadcastChannel {
  public postMessage(message: T) {
    super.postMessage(message)
  }
}

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
      this.channel.postMessage({ type: 'update', key })
    })
  }

  async get(key: K) {
    const db = await this.dbPromise
    return db.get('keyval', key)
  }

  async delete(key: K) {
    const db = await this.dbPromise
    return db.delete('keyval', key).then(() => {
      this.channel.postMessage({ type: 'update', key })
    })
  }

  async keys() {
    const db = await this.dbPromise
    return db.getAllKeys('keyval')
  }

  async clear() {
    console.log(await this.keys())
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
