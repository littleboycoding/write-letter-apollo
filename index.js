const { ApolloServer } = require("apollo-server");

const typeDefs = require("./schema");
const resolvers = require("./resolvers");

const { Letter } = require("./datasources/letter");
const { Comment } = require("./datasources/comment");

const { MongoClient } = require("mongodb");
const MONGO_ADDRESS =
  process.env.NODE_ENV === "production"
    ? process.env.MONGO_ADDRESS || "mongodb://localhost:27017"
    : "mongodb://localhost:27017";
const client = new MongoClient(MONGO_ADDRESS);
client.connect();

const server = new ApolloServer({
  context: {
    collections: {
      letter: () => client.db("writeletter").collection("letter"),
      comment: () => client.db("writeletter").collection("comment"),
    },
  },
  typeDefs,
  resolvers,
  dataSources: () => ({
    Letter: new Letter(client.db("writeletter").collection("letter")),
    Comment: new Comment(client.db("writeletter").collection("comment")),
  }),
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(
    "Apollo Server, Running in " + (process.env.NODE_ENV || "development")
  );
  console.log("With Mongodb address " + MONGO_ADDRESS);
  console.log("Listening on port " + PORT);
});
