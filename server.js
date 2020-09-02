/*
Hello! This is a learning API that works in conjunction with Postman templates.

Import the relevant collection into Postman and send a request to the setup endpoint to begin.

This Glitch app is based on hello-express and low-db.

Below you'll see the code for the endpoints in the API after some initial setup processing
  - each endpoint begins "app." followed by get, post, patch, put, or delete, then the endpoint path, e.g. /cat
  - the user-id is passed in the header from the Postman template

API includes submission endpoint for sending a collection link plus collection run output
  - admin collection script automates testing of content
*/

/*
response structure:

{
    welcome:
      "Welcome! Check out the 'data' object below to see the values returned by the API. Click **Visualize** to see the 'tutorial' data " +
      "for this request in a more readable view.",
    data: {
      cat: {
        name: "Syd",
        humans: 9
      }
    },
    tutorial: {
      title: "You did a thing! 🚀",
      intro: "Here is the _intro_ to this **lesson**...",
      steps: [
        {
          note: "Here is a step with `code` in it...",
          pic:
            "https://assets.postman.com/postman-docs/postman-app-overview-response.jpg",
          raw_data: {
            cat: {
              name: "Syd",
              humans: 9
            }
          }
        }
      ],
      next: [
      {
        step: "Now do this...",
        pic:
          "https://assets.postman.com/postman-docs/postman-app-overview-response.jpg",
        raw_data: {
          cat: {
            name: "Syd",
            humans: 9
          } 
        }
      }
      ]
    }
  }
*/

var express = require("express");
var bodyParser = require("body-parser");
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var low = require("lowdb");
var FileSync = require("lowdb/adapters/FileSync");
var adapter = new FileSync(".data/db.json");
var db = low(adapter);
const shortid = require("shortid");

db.defaults({
  customers: [
    {
      id: shortid.generate(),
      name: "Blanche Devereux",
      type: "Individual",
      admin: "postman"
    },
    {
      id: shortid.generate(),
      name: "Rose Nylund",
      type: "Individual",
      admin: "postman"
    },
    {
      id: shortid.generate(),
      name: "Shady Pines",
      type: "Company",
      admin: "postman"
    }
  ],
  calls: []
}).write();

//reusable response parts

//generic welcome
var welcomeMsg =
  "You're using the " +
  process.env.PROJECT +
  " training course! Check out the 'data' object below to see the values returned by this API request. " +
  "Click **Visualize** to see the 'tutorial' guiding you through next steps - do this for every request in the collection!";

//unauthorized
var unauthorizedMsg = {
  welcome: welcomeMsg,
  tutorial: {
    title: "Your request is unauthorized! 🚫",
    intro: "This endpoint requires authorization.",
    steps: [
      {
        note:
          "In **Auth** select **API Key** from the drop-down, enter `auth_key` as the **Key** and any text you like as the **Value**. " +
          "Make sure you are adding to the **Header**."
      }
    ],
    next: [
      {
        step: "With your auth key in place, click **Send** again."
      }
    ]
  }
};

//invalid route
var invalidMsg = {
  welcome: welcomeMsg,
  tutorial: {
    title: "Your request is invalid! 🚧",
    intro:
      "Oops this isn't a valid endpoint! " +
      "Try undoing your changes or closing the request without saving and opening it again from the collection on the left of Postman."
  }
};

//base url
app.get("/", function(req, res) {
  var newDate = new Date();
  db.get("calls")
    .push({
      when: newDate.toDateString() + " " + newDate.toTimeString(),
      where: "GET /",
      what: "-"
    })
    .write();
  if (req.headers["user-agent"].includes("Postman"))
    res.status(200).json({
      welcome: welcomeMsg,
      tutorial: {
        title: process.env.PROJECT,
        intro:
          "Use the " +
          process.env.PROJECT +
          " template in Postman to learn API basics! Import the collection in Postman by clicking " +
          "New > Templates, and searching for '" +
          process.env.PROJECT +
          "'. Open the first request in the collection and click Send. " +
          "To see the API code navigate to https://glitch.com/edit/#!/" +
          process.env.PROJECT_DOMAIN +
          " in your web browser!"
      }
    });
  else
    res.send(
      "<h1>" +
        process.env.PROJECT +
        "</h1><p>Oh, hi! There's not much to see here - view the code instead:</p>" +
        '<script src="https://button.glitch.me/button.js" data-style="glitch"></script><div class="glitchButton" style="position:fixed;top:20px;right:20px;"></div>'
    );
});

