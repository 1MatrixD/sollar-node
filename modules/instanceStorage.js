/**
 iZ³ | Izzzio blockchain - https://izzz.io
 @author: IZZZIO, LLC - https://izzz.io
 */

/**
 * Instance and mutex storage - in process storage
 *
 */


let storage = {};

module.exports = {
    /**
     * Put data to storage
     * @param {string} name
     * @param value
     */
    put: function (name, value) {
        storage[String(name)] = value;
    },

    /**
     * Get data from storage
     * @param {string} name
     * @return {*}
     */
    get: function (name) {

        if(typeof name === 'undefined') {
            return storage;
        }

        if(typeof storage[String(name)] !== 'undefined') {
            return storage[String(name)];
        }

        return null;
    }
};

