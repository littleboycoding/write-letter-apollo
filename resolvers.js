const resolvers = {
  Query: {
    // getLetters: (_, { offset, limit }, { dataSources }) => {
    //   return dataSources.Letter.getLetters(offset, limit);
    // },
    getLetters: (_, { cursor, limit, hashtag }, { dataSources }) => {
      return dataSources.Letter.getLetters(cursor, limit, hashtag);
    },
    getLetter: (_, { id }, { dataSources }) => {
      return dataSources.Letter.getLetter(id);
    },
    getPaperPlane: (_, __, { dataSources }) => {
      return dataSources.Letter.getPaperPlane();
    },
    // getComments: (_, { letterId, offset, limit }, { dataSources }) => {
    //   return dataSources.Comment.getComments(letterId, offset, limit);
    // },
  },
  Mutation: {
    writeLetter: (_, argument, { dataSources }) => {
      return dataSources.Letter.writeLetter(argument);
    },
    writeComment: (_, argument, { dataSources }) => {
      return dataSources.Comment.writeComment(argument);
    },
  },
  Letter: {
    getComments(parent, { cursor, limit }, { dataSources }) {
      console.log(parent);
      return dataSources.Comment.getComments(parent.id, cursor, limit);
    },
  },
};

module.exports = resolvers;
