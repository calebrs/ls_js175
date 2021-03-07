const express = require("express"); // includes the express module
const morgan = require("morgan"); // includes the morgan library, which logs messages to the console.
const { body, validationResult } = require("express-validator"); // inlcuedes the express-validation module which makes validating user input easier. see lines 103 - 127
const session = require("express-session"); // allows easier managment of sessions
const store = require("connect-loki"); // helps create a data-strore for data kept between sessions
const flash = require("express-flash"); // module that handes flash messages

const app = express(); // initializes express
const LokiStore = store(session); // initializes a datastore

const contactData = [ //the data that will be use by the application. This data is in the app by default when starting
  {
    firstName: "Mike",
    lastName: "Jones",
    phoneNumber: "281-330-8004",
  },
  {
    firstName: "Jenny",
    lastName: "Keys",
    phoneNumber: "768-867-5309",
  },
  {
    firstName: "Max",
    lastName: "Entiger",
    phoneNumber: "214-748-3647",
  },
  {
    firstName: "Alicia",
    lastName: "Keys",
    phoneNumber: "515-489-4608",
  },
];

const sortContacts = contacts => { //helper method that sorts contacts see line 95 when it's called
  return contacts.slice().sort((contactA, contactB) => {
    if (contactA.lastName < contactB.lastName) {
      return -1;
    } else if (contactA.lastName > contactB.lastName) {
      return 1;
    } else if (contactA.firstName < contactB.firstName) {
      return -1;
    } else if (contactA.firstName > contactB.firstName) {
      return 1;
    } else {
      return 0;
    }
  });
};

//NOTE ON MIDDLEWARE: middleware is called in order when a request is made. This forms the "middleware chain". 

const clone = object => { //helper method that clones/copies contactData. Avoids creating a reference
  return JSON.parse(JSON.stringify(object));
};

app.set("views", "./views"); //middleware that lets express know where the views are
app.set("view engine", "pug"); // middleware that lets express know where the view engine is

app.use(express.static("public")); //middleware that handles requests for static reources. Such ass .css, .js, images,
app.use(express.urlencoded({ extended: false })); //
app.use(morgan("common")); //middleware that logs messgeas to the console when called. 
app.use(session({ //used for session persistance. configures the session and sets the store to a newLokiStore() (locally stored db in memory)
  cookie: {
    httpOnly: true,
    maxAge: 31 * 24 * 60 * 60 * 1000, // 31 days in milliseconds
    path: "/",
    secure: false,
  },
  name: "launch-school-contacts-manager-session-id",
  resave: false,
  saveUninitialized: true,
  secret: "this is not very secure",
  store: new LokiStore({}),
}));
app.use(flash()); //allows for flash messages to be used.

app.use((req, res, next) => { // middleware that detects if a session already exists. if not it creates a seperate clone of the data for the new session
  if (!("contactData" in req.session)) {
    req.session.contactData = clone(contactData);
  }

  next(); // next function pushes us through to the next middleware callback.
});

app.use((req, res, next) => { // when a request is made that has flash messges in it, then they will be copied to res.locals. req.session is deleted eliminating repeated messges
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
})

app.get("/", (req, res) => { //first request handler redirects / requests to /contacts
  res.redirect("/contacts");
});

app.get("/contacts", (req, res) => { // handles requests for /contacts. renders the contacts view with an object argument that will sort the contacts list.
  res.render("contacts", {
    contacts: sortContacts(req.session.contactData),
  });
});

app.get("/contacts/new", (req, res) => { // renders the new-contact view when requested via GET
  res.render("new-contact");
});

const validateName = (name, whichName) => { //function expession that makes the calles on lines 119 and 120 simpler/ reduces code. creates and handles erros for bad input
  return body(name)
    .trim()
    .isLength({ min: 1 })
    .withMessage(`${whichName} name is required.`)
    .bail()
    .isLength({ max: 25 })
    .withMessage(`${whichName} name is too long. Maximum length is 25 characters.`)
    .isAlpha()
    .withMessage(`${whichName} name contains invalid characters. The name must be alphabetic.`);
};

app.post("/contacts/new",
  [ //array argument to .post for requests to /contacts/new. This argument uses the express-validator milldeware to create error messages which will be passed to flash
    validateName("firstName", "First"),
    validateName("lastName", "Last"),

    body("phoneNumber")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Phone number is required.")
      .bail()
      .matches(/^\d\d\d-\d\d\d-\d\d\d\d$/)
      .withMessage("Invalid phone number format. Use ###-###-####."),
  ],
  (req, res, next) => {
    let errors = validationResult(req); //gets all the errors into a variable
    if (!errors.isEmpty()) { //if there are any erors a flahs messages will be added to the view
      errors.array().forEach(error => req.flash("error", error.msg));

      res.render("new-contact", { // renders new-contact view with the flash messages
        flash: req.flash(),
        errorMessages: errors.array().map(error => error.msg),
        firstName: req.body.firstName, //keeps the inputs with the new rendering
        lastName: req.body.lastName,
        phoneNumber: req.body.phoneNumber,
      });
    } else {
      next();
    }
  },
  (req, res) => { //if the request does not have errors this block ill execute. adding a contact to the data store of the session
    req.session.contactData.push({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phoneNumber: req.body.phoneNumber,
    });

    req.flash("success", "New contact added to list!"); //adds success message to flash that will be diplayed when redireted
    res.redirect("/contacts"); //redirectst to contacts -view.
  }
);

app.listen(3000, "localhost", () => { // listens for requests made on port 3000
  console.log("Listening to port 3000.");
});