/**
 * @typedef {(...params: string[]) => any} HandlerFunction
 * @typedef {Object.<string|RegExp, {
 *   [method: string]: HandlerFunction
 * }>} ApiObject
 */

import { where } from './kraken'

/**
 */
function toPathMatcher([key, handler]) {
  console.log('🐯', key, typeof key)
  if (typeof key.exec === 'function') {
    return clue => {
      const match = key.exec(clue)
      console.log('😎', clue, key, match)
      return match && [handler, match.slice(1)]
    }
  } else {
    return clue => {
      console.log('😳', clue, key, clue.startsWith(key))
      return clue.startsWith(key) && [handler]
    }
  } 
}

/**
 * creates a binding function to bind request urls against the defined api
 * endpoints
 *
 * @param {ApiObject} api - The API definition object.
 * @returns {(path: string) => [HandlerFunction?, string[]?]}
 */
function createBindings(api) {
  const matchers = Object.entries(api).reverse().map(toPathMatcher)
  
  return path => {
    for (let matcher of matchers) {
      const match = matcher(path)
      if (match) return match
    }
    return []
  }
}

function cleanPaths(api) {
  return Object.fromEntries(Object.entries(api)
    .map(where(([k]) => typeof k === 'string' && k.endsWith('/'), ([k, v]) => [k.slice(0, -1), v]))
  )
}

/**
 * @param {Object.<string|RegExp, {
 *   [method: string]: ((params?: Record<string, string|string[]>|undefined) => any)
 * }>} api - The API definition object.
 */
function apiServer(api) {
  const cleanApi = cleanPaths(api)
  const bind = createBindings(cleanApi)
  console.info('🦑 ', cleanApi)

  /**
   * api server handler
   *
   * @param {import('http').IncomingMessage} req - The HTTP request object.
   * @param {import('http').ServerResponse} res - The HTTP response object.
   * @param {function} next - The next middleware function in the chain.
   * @returns {void}
   */
  return function handle(req, res, next) {
    const { url, method } = req
    const [endpoint, matches = []] = bind(url)
    const endWithStatus = (code, payload) => {
        console.error('😡', payload)
        res.statusCode = code
        res.end(`${payload}`)
    }

    if (endpoint) {
      try {
        const handler = endpoint[method.toLowerCase()]
        console.info('✨ ', method, '\t', url, matches, endpoint)

        if (handler) {
          try {
            handler(req, res)
          } catch (e) { endWithStatus(500, e) } 
        } else {
          endWithStatus(400, '👮')
        }
      } catch (e) {
        endWithStatus(500, e)
      }
    } else {
      next()
    }
  }
}

export default function viteKrakenServer(api) {
  return {
    name: 'vite-api-server',
    configureServer(server) {
      server.middlewares.use(apiServer(api))
    },
  }
}
