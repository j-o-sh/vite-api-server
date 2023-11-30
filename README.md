# Vite Api Server

Create a simple api server as a vite plugin that is easy to maintain.

> **NOTE**
> The example usage below is to be considered a goal vor v1. It doesn't work yet ;)

`vite.config.js`
```js
import { plugin as server, pathParams } from 'vite-api-server'
import api from './api'

/** @type {import('vite').UserConfig} */
export default {
  plugins: [server({
    '/todos': { 
      get: json(api.list),
      post: jsonBodyParam(api.add)
    },
    [pathParams('/todos/[id]')]: {
      get: json(api.get),
      put: json(jsonBodyParam(api.change, { index: 1 })),
      delete: json(api.remove)
    }
  })]
}
export default
```


`api.js`
```js
/**
 * @typedef {description: string, done: boolean} Todo
 */

/**
 * @type {[id: string]: Todo}
 */
const todos = {}

export function list() {
  return todos
}

export function add(todo) {
  todos.push(todo)
}

export function get(id) {
  return todos[id]
}

export function change(id, todo) {
  todos[id] = todo
}

export function remove(id) {
  delete todos[id]
}
```

