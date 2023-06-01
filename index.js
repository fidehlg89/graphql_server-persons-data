import { ApolloServer, gql } from "apollo-server";
// import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";

const persons = [
  {
    id: 1,
    street: "664 Northwestern Crossing",
    city: "San Marcos",
    name: "Worth",
    phone: "+51 584 302 8248",
  },
  {
    id: 2,
    street: "79782 School Crossing",
    city: "Anulid",
    name: "Sanderson",
    phone: "+63 186 642 0691",
  },
  {
    id: 3,
    street: "119 Spaight Trail",
    city: "Nankeng",
    name: "Paxton",
    phone: "+86 545 434 2357",
  },
];

const typeDefs = gql`
  type Person {
    name: String!
    phone: String
    address: Address
    id: ID!
  }

  type Address {
    street: String!
    city: String!
  }

  type Query {
    personCount: Int!
    allPersons: [Person]!
    findPerson(name: String!): Person
  }
`;

const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: () => persons,
    findPerson: (root, args) => {
      const { name } = args;
      return persons.find((person) => person.name === name);
    },
  },
  Person: {
    address: (root) => {
      return {
        street: root.street,
        city: root.city,
      };
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
//   playground: true,
//   plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
