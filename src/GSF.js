import Server from 'Server';

/**
 * The GSF object provides an entry point to the SDK.
 * @example
 * const server = GSF.server({address:'MyServer',port:9191});
 *
 * @typedef {Object} GSF
 * @property {function(serverArgs: ServerArgs): Server} server - The function for creating a new Server object.
 */
export default {
  server(serverArgs) {
    return new Server(serverArgs);
  }
};
