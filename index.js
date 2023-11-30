/**
 * Creates a server handler, based on the given api object
 *
 * @typedef {import('http').IncomingMessage} Request - The HTTP request object.
 * @typedef {import('http').ServerResponse} Response - The HTTP response object.
 *
 * @param {Record<string, Record<string, (req: Request, res: Response) => Promise<void>>>} api
 * @returns {(req: Request, res: Response, next: function) => void}
 */
function apiServer(api) {
  return (req, res, next) => {
    const { url, method } = req
    if (api[url] && api[url][method.toLowerCase()]) {
      // console.log('💀', url, method)
      api[url][method.toLowerCase()](req, res, next)
    } else {
      next()
    }
  }

}

export default function viteServer(api) {
  return {
    name: 'vite-server',
    configureServer(server) {
      // console.log('🫶 here we go', api)
      server.middlewares.use(apiServer(api))
    },
  }
}
