import { handle } from "@hono/node-server/vercel";
import app from "@stash/backend/src/app.js";

export default handle(app);