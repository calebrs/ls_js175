const express = require("express"); //node web framework. Used for routing, write handlers. Inegerates with view rendering engines.
const morgan = require("morgan"); //middleware to log messages to to the console
const app = express(); //initializes express by calling the express function. Returns a function. This is a neccesary step to work with express.
const COUNTRY_DATA = [ //array of data for each page to be rendered
  {
    path: "/english",
    flag: "flag-of-United-States-of-America.png",
    alt: "US Flag",
    title: "Go to US English site",
  },
  {
    path: "/french",
    flag: "flag-of-France.png",
    alt: "Drapeau de la france",
    title: "Aller sur le site français",
  },
  {
    path: "/serbian",
    flag: "flag-of-Serbia.png",
    alt: "Застава Србије",
    title: "Идите на српски сајт",
  },
  {
    path: "/spanish",
    flag: "flag-of-Spain.png",
    alt: "La bandera de espana",
    title: "Ir al sitio de espanol",
  },
];

const LANGUAGE_CODES = { //language codes to be used in the app.get() call. this allows us to reuse code instead of having multiple route blocks
  english: "en-US", 
  french: "fr-FR",
  serbian: "sr-Cryl-rs",
  spanish: "es-ES",
}

app.set("views", "./views"); //sets the views property on app to point towards the ./views folder. this configures express to use this path when rendering html
app.set("view engine", "pug"); //sets the view engine property on app to pug. When HTML is rendered, it will use the pug engine (which is a dependancy of this project (see package.json).

app.use(express.static("public")); //allows the ability to serve up static files (css, html, js, images). express.static() is a middleware function.
app.use(morgan("common")); //allows use of the middleware morgan. SEE middleware for more details. Logs info to the console when requests are made.

app.locals.currentPathClass = (path, currentPath) => { //defines a new method currentPathClass on the app.locals object. This method will be called in the layout.pug
  return path === currentPath ? "current" : "";        //compares a path to the current path. if they are the same, it makes the current path the current loaded page.
}                                                      //considered a helper method

app.get("/", (req, res) => { //redirects a blank request to the page to the english site
  res.redirect("/english");
});

app.get("/:language", (req, res, next) => { //routing method. /:language will route to whatever language is input. when a request is sent to localhost this mehtodis called.
  const language = req.params.language; //saves the language of the request into a variable
  const languageCode = LANGUAGE_CODES[language]; //uses language to get the current language of the request converted to the coded values see lines 31 - 35
  if (!languageCode) { //catches any languages that are not supported by the site.
    next(new Error(`Language not supported: ${language}`)); //calls the next middleware function with an argument of a new error object. 
  } else {
    res.render(`hello-world-${language}`, { //if the request is good, then we'll render the view of the specified language with an object being passed to the view.
      countries: COUNTRY_DATA,
      currentPath: req.path,
      language: languageCode,
    });
  }
});

app.use((err, req, res, _next) => { //middleware error handler function
  console.log(err);
  res.status(404).send(err.message); //if called, logs status and error message to the console
});

app.listen(3000, "localhost", () => { //listens for any requests made to port 3000. If there are any requests, then they will be handled by the app.get() method defined above.
  console.log("Listening to port 3000.");
});