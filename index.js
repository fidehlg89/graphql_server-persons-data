import { ApolloServer, UserInputError, gql } from "apollo-server";
import { v1 as uuid } from "uuid";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";

/**
 * Initial example data.
 * In a real application, this would come from a database.
 */
const persons = [
  {
    id: "1",
    street: "664 Northwestern Crossing",
    city: "San Marcos",
    name: "Worth",
    phone: "+51 584 302 8248",
  },
  {
    id: "2",
    street: "79782 School Crossing",
    city: "Anulid",
    name: "Sanderson",
    phone: "+63 186 642 0691",
  },
  {
    id: "3",
    street: "119 Spaight Trail",
    city: "Nankeng",
    name: "Paxton",
    phone: "+86 545 434 2357",
  },
];

/**
 * Schema Definition (TypeDefs).
 * Here we define the data structure and available operations.
 */
const typeDefs = gql`
  # Represents a person in the system
  type Person {
    name: String!
    phone: String
    address: Address
    id: ID!
  }

  # Represents a person's address
  type Address {
    street: String!
    city: String!
  }

  # Queries to fetch data (Read)
  type Query {
    personCount: Int!           # Returns the total number of persons
    allPersons: [Person]!       # Returns all persons
    findPerson(name: String!): Person # Search for a person by name
  }

  # Mutations to modify data (Write/Update/Delete)
  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person

    updatePerson(
      id: ID!
      name: String
      phone: String
      street: String
      city: String
    ): Person
  }
`;

/**
 * Resolvers: Business logic.
 * Tells GraphQL how to fetch data for each field defined in the Schema.
 */
const resolvers = {
  // Handlers for the Query type
  Query: {
    personCount: () => persons.length,
    allPersons: () => persons,
    findPerson: (root, args) => {
      const { name } = args;
      return persons.find((person) => person.name === name);
    },
  },
  // Computed field: 'address' doesn't exist as such in the original array,
  // so we form it here from the street and city fields.
  Person: {
    address: (root) => {
      return {
        street: root.street,
        city: root.city,
      };
    },
  },
  // Handlers for the Mutation type
  Mutation: {
    addPerson: (root, args) => {
      // Simple validation: name must be unique
      if (persons.find((p) => p.name === args.name)) {
        throw new UserInputError("person name must be unique", {
          invalidArgs: args.name
        });
      }
      // Create a new person with a unique ID using uuid
      const person = { ...args, id: uuid() };
      persons.push(person);
      return person;
    },
    updatePerson: (root, args) => {
      const { id, ...updates } = args
      const index = persons.findIndex(p => p.id === id)
      if (index === -1) return null

      // Merge existing data with updates
      const updatedPerson = { ...persons[index], ...updates }
      persons[index] = updatedPerson

      return updatedPerson
    }
  },
};

/**
 * Apollo Server Initialization.
 */
const server = new ApolloServer({
  typeDefs,
  resolvers,
  // Settings for the Playground (visual testing environment)
  playground: true,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  // Explicitly enable CORS for all origins (useful for local development)
  cors: {
    origin: '*',
    credentials: true,
  },
});

// Start the server on the default port (4000)
server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
