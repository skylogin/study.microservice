const mysql = require("mysql");
var dbConfig = {
  host: "192.168.1.100",
  user: "micro",
  password: "service",
  database: "monolithic",
  port: 3306
};

const redis = require("redis").createClient();

redis.on_connect("error", function(err) {
  console.log("Redis Error " + err);
});

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

  if (params.userid === null || params.goodsid === null) {
    response.errorcode = 1;
    response.errormessage = "Invalid Parameters";
    cb(response);
  } else {
    redis.get(params.goodsid, (err, result) => {
      if (err || result === null) {
        response.errorcode = 1;
        response.errormessage = "Redis failure";
        cb(response);
        return;
      }

      let connection = mysql.createConnection(dbConfig);
      connection.connect();
      connection.query(
        "INSERT INTO purchases(userid, goodsid) VALUES(?, ?)",
        [params.userid, params.goodsid],
        (error, results, fields) => {
          if (error) {
            response.errorcode = 1;
            response.errormessage = error;
          }
          cb(response);
        }
      );

      connection.end();
    });
  }
}

function inquiry(method, pathname, params, cb) {
  let response = {
    key: params.key,
    errorcode: 0,
    errormessage: "success"
  };

  if (params.userid === null) {
    response.errorcode = 1;
    response.errormessage = "Invalid Parameters";
    cb(response);
  } else {
    let connection = mysql.createConnection(dbConfig);
    connection.connect();
    connection.query(
      "SELECT id, goodsid, date FROM purchases WHERE userid = ?",
      [params.userid],
      (error, results, fields) => {
        if (error || results.length === 0) {
          response.errorcode = 1;
          response.errormessage = error;
        } else {
          response.results = results;
        }
        cb(response);
      }
    );
  }
}
