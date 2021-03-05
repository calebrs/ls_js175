const express = require("express");
const morgan = require("morgan");
const app = express();

let contactData = [
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

const sortContacts = contacts => {
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

app.set("views", "./views");
app.set("view engine", "pug");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(morgan("common"));

app.get("/", (req, res) => {
  res.redirect("/contacts");
});

app.get("/contacts", (req, res) => {
  res.render("contacts", {
    contacts: sortContacts(contactData),
  });
});

app.get("/contacts/new", (req, res) => {
  res.render("new-contact");
});

app.post("/contacts/new",
  (req, res, next) => {
    res.locals.errorMessages = [];
    next();
  },
  (req, res, next) => {
    res.locals.firstName = req.body.firstName.trim();
    res.locals.lastName = req.body.lastName.trim();
    res.locals.phoneNumber = req.body.phoneNumber.trim();
    next();
  },
  (req, res, next) => {
    let firstName = res.locals.firstName;
    if (firstName.length === 0) {
      res.locals.errorMessages.push("First name is required");
    } else if (firstName.length > 25) {
      res.locals.errorMessages.push("First name is too long. Maximum length is 25 characters");
    } else if (!firstName.match(/^[a-zA-Z]+$/)) {
      res.locals.errorMessages.push("First name contains invalid characters. Must be alphabetic.");
    }

    next();
  },
  (req, res, next) => {
    let lastName = res.locals.lastName;
    if (lastName.length === 0) {
      res.locals.errorMessages.push("Last name is required");
    } else if (lastName.length > 25) {
      res.locals.errorMessages.push("Last name is too long. Maximum length is 25 characters");
    } else if (!lastName.match(/^[a-zA-Z]+$/)) {
      res.locals.errorMessages.push("Last name contains invalid characters. Must be alphabetic.");
    }

    next();
  },
  (req, res, next) => {
    let phoneNumber = res.locals.phoneNumber;
    if (phoneNumber.length === 0) {
      res.locals.errorMessages.push("Phone number is required");
    } else if (!phoneNumber.match(/[0-9]{3}-[0-9]{3}-[0-9]{4}/)) {
      res.locals.errorMessages.push("Phone number must match format: ###-###-####");
    }

    next();
  },
  (req, res, next) => {
    let fullName = `${res.locals.firstName} ${res.locals.lastName}`;
    let foundContact = contactData.find(contact => {
      return `${contact.firstName} ${contact.lastName}` === fullName;
    });

    if (foundContact) {
      res.locals.errorMessages.push(`${fullName.lastName} is already on you contact list.`);
    }

    next()
  },
  (req, res, next) => {
    if (res.locals.errorMessages.length > 0) {
      res.render("new-contact", {
        errorMessages: res.locals.errorMessages,
        firstName: res.locals.firstName,
        lastName: res.locals.lastName,
        phoneNumber: res.locals.phoneNumber,
      });
    } else {
      next();
    }
  },
  (req, res) => {
    contactData.push({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phoneNumber: req.body.phoneNumber,
    });

    res.redirect("/contacts");
  }
);

app.listen(3000, "localhost", () => {
  console.log("Listening to port 3000.");
});