const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI)
const Schema = mongoose.Schema;

//REPLEIS
const replySchema = new Schema({
  text: {
  type: String,
  required: true
},
  delete_password: {
  type: String,
  required: true
},
  created_on: {
  type: Date,
  default:  new Date()
},
  reported: {
  type: Boolean,
  default: false
}
});

//THREADS
const threadSchema = new Schema({
  text: {
  type: String,
  required: true
},
  delete_password: {
  type: String,
  required: true
},
  created_on: {
  type: Date,
  default:  new Date()
},
  bumped_on: {
  type: Date,
  default:  new Date()
}
 , 
  reported: {
  type: Boolean,
  default:  false
},
  replies: {
   type: [replySchema]
}
 
});

//BOARDS
const boardSchema = new Schema({
  board: {type: String},
  threads:{ type: [threadSchema] }
})


const Board = mongoose.model('Board', boardSchema);
const Thread = mongoose.model('Thread', threadSchema);
const Reply = mongoose.model('Reply', replySchema);

module.exports = {Thread,Reply,Board};
