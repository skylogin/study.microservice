const mysql = require("mysql");
const conn = {
  host: "localhost",
  user: "micro",
  password: "service",
  database: "monolithic"
};

exports.onRequest = function(res, method, pathname, params, cb) {
  switch (method) {
    case "POST":
      return register(method, pathname, params, response => {
        process.nextTick(cb, res, response);
      });
    case "GET":
      return inquiry(method, pathname, params, response => {
        process.nextTick(cb, res, response);
      });
    case "DELETE":
      return unregister(method, pathname, params, response => {
        process.nextTick(cb, res, response);
      });
    default:
      return process.nextTick(cb, res, response);
  }
};

function register(method, pathname, params, cb) {
  let response = {
    key: params.key,
    errorcode: 0,
    errormessage: "success"
  };

  if (params.username === null || params.password === null) {
    response.errorcode = 1;
    response.errormessage = "Invalid Parameters";
    cb(response);
  } else {
    let connection = mysql.createConnection(conn);
    connection.connect();
    connection.query(
      "INSERT INTO members(username, password) VALUES('" +
        params.username +
        "', password('" +
        params.password +
        "'));",
      (error, results, fields) => {
        if (error) {
          response.errorcode = 1;
          response.errormessage = error;
        }
        cb(response);
      }
    );
    connection.end();
  }
}

function inquiry(method, pathname, params, cb) {
  let response = {
    key: params.key,
    errorcode: 0,
    errormessage: "success"
  };

  if (params.username === null || params.password === null) {
    response.errorcode = 1;
    response.errormessage = "Invalid Parameters";
    cb(response);
  } else {
    let connection = mysql.createConnection(conn);
    connection.connect();
    connection.query(
      "SELECT id FROM members WHERE username = '" +
        params.username +
        "' AND password = password('" +
        params.password +
        "');",
      (error, results, fields) => {
        if (error || results.length === 0) {
          response.errorcode = 1;
          response.errormessage = error ? error : "invalid password";
        } else {
          response.userid = results[0].id;
        }
        cb(response);
      }
    );
  }
}

function unregister(method, pathname, params, cb) {
  let response = {
    key: params.key,
    errorcode: 0,
    errormessage: "success"
  };

  if (params.username === null) {
    response.errorcode = 1;
    response.errormessage = "Invalid Parameters";
    cb(response);
  } else {
    let connection = mysql.createConnection(conn);
    connection.connect();
    connection.query(
      "DELETE FROM members WHERE username = '" + params.username + "';",
      (error, results, fields) => {
        if (error) {
          response.errorcode = 1;
          response.errormessage = error;
        }
        cb(response);
      }
    );
    connection.end();
  }
}
