import Client from './Client';

/**
 * The GSF object provides an entry point to the SDK.
 * @example
 * const client = GSF.client({address:'MyServer',port:9191});
 *
 * @typedef {Object} GSF
 * @property {function(clientOptions: ClientOptions): Client} client - The function for creating a new Client object.
 */
export default {
  client(clientOptions) {
    return new Client(clientOptions);
  }
};
