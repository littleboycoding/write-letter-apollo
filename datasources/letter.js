const { MongoDataSource } = require("apollo-datasource-mongodb");

const { ObjectId } = require("mongodb");

class Letter extends MongoDataSource {
  // async getLetters(offset, limit) {
  //   const letters = await this.collection
  //     .find({ method: "post" })
  //     .skip(offset)
  //     .limit(limit)
  //     .sort({ _id: -1 })
  //     .toArray();

  //   const length = await this.collection.countDocuments({ method: "post" });

  //   return {
  //     offset,
  //     limit,
  //     hasMore: offset + limit < length,
  //     letters: letters.map((letter) => this.letterReducer(letter)),
  //   };
  // }

  async getLetters(cursor, limit) {
    const letters = await (cursor
      ? this.collection
          .find({ method: "post", _id: { $lt: ObjectId(cursor) } })
          .sort({ _id: -1 })
          .limit(limit)
          .toArray()
      : this.collection
          .find({ method: "post" })
          .sort({ _id: -1 })
          .limit(limit)
          .toArray());

    const currentCursor =
      letters.length > 0 ? letters[letters.length - 1]._id : cursor;

    const length =
      currentCursor !== cursor
        ? await this.collection.countDocuments({
            method: "post",
            _id: { $lt: ObjectId(currentCursor) },
          })
        : 0;

    return {
      cursor: currentCursor,
      limit,
      hasMore: length > 0,
      letters: letters.map((letter) => this.letterReducer(letter)),
    };
  }

  async getLetter(id) {
    const letter = await this.collection.findOne({
      _id: ObjectId(id),
      method: "post",
    });
    if (!letter) throw new Error("no letter found");

    return this.letterReducer(letter);
  }

  async getPaperPlane() {
    const { value: letter } = await this.collection.findOneAndUpdate(
      { method: "paper_plane", read: false },
      {
        $set: { read: true },
      }
    );

    if (!letter) throw new Error("no paper plane found");

    return this.letterReducer(letter);
  }

  async writeLetter({
    content: preSliceContent,
    writer: preSliceWriter,
    method,
  }) {
    const date = new Date();
    const read = method === "paper_plane" ? false : null;
    const content = preSliceContent.slice(0, 250);
    const writer = preSliceWriter.slice(0, 25);

    const { insertedId } = await this.collection.insertOne({
      content,
      writer,
      date,
      method,
      read,
    });

    return {
      id: insertedId,
      content,
      writer,
      date,
      method,
      read,
    };
  }

  letterReducer({ content, writer, _id, date, method, read }) {
    return { id: _id, content, writer, date, method, read };
  }
}

module.exports = { Letter };
