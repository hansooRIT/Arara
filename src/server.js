const http = require('http'); // http module
const url = require('url'); // url module
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const responseHandler = require('./responses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const handlePost = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/sendMessage') {
    const body = [];

    request.on('error', (err) => {
      console.dir(err);
      response.statusCode = 400;
      response.end();
    });

    request.on('data', (chunk) => {
      body.push(chunk);
    });

    request.on('end', () => {
      const bodyString = Buffer.concat(body).toString();
      const bodyParams = query.parse(bodyString);

      responseHandler.sendMessage(request, response, bodyParams);
    });
  }
  else if (parsedUrl.pathname === '/updateUser') {
    const body = [];

    request.on('error', (err) => {
      console.dir(err);
      response.statusCode = 400;
      response.end();
    });

    request.on('data', (chunk) => {
      body.push(chunk);
    });

    request.on('end', () => {
      const bodyString = Buffer.concat(body).toString();
      const bodyParams = query.parse(bodyString);

      responseHandler.updateUser(request, response, bodyParams);
    });
  }
  else if (parsedUrl.pathname === '/filterMessages') {
    const body = [];

    request.on('error', (err) => {
      console.dir(err);
      response.statusCode = 400;
      response.end();
    });

    request.on('data', (chunk) => {
      body.push(chunk);
    });

    request.on('end', () => {
      const bodyString = Buffer.concat(body).toString();
      const bodyParams = query.parse(bodyString);

      responseHandler.filterMessages(request, response, bodyParams);
    });
  }
};

const handleGet = (request, response, parsedUrl) => {
  switch (parsedUrl.pathname) {
    case '/getMessages':
      responseHandler.getMessages(request, response);
      break;
    case '/notReal':
      responseHandler.notFound(request, response);
      break;
    case '/':
      htmlHandler.getIndex(request, response);
      break;
    case '/style.css':
      htmlHandler.getCSS(request, response);
      break;
    case '/bundle.js':
      htmlHandler.getJS(request, response);
      break;
    case '/tempicon.png':
      htmlHandler.getIcon(request, response); 
      break;
    default:
      responseHandler.notFound(request, response);
      break;
  }
};

const handleHead = (request, response, parsedUrl) => {
  switch (parsedUrl.pathname) {
    case '/getMessages':
      responseHandler.getMessagesMeta(request, response);
      break;
    case '/notReal':
      responseHandler.notFoundMeta(request, response);
      break;
    default:
      responseHandler.notFoundMeta(request, response);
      break;
  }
};

// function to handle requests
const onRequest = (request, response) => {
  // parse url into individual parts
  // returns an object of url parts by name
  const parsedUrl = url.parse(request.url);

  switch (request.method) {
    case 'GET':
      handleGet(request, response, parsedUrl);
      break;
    case 'HEAD':
      handleHead(request, response, parsedUrl);
      break;
    case 'POST':
      handlePost(request, response, parsedUrl);
      break;
    default:
      break;
  }
};

// start server
http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1:${port}`);
