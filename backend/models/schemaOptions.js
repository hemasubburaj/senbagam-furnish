// Shared toJSON transform so every model's API response looks like
// { id: "...", ...fields } instead of Mongo's default { _id, __v }.
// This keeps the frontend/admin JS (written for a simple `id` field)
// working unchanged.
const schemaOptions = {
  timestamps: { createdAt: 'created_at', updatedAt: false },
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
};

module.exports = schemaOptions;
