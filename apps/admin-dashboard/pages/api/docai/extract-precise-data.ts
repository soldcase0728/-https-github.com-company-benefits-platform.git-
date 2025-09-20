import type { NextApiRequest, NextApiResponse } from 'next';
import { pipeline, Readable } from 'stream';
import getRawBody from 'raw-body';

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const backendUrl = process.env.DOC_AI_URL || 'http://localhost:9000/extract-precise-data';
  let fetchBody: ArrayBuffer | undefined = undefined;
  if (req.method === 'POST') {
    const raw = await getRawBody(req);
    // Copy to a new Uint8Array to guarantee ArrayBuffer
    const arr = new Uint8Array(raw);
    fetchBody = arr.buffer;
  }
  const response = await fetch(backendUrl, {
    method: req.method,
    headers: req.headers as any,
    body: fetchBody,
  });
  res.status(response.status);
  // Copy headers except for transfer-encoding and content-length (let Node handle it)
  response.headers.forEach((value, key) => {
    if (!['transfer-encoding', 'content-length', 'connection'].includes(key.toLowerCase())) {
      res.setHeader(key, value);
    }
  });
  if (response.body) {
    // Convert web ReadableStream to Node.js Readable
    // @ts-ignore
    const nodeStream = Readable.fromWeb ? Readable.fromWeb(response.body) : (response.body as any);
    pipeline(nodeStream, res, (err) => {
      if (err) {
        res.status(500).end('Proxy stream error');
      }
    });
  } else {
    res.end();
  }
}
