import { Payload } from "./types";
import fromParams from "./from-params";
import fromBody from "./from-body";
import fromQuery from "./from-query";
import fromLocals from "./from-locals";
/** */
const f: Payload = (req, res): [string, {}] => {
  const params = fromParams(req, res);
  const query = fromQuery(req, res);
  const body = fromBody(req, res);
  const locals = fromLocals(req, res);
  return [
    params[0] || query[0] || body[0] || locals[0],
    {
      ...query[1],
      ...params[1],
      ...body[1],
      ...locals[1]
    },
  ];
};
export default f;
