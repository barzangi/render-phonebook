const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("Give password as argument");
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://thebarzangi:${password}@cluster0.addgx9w.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set("strictQuery", false);

mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

// fetch all persons if only password given
if (process.argv.length === 3) {
  console.log("Phonebook:");
  Person.find({}).then((result) => {
    result.forEach((person) => {
      console.log(person.name, person.number);
    });
    mongoose.connection.close();
  });
}

// add new person
if (process.argv.length === 5) {
  const person = new Person({
    name: String(process.argv[3]),
    number: String(process.argv[4]),
  });

  person.save().then((result) => {
    console.log(
      `Added ${person.name} number ${person.number} to the phonebook.`
    );
    mongoose.connection.close();
  });
}
