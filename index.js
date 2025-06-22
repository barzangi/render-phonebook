require("dotenv").config();
const express = require("express");
const Person = require("./models/person");

const app = express();
app.use(express.json());
app.use(express.static("dist"));

const cors = require("cors");

app.use(cors());

let morgan = require("morgan");

morgan.token("data", (req, _res) => JSON.stringify(req.body));
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :data")
);

// root
app.get("/", (_request, response) => {
  response.send("Root");
});

// get all persons
app.get("/api/people", (_request, response, next) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

// get single person
app.get("/api/people/:id", (request, response) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

// delete person
app.delete("/api/people/:id", (request, response) => {
  Person.findByIdAndDelete(request.params.id).then(() => {
    response.status(204).end();
  });
});

// add person
app.post("/api/people", (request, response) => {
  const body = request.body;

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save().then((savedPerson) => {
    response.json(savedPerson);
  });
});

// update person
app.put("/api/people/:id", (request, response, next) => {
  const { name, number } = request.body;

  Person.findById(request.params.id)
    .then((person) => {
      if (!person) {
        return response.status(404).end();
      }

      person.name = name;
      person.number = number;

      return person.save().then((updatedPerson) => {
        response.json(updatedPerson);
      });
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (_request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

// error handler
const errorHandler = (error, _request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
