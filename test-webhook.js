const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/aifadian/webhook',
  method: 'POST'
};

const req = http.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`);

  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.end();