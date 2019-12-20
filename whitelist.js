const cluster = require('cluster');

if (cluster.isMaster) {
  cluster.fork();
  cluster.on('exit', (worker, code, signal) => { // eslint-disable-line
    cluster.fork();
  });
}
if (cluster.isWorker) {
  const http = require('http');
  const qs = require('querystring');
  const fs = require('fs');
  const got = require('got');
  const redirect = response => {
    response.writeHead(301, {Location: 'https://weibo.com/aerowindwalker'});
    response.end();
  }
  let pac = fs.readFileSync('./whitelist.pac');
  let promise;
  const whitelist = http.createServer();
  whitelist.on('request', (request, response) => {
    if (request.method !== 'GET' || request.url.indexOf('/whitelist') !== 0) {
      return redirect(response);
    }
    const querystr = request.url.split('?')[1];
    const { a } = qs.parse(querystr);
    if (!promise) {
      promise = got(
        'https://raw.githubusercontent.com/aeroxy/whitelist-pac-server/master/whitelist.pac',
        {timeout: 30000}
      ).then(res => {
        if (res.body) {
          pac = res.body;
        }
        promise = null;
      }).catch(e => { // eslint-disable-line
        // console.warn(e);
        promise = null;
      });
    }
    if (!a) {
      redirect(response);
    } else {
      response.writeHeader(200, {'Content-Type': 'text/html'});
      response.write(`var wall_proxy = "SOCKS5 ${a};SOCKS ${a};";${pac}`);
      response.end();
    }
  });
  whitelist.listen(1081);
}