const { MongoDataSource } = require("apollo-datasource-mongodb");

const { ObjectId } = require("mongodb");

class Comment extends MongoDataSource {
  async getComments(letterId, cursor, limit) {
    const comments = await (cursor
      ? this.collection
          .find({
            letterId: ObjectId(letterId),
            _id: { $lt: ObjectId(cursor) },
          })
          .sort({ _id: -1 })
          .limit(limit)
          .toArray()
      : this.collection
          .find({ letterId: ObjectId(letterId) })
          .sort({ _id: -1 })
          .limit(limit)
          .toArray());

    const currentCursor =
      comments.length > 0 ? comments[comments.length - 1]._id : cursor;

    const length =
      currentCursor !== cursor
        ? await this.collection.countDocuments({
            letterId: ObjectId(letterId),
            _id: { $lt: ObjectId(currentCursor) },
          })
        : 0;

    return {
      cursor: currentCursor,
      limit,
      hasMore: length > 0,
      letterId,
      comments: comments.map((comment) => this.commentReducer(comment)),
    };
  }

  initialize({ context }) {
    this.context = context;
  }

  async writeComment({
    letterId,
    content: preSliceContent,
    commenter: preSliceCommenter,
  }) {
    const length = await this.context.collections.letter().countDocuments({
      _id: ObjectId(letterId),
    });
    if (length <= 0) throw new Error("no letter found");

    const date = new Date();
    const content = preSliceContent.slice(0, 250);
    const commenter = preSliceCommenter.slice(0, 25);

    const ObjectIdLetterId = ObjectId(letterId);
    const { insertedId } = await this.collection.insertOne({
      letterId: ObjectIdLetterId,
      content,
      commenter,
      date,
    });

    return {
      id: insertedId,
      letterId: ObjectIdLetterId,
      content,
      commenter,
      date,
    };
  }

  commentReducer({ letterId, content, commenter, _id, date }) {
    return {
      id: _id,
      letterId,
      content,
      commenter,
      date,
    };
  }
}

module.exports = { Comment };
