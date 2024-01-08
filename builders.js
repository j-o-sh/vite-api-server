/**
 * uses the query parameters from the request as parameters to the data
 * function and provides the response as JSON.
 *
 * @param {Function} dataFn - Create a respone object based on the query 
 * parameters
 * @param {boolean} queryOpts.multi - Whether to allow multiple values for a
 * single query parameter. Default is false.
 * @param {Array} queryOpts.numbers - An array of query parameter names that
 * should be parsed as numbers. Default is an empty array.
 * @returns {Function} - An async function that handles the request and sends
 * the JSON response.
 */
export function queryToJson(dataFn, queryOpts = {}) {
  return async (req, res) => {
    const q = query(req, queryOpts)
    res.end(JSON.stringify(await dataFn(q)))
  }
}

/**
 * Parses the query parameters from the request URL and returns an object 
 * containing the parsed values.
 *
 * @param {Object} req - The request object.
 * @param {Object} options - The options object.
 * @param {boolean} options.multi - Whether to allow multiple values for a
 * single query parameter. Default is false.
 * @param {Array} options.numbers - An array of query parameter names that
 * should be parsed as numbers. Default is an empty array.
 * @returns {Object} - An object containing the parsed query parameters.
 */
function query(req, { multi = false, numbers = [] } = {}) {
  const queryStr = req.url.split('?').at(1)
  if (!queryStr) return {}

  function value(k, v) {
    return v && numbers.includes(k) ? Number(v) : v
  }

  const qSrc = queryStr && new URLSearchParams(queryStr)
  const q = {}
  for (const [k, v] of qSrc.entries()) {
    q[k] = !multi ? value(k, v) : [...(q[k] || []), value(k, v)]
  }
  return q
}