//get all customers
app.get("/customers", function(req, res) {
  var newDate = new Date();
  db.get("calls")
    .push({
      when: newDate.toDateString() + " " + newDate.toTimeString(),
      where: "GET /customers",
      what: req.get("user-id")
    })
    .write();
  var customers = db
    .get("customers")
    .filter(c => c.admin === "postman" || c.admin === req.get("user-id"))
    .value()
    .map(r => {
      return { id: r.id, name: r.name, type: r.type };
    });
  res.status(200).json({
    welcome: welcomeMsg,
    data: {
      customers: customers
    },
    tutorial: {
      title: "You sent a request! 🚀",
      intro:
        "Your request used `GET` method and sent to the `/customers` path.",
      steps: [
        {
          note: "The API returned JSON data including an array of customers:",
          raw_data: {
            customers: customers
          }
        }
      ],
      next: [
        {
          step:
            "Now open the next `GET` request in the collection `Get one customer` and click **Send**."
        }
      ]
    }
  });
});

//get request with query param for customer id
app.get("/customer", function(req, res) {
  if (!req.query.id) {
    var newDate = new Date();
    db.get("calls")
      .push({
        when: newDate.toDateString() + " " + newDate.toTimeString(),
        where: "GET /customer",
        what: req.get("user-id")
      })
      .write();
    res.status(404).json({
      welcome: welcomeMsg,
      tutorial: {
        title: "Your request is missing some info! 😕",
        intro: "This endpoint requires you to specify a customer.",
        steps: [
          {
            note:
              "In **Params** add `id` in the **Key** column, and one of the `id` values from the customer list as the **Value**."
          }
        ],
        next: [
          {
            step:
              "With your parameter in place (you'll see e.g. `?id=abc123` added to the request address), click **Send** again."
          }
        ]
      }
    });
  } else {
    var newDate = new Date();
    db.get("calls")
      .push({
        when: newDate.toDateString() + " " + newDate.toTimeString(),
        where: "GET /customer",
        what: req.get("user-id") + " " + req.query.id
      })
      .write();
    var customerRecord = db
      .get("customers")
      .find({ id: req.query.id })
      .value();
    if (customerRecord) {
      var customer = {
        id: customerRecord.id,
        name: customerRecord.name,
        type: customerRecord.type
      };
      res.status(200).json({
        welcome: welcomeMsg,
        data: {
          customer: customer
        },
        tutorial: {
          title: "You sent a request with a query parameter! 🎉",
          intro:
            "Your request used the `id` parameter to retrieve a specific customer.",
          steps: [
            {
              note: "The API returned a JSON object representing the customer:",
              raw_data: {
                customer: customer
              }
            }
          ],
          next: [
            {
              step:
                "Now open the next request in the collection `POST Add new customer` and click **Send**."
            }
          ]
        }
      });
    } else {
      res.status(404).json({
        welcome: welcomeMsg,
        tutorial: {
          title: "Your request contains invalid info! 😕",
          intro: "This endpoint requires the `id` for a valid customer.",
          steps: [
            {
              note:
                "In **Params** add `id` in the **Key** column, and the ID of any customer you see in the array when you " +
                "send the `Get all customers` request)."
            }
          ],
          next: [
            {
              step:
                "With your parameter in place (you'll see e.g. `?id=abc123` added to the request address), click **Send** again."
            }
          ]
        }
      });
    }
  }
});

//add new customer
app.post("/customer", function(req, res) {
  var newDate = new Date();
  db.get("calls")
    .push({
      when: newDate.toDateString() + " " + newDate.toTimeString(),
      where: "POST /customer",
      what: req.get("user-id") + " " + req.body.name
    })
    .write();
  const apiSecret = req.get("auth_key");
  if (!apiSecret) res.status(401).json(unauthorizedMsg);
  else if (!req.body.name || !req.body.type)
    res.status(400).json({
      welcome: welcomeMsg,
      tutorial: {
        title: "Your request is incomplete! ✋",
        intro:
          "This endpoint requires body data representing the new customer.",
        steps: [
          {
            note:
              "In **Body** select **raw** and choose **JSON** instead of `Text` in the drop-down list. Enter the following JSON data " +
              "including the enclosing curly braces:",
            raw_data: {
              name: "Dorothy Zbornak",
              type: "Individual"
            }
          }
        ],
        next: [
          {
            step: "With your body data in place, click **Send** again."
          }
        ]
      }
    });
  else {
    var adminId = req.get("user-id") ? req.get("user-id") : "anonymous";

    db.get("customers")
      .push({
        id: shortid.generate(),
        name: req.body.name,
        type: req.body.type,
        admin: adminId
      })
      .write();
    res.status(201).json({
      welcome: welcomeMsg,
      tutorial: {
        title: "You added a new customer! 🏅",
        intro: "Your new customer was added to the database.",
        steps: [
          {
            note:
              "Go back into the first request you opened `Get all customers` and **Send** it again before returning here—" +
              "you should see your new addition in the array! _Note that this will only work if you're using the Postman template._"
          }
        ],
        next: [
          {
            step:
              "Next open the `PUT Update customer` request and click **Send**."
          }
        ]
      }
    });
  }
});

