const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const Schema = mongoose.Schema;

const taskSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// taskSchema.plugin(AutoIncrement, {
//   inc_field: "ticket",
//   id: "ticketNum",
//   start_seq: 100,
// });

module.exports = mongoose.model("Task", taskSchema);
