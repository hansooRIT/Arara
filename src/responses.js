const messages = {};
let time = new Date();

// function to respond with a json object
// takes request, response, status code and object to send
const respondJSON = (request, response, status, object) => {
  response.writeHead(status, {
    'Content-Type': 'application/json',
  });
  response.write(JSON.stringify(object));
  response.end();
};

const respondJSONMeta = (request, response, status) => {
  response.writeHead(status, {
    'Content-Type': 'application/json',
  });
  response.end();
};

const getMessages = (request, response) => {
  const responseJSON = {
    messages,
  };
  respondJSON(request, response, 200, responseJSON);
};

const getMessagesMeta = (request, response) => {
  respondJSONMeta(request, response, 200);
};

const sendMessage = (request, response, body) => {
  let responseJSON = {
    message: 'Username and message text are both required',
  };

  const responseCode = 201;

  if (!body.user || !body.message) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  console.log(Object.keys(messages).length);
  messages[Object.keys(messages).length] = {};
  messages[Object.keys(messages).length - 1].user = body.user;
  messages[Object.keys(messages).length - 1].message = body.message;
  time = new Date();
  messages[Object.keys(messages).length - 1].timeStamp = time.getTime();
  responseJSON = messages[Object.keys(messages).length - 1];

  if (responseCode === 201) {
    return respondJSON(request, response, responseCode, responseJSON);
  }
  return respondJSONMeta(request, response, responseCode);
};

// function for 404 not found requests with message
const notFound = (request, response) => {
  // create error message for response
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };

  return respondJSON(request, response, 404, responseJSON);
};

const notFoundMeta = (request, response) => respondJSONMeta(request, response, 404);


// set public modules
module.exports = {
  getMessages,
  getMessagesMeta,
  sendMessage,
  notFound,
  notFoundMeta,
};
