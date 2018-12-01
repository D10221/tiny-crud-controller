import { Model, Document } from "mongoose";

export default <T extends Document, QueryHelpers = {}>(
  model: Model<T, QueryHelpers>,
) => {
  return {
    add(id: string, data: {}) {
      return model.create({
        id,
        ...data,
      });
    },
    find(id?: string) {
      if (id) {
        return new Promise((resolve, reject) =>
          model
            .findById(id)
            .lean()
            .exec((err, res) => {
              if (err) reject(err);
              else resolve(res);
            }),
        );
      } else {
        return new Promise((resolve, reject) =>
          model
            .find()
            .lean()
            .exec((err, res) => {
              if (err) reject(err);
              else resolve(res);
            }),
        );
      }
    },
    remove(id?: string) {
      return new Promise((resolve, reject) =>
        model
          .findByIdAndRemove(id)
          .lean()
          .exec((err, res) => {
            if (err) reject(err);
            else resolve(res);
          }),
      );
    },
    update(id: string, data: {}) {
      return new Promise((resolve, reject) =>
        model
          .updateOne(id, data)
          .lean()
          .exec((err, res) => {
            if (err) reject(err);
            else resolve(res);
          }),
      );
    },
  };
};
