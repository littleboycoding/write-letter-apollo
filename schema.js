const { gql } = require("apollo-server");

const typeDefs = gql`
  type Query {
    getLetters(cursor: ID, limit: Int = 10, hashtag: String): Letters!
    getLetter(id: ID!): Letter!
    getPaperPlane: Letter!
  }

  type Comments {
    cursor: ID
    limit: Int!
    hasMore: Boolean!
    letterId: ID!
    comments: [Comment!]!
  }

  type Comment {
    id: ID!
    letterId: ID!
    content: String!
    commenter: String!
    date: Float!
  }

  type Letters {
    cursor: ID
    limit: Int!
    hasMore: Boolean!
    hashtag: String
    letters: [Letter!]!
  }

  type Letter {
    id: ID!
    content: String!
    writer: String!
    date: Float!
    hashtags: [String!]!
    method: String!
    read: Boolean
    getComments(cursor: ID, limit: Int = 5): Comments!
  }

  type Mutation {
    writeLetter(content: String!, writer: String!, method: String!): Letter!
    writeComment(letterId: ID!, content: String!, commenter: String!): Comment!
  }
`;

module.exports = typeDefs;
