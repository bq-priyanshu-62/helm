const http = require('http');
const url = require('url');
const os = require('os');
const ws = require('ws');
const hostname = os.hostname();
const region = process.env.REGION || 'Undefined';
const cluster = process.env.CLUSTER_NAME || 'Undefined';
const allowSleep = process.env.ALLOW_SLEEP || false;
const keepAliveTimeoutSeconds = process.env.KEEP_ALIVE_TIMEOUT_SECONDS || undefined;

const CONTENT_TYPE = {'Content-Type': 'application/json'};

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function generateRandomArray(sizeInBytes) {
  const RANDOM_NUMBER = Math.floor(Math.random() * 1000);
  const NUMBER_SIZE = Buffer.byteLength(RANDOM_NUMBER.toString()) + 1;
  console.log(NUMBER_SIZE, sizeInBytes/NUMBER_SIZE);
  return Array.from({length: sizeInBytes/NUMBER_SIZE}, () => RANDOM_NUMBER);
}

const MB = 1024 * 1024 * 1024;
const MAX_SIZE_IN_BYTES = MB * 100;

let isShuttingDown = false;

const app = http.createServer(async (req, res) => {
    if (req.url === '/healthcheck') { // handle healthcheck request
      //if we're shutting down then return an error code
      if (isShuttingDown) {
        res.writeHead(503, CONTENT_TYPE);
        res.end('SHUTTING DOWN');
        return;
      }
      res.writeHead(200, CONTENT_TYPE);
      res.end('OK');
      return;
    }

    const queryParse = url.parse(req.url, true).query;
    const sleepTime = queryParse.sleep;
    if (allowSleep && sleepTime) {
        await sleep(sleepTime * 1000);
    }
    const randomBytesSize = queryParse.randomBytesSize;
    let additionalRandomLoad = []
    let additionalRandomLoadSizeInKB = 0;
    if (randomBytesSize && randomBytesSize <= MAX_SIZE_IN_BYTES) {
      additionalRandomLoad = generateRandomArray(randomBytesSize);
      additionalRandomLoadSizeInKB = Math.floor(Buffer.byteLength(additionalRandomLoad.toString())/1024);
    } else if(randomBytesSize && randomBytesSize > MAX_SIZE_IN_BYTES) {
      additionalRandomLoad = ["MAX_SIZE_ALLOWED_IN_BYTES: " + MAX_SIZE_IN_BYTES];
    }

    const buffers = [];

    for await (const chunk of req) {
      buffers.push(chunk);
    }

    const body = Buffer.concat(buffers).toString();

    res.writeHead(200, CONTENT_TYPE);
    const response =
      JSON.stringify({
        message: 'OK',
        timestamp: `${new Date().toISOString()}`,
        region: `${region}`,
        cluster: `${cluster}`,
        hostname: `${hostname}`,
        requestHeaders: req.headers,
        requestBody: body,
        additionalRandomLoadSizeInKB: additionalRandomLoadSizeInKB + " KB",
        additionalRandomLoad: additionalRandomLoad,
      });
    res.end(response);
});

if (keepAliveTimeoutSeconds !== undefined && !isNaN(parseInt(keepAliveTimeoutSeconds))) {
    const timeoutSeconds = parseInt(keepAliveTimeoutSeconds);
    app.keepAliveTimeout = timeoutSeconds * 1000;
    console.log(`Updated keep-alive timeout: ${timeoutSeconds} seconds`);
}

const wss = new ws.WebSocketServer({ server: app });
const ws_allowed_paths = [
  '/gateway/ws',
  '/gateway/ws-protected'
]

wss.on('connection', function connection(ws, req) {
  if(!ws_allowed_paths.some(s => req.url.startsWith(s))) {
    ws.close();
  }

  ws.on('message', function message(data) {
    let returnData = {
      hostname,
      region,
      cluster, 
      path: req.url,
      headers: req.headers,
      data: `${data}`
    }
    ws.send(JSON.stringify(returnData));
  });

  ws.send('connected to server');
});

app.listen(8080, () => {
  console.log(`Server listening on port: ${app.address().port}`);
});

app.on('error', err => {
  console.log(`HTTP server error: ${JSON.stringify(err)}`);
});

process.on ('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down...');
  isShuttingDown = true;
  setTimeout(() => {
    console.log('Graceful shutdown complete.');
    process.exit(0);
  }, 30000); // wait for 30 seconds before actually stopping the server
});