//update customer
app.put("/customer/:cust_id", function(req, res) {
  var newDate = new Date();
  db.get("calls")
    .push({
      when: newDate.toDateString() + " " + newDate.toTimeString(),
      where: "POST /customer",
      what: req.get("user-id") + " " + req.body.name + " " + req.params.cust_id
    })
    .write();
  const apiSecret = req.get("auth_key");
  if (!apiSecret) res.status(401).json(unauthorizedMsg);
  else if (req.params.cust_id == "placeholder")
    res.status(400).json({
      welcome: welcomeMsg,
      tutorial: {
        title: "Your request is incomplete! ✋",
        intro:
          "This endpoint requires an ID representing the customer to update.",
        steps: [
          {
            note:
              "This request includes a path parameter with `/:customer_id` at the end of the request address—open **Params** and replace " +
              "`placeholder` with the `id` of a customer you added when you sent the `POST` request. Copy the `id` from the response in the " +
              "`Get all customers` request. ***You can only update a customer you added.***"
          }
        ],
        next: [
          {
            step:
              "With your customer ID parameter in place, click **Send** again."
          }
        ]
      }
    });
  else if (!req.body.name || !req.body.type)
    res.status(400).json({
      welcome: welcomeMsg,
      tutorial: {
        title: "Your request is incomplete! ✋",
        intro:
          "This endpoint requires body data representing the updated customer details.",
        steps: [
          {
            note:
              "In **Body** select **raw** and choose **JSON** instead of `Text` in the drop-down list. Enter the following JSON data " +
              "including the enclosing curly braces:",
            raw_data: {
              name: "Sophia Petrillo",
              type: "Individual"
            }
          }
        ],
        next: [
          {
            step: "With your body data in place, click **Send** again."
          }
        ]
      }
    });
  else {
    var adminId = req.get("user-id") ? req.get("user-id") : "anonymous";

    var updateCust = db
      .get("customers")
      .find({ id: req.params.cust_id })
      .value();
    if (updateCust && adminId != "postman" && updateCust.admin == adminId) {
      db.get("customers")
        .find({ id: req.params.cust_id })
        .assign({ name: req.body.name, type: req.body.type, admin: adminId })
        .write();

      res.status(201).json({
        welcome: welcomeMsg,
        tutorial: {
          title: "You updated a customer! ✅",
          intro: "Your customer was updated in the database.",
          steps: [
            {
              note:
                "Go back into the first request you opened `Get all customers` and **Send** it again before returning here—" +
                "you should see your updated customer in the array!"
            }
          ],
          next: [
            {
              step:
                "Next open the `DEL Remove customer` request and click **Send**."
            }
          ]
        }
      });
    } else {
      res.status(400).json({
        welcome: welcomeMsg,
        tutorial: {
          title: "Your request is invalid! ⛔",
          intro:
            "You can only update customers you added using the `POST` method during the current session (and that haven't been deleted).",
          steps: [
            {
              note:
                "This request includes a path parameter with `/:customer_id` at the end of the request address—open **Params** and replace " +
                "`placeholder` with the `id` of a customer you added when you sent the `POST` request. Copy the `id` from the response in the " +
                "`Get all customers` request. ***You can only update a customer you added.***"
            }
          ],
          next: [
            {
              step:
                "With the ID parameter for a customer _you added_ during this session in place, click **Send** again."
            }
          ]
        }
      });
    }
  }
});

