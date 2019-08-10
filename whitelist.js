const cluster = require('cluster');

if (cluster.isMaster) {
  cluster.fork();
  cluster.on('exit', function(worker, code, signal) {
    cluster.fork();
  });
}
if (cluster.isWorker) {
  const http = require('http');
  const qs = require('querystring');
  const fs = require('fs');
  const redirect = response => {
    response.writeHead(301, {Location: 'https://www.baidu.com'});
    response.end();
  }
  const whitelist = http.createServer();
  whitelist.on('request', (request, response) => {
    if (request.method !== 'GET' || request.url.indexOf('/whitelist') !== 0) {
      return redirect(response);
    }
    const querystr = request.url.split('?')[1];
    const { a } = qs.parse(querystr);
    fs.readFile('./whitelist.pac', (err, pac) => {
      if (err || !a) {
        redirect(response);
      } else {
        response.writeHeader(200, {'Content-Type': 'text/html'});
        response.write(`var wall_proxy = "SOCKS5 ${a};SOCKS ${a};";${pac}`);
        response.end();
      }
    });
  });
  whitelist.listen(1081);
}