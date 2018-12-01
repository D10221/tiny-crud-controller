import { Payload } from "./types";
import fromParams from "./from-params";
import fromBody from "./from-body";
/** */
const f: Payload = (req, res) => {
  if (req.params.id) return fromParams(req, res);
  if (req.query.id) return fromParams(req, res);
  return fromBody(req, res);
};
export default f;
