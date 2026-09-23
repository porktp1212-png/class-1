 import { handleApiRequest } from "../server/apiRouter.ts";

export default async function handler(req: any, res: any) {
  const handled = await handleApiRequest(req, res);

  if (!handled && !res.headersSent) {
    res.statusCode = 404;
    res.end("API route not found");
  }
}
