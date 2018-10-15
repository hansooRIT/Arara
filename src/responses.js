// Making initial room objects to store message logs.
const messages = {
  Room1: {
    messageLog: [],
  },
  Room2: {
    messageLog: [],
  },
  Room3: {
    messageLog: [],
  },
};

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

// Function to return the messages object to display back to the screen.
const getMessages = (request, response) => {
  const responseJSON = {
    messages,
  };
  respondJSON(request, response, 200, responseJSON);
};

const getMessagesMeta = (request, response) => {
  respondJSONMeta(request, response, 200);
};

// Function to create a new message within the messages object.
const sendMessage = (request, response, body) => {
  let responseJSON = {
    message: 'Username and message text are both required',
  };

  const responseCode = 201;

  // If the body lacks the necessary parameters, we send a 400 and get out.
  if (!body.user || !body.message) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  // Otherwise, parse the information and add to the messages
  // object with the corresponding room number.
  messages[body.room].messageLog[Object.keys(messages[body.room]
    .messageLog).length] = {};
  messages[body.room].messageLog[Object.keys(messages[body.room]
    .messageLog).length - 1].user = body.user;
  messages[body.room].messageLog[Object.keys(messages[body.room]
    .messageLog).length - 1].message = body.message;

  // Parsing and formatting for the timestamp due to Javascript yielding odd numbers for time.
  const time = new Date();
  let month = time.getMonth() + 1;
  let day = time.getDate();
  const year = time.getYear() - 100;
  let minutes = time.getMinutes();
  let hours = time.getHours();
  let AmPm = '';
  if (time.getMonth() + 1 < 10) {
    month = `0${time.getMonth()}${1}`;
  }
  if (time.getDate() < 10) {
    day = `0${time.getDate()}`;
  }
  if (time.getMinutes() < 10) {
    minutes = `0${time.getMinutes()}`;
  }
  if (time.getHours < 12) {
    AmPm = 'AM';
  } else {
    hours -= 12;
    AmPm = 'PM';
  }
  const parseDate = `${month}/${day}/${year}`;
  const parseTime = `${hours}:${minutes} ${AmPm}`;
  const dateTime = `${parseDate} at ${parseTime}`;
  messages[body.room].messageLog[Object.keys(messages[body.room]
    .messageLog).length - 1].timeStamp = dateTime;
  responseJSON = messages[body.room].messageLog[Object.keys(messages[body.room]
    .messageLog).length - 1];
  if (responseCode === 201) {
    return respondJSON(request, response, responseCode, responseJSON);
  }
  return respondJSONMeta(request, response, responseCode);
};

// Function that updates messages in that room with a new username.
const updateUser = (request, response, body) => {
  const responseJSON = {
    message: 'Username field is required',
  };

  const responseCode = 204;

  if (!body.oldUser || !body.newUser) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  for (let i = 0; i < messages.Room1.messageLog.length; i++) {
    if (messages.Room1.messageLog[i].user === body.oldUser) {
      messages.Room1.messageLog[i].user = body.newUser;
    }
  }
  for (let j = 0; j < messages.Room2.messageLog.length; j++) {
    if (messages.Room2.messageLog[j].user === body.oldUser) {
      messages.Room2.messageLog[j].user = body.newUser;
    }
  }
  for (let k = 0; k < messages.Room3.messageLog.length; k++) {
    if (messages.Room3.messageLog[k].user === body.oldUser) {
      messages.Room3.messageLog[k].user = body.newUser;
    }
  }
  return respondJSONMeta(request, response, responseCode);
};

// Function to retrieve messages that have the specified parameter within the body.
const filterMessages = (request, response, body) => {
  let responseJSON = {
    message: 'Search parameters are required',
  };

  const responseCode = 200;
  const searchList = {
    messageLog: [],
  };

  // Exit out if the body lacks any of the necessary parameters.
  if (!body.type || !body.room || !body.searchParam) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  // Otherwise, search through the message logs for any messages that match the specifications.
  switch (body.type) {
    case ('byMessage'):
      for (let i = 0; i < messages[body.room].messageLog.length; i++) {
        if (messages[body.room].messageLog[i].message.includes(body.searchParam)) {
          searchList.messageLog[Object.keys(searchList.messageLog)
            .length] = messages[body.room].messageLog[i];
        }
      }
      break;
    case ('byUser'):
      for (let j = 0; j < messages[body.room].messageLog.length; j++) {
        if (messages[body.room].messageLog[j].user.includes(body.searchParam)) {
          searchList.messageLog[Object.keys(searchList.messageLog)
            .length] = messages[body.room].messageLog[j];
        }
      }
      break;
    case ('byDate'):
      for (let k = 0; k < messages[body.room].messageLog.length; k++) {
        if (messages[body.room].messageLog[k].timeStamp.includes(body.searchParam)) {
          searchList.messageLog[Object.keys(searchList.messageLog)
            .length] = messages[body.room].messageLog[k];
        }
      }
      break;
    default:
      break;
  }
  // If there were no matching results in the messageLogs, return
  // a JSON object that states that the term had no matches.
  if (searchList.messageLog.length <= 0) {
    responseJSON = {
      message: 'Search term had no matches',
      id: 'noMatchingResults',
    };
  }
  // Otherwise, return the found values.
  responseJSON = searchList;
  return respondJSON(request, response, responseCode, responseJSON);
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
  updateUser,
  sendMessage,
  filterMessages,
  notFound,
  notFoundMeta,
};