//delete customer
app.delete("/customer/:cust_id", function(req, res) {
  var newDate = new Date();
  db.get("calls")
    .push({
      when: newDate.toDateString() + " " + newDate.toTimeString(),
      where: "DEL /customer",
      what: req.get("user-id") + " " + req.params.cust_id
    })
    .write();
  const apiSecret = req.get("auth_key");
  if (!apiSecret) res.status(401).json(unauthorizedMsg);
  else if (req.params.cust_id == "placeholder")
    res.status(400).json({
      welcome: welcomeMsg,
      tutorial: {
        title: "Your request is incomplete! ✋",
        intro:
          "This endpoint requires an ID representing the customer to remove.",
        steps: [
          {
            note:
              "This request includes a path parameter with `/:customer_id` at the end of the request address—open **Params** and replace " +
              "`placeholder` with the `id` of a customer you added when you sent the `POST` request. Copy the `id` from the response in the " +
              "`Get all customers` request. ***You can only remove a customer you added.***"
          }
        ],
        next: [
          {
            step:
              "With your customer ID parameter in place, click **Send** again."
          }
        ]
      }
    });
  else {
    var adminId = req.get("user-id") ? req.get("user-id") : "anonymous";
    //check the record matches the user id
    var cust = db
      .get("customers")
      .find({ id: req.params.cust_id })
      .value();
    if (cust && adminId != "postman" && cust.admin == adminId) {
      db.get("customers")
        .remove({ id: req.params.cust_id })
        .write();
      res.status(200).json({
        welcome: welcomeMsg,
        tutorial: {
          title: "You deleted a customer! 🏆",
          intro: "Your customer was removed from the database.",
          steps: [
            {
              note:
                "Go back into the first request you opened `Get all customers` and **Send** it again before returning here—" +
                "you should see that your deleted customer is no longer in the array!"
            }
          ],
          next: [
            {
              step:
                "🚀 You completed the first folder in the "+process.env.PROJECT+" collection! Check out the next folder!"
            }
          ]
        }
      });
    } else {
      res.status(400).json({
        welcome: welcomeMsg,
        tutorial: {
          title: "Your request is invalid! ⛔",
          intro:
            "You can only remove customers you added using the `POST` method during the current session (and that haven't been deleted).",
          steps: [
            {
              note:
                "This request includes a path parameter with `/:customer_id` at the end of the request address—open **Params** and replace " +
                "`placeholder` with the `id` of a customer you added when you sent the `POST` request. Copy the `id` from the response in the " +
                "`Get all customers` request. ***You can only remove a customer you added.***"
            }
          ],
          next: [
            {
              step:
                "With the ID parameter for a customer _you added_ during this session in place, click **Send** again."
            }
          ]
        }
      });
    }
  }
});

/*
ADMIN endpoints below work in conjunction with Postman admin templates
*/

// removes entries from db and populates it with default
app.get("/reset", (req, res) => {
  const apiSecret = req.get("admin_key");
  if (!apiSecret || apiSecret !== process.env.SECRET) {
    res.status(401).json({ error: "Unauthorized" });
  } else {
    db.get("customers")
      .remove()
      .write();

    var customers = [
      {
        id: shortid.generate(),
        name: "Blanche Devereux",
        type: "Individual",
        admin: "postman"
      },
      {
        id: shortid.generate(),
        name: "Rose Nylund",
        type: "Individual",
        admin: "postman"
      },
      {
        id: shortid.generate(),
        name: "Shady Pines",
        type: "Company",
        admin: "postman"
      }
    ];

    customers.forEach(customer => {
      db.get("customers")
        .push({
          id: customer.id,
          name: customer.name,
          type: customer.type,
          admin: customer.admin
        })
        .write();
    });

    console.log("Default customers added");
    res.status(200).json({ message: "DB reset" });
  }
});

//removes all entries from the db
app.get("/clear", (req, res) => {
  const apiSecret = req.get("admin_key");
  if (!apiSecret || apiSecret !== process.env.SECRET) {
    res.status(401).json({ error: "Unauthorized" });
  } else {
    db.get("customers")
      .remove()
      .write();
    res.status(200).json({ message: "DB cleared" });
  }
});

//get all records
app.get("/all", function(req, res) {
  const apiSecret = req.get("admin_key");
  if (!apiSecret || apiSecret !== process.env.SECRET) {
    res.status(401).json({ error: "Unauthorized" });
  } else {
    var customers = db.get("customers").value();
    res.status(200).json({
      welcome: welcomeMsg,
      data: {
        customers: customers
      },
      tutorial: {
        title: "You sent a request! 🚀",
        intro:
          "Your request used `GET` method and sent to the `/customers` path.",
        steps: [
          {
            note: "The API returned JSON data including an array of customers:",
            raw_data: {
              customers: customers
            }
          }
        ],
        next: [
          {
            step:
              "Now open the next `GET` request in the collection `Get one customer` and click **Send**."
          }
        ]
      }
    });
  }
});

//get all calls
app.get("/calls", function(req, res) {
  const apiSecret = req.get("admin_key");
  if (!apiSecret || apiSecret !== process.env.SECRET) {
    res.status(401).json({ error: "Unauthorized" });
  } else {
    var calls = db.get("calls").value();
    res.status(200).json(calls);
  }
});

//admin delete
app.delete("/records", function(req, res) {
  const apiSecret = req.get("admin_key");
  if (!apiSecret || apiSecret !== process.env.SECRET) {
    res.status(401).json({ error: "Unauthorized" });
  } else {
    db.get("customers")
      .remove({ id: req.query.cust_id })
      .write();
    res.status(200).json({ message: "deleted" });
  }
});

//generic method errors
app.get("/*", (req, res) => {
  res.status(400).json(invalidMsg);
});
app.post("/*", (req, res) => {
  res.status(400).json(invalidMsg);
});
app.put("/*", (req, res) => {
  res.status(400).json(invalidMsg);
});
app.patch("/*", (req, res) => {
  res.status(400).json(invalidMsg);
});
app.delete("/*", (req, res) => {
  res.status(400).json(invalidMsg);
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
