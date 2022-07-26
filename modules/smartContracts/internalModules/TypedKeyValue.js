/**
 iZ³ | Izzzio blockchain - https://izzz.io
 @author: IZZZIO, LLC - https://izzz.io
 */

/**
 * KeyValue that saves types
 */
class TypedKeyValue {

    constructor(name) {
        this.db = new KeyValue(name);
    }

    /**
     * Put value
     * @param key
     * @param value
     */
    put(key, value) {
        return this.db.put(key, JSON.stringify(value));
    }

    /**
     * Get value
     * @param key
     * @return {any}
     */
    get(key) {
        return JSON.parse(this.db.get(key));
    }

}