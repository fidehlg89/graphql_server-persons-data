import { ApolloServer, gql } from "apollo-server";

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
    street: String!
    city: String!
    id: ID!
  }

  type Query {
    personCount: Int!
    allPersons: [Person]!
  }
`;

const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: () => persons,
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
