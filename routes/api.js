const { Board, Thread, Reply } = require('../models/thread');
module.exports = function (app) {

  // BOARD
  app.route('/api/threads/:board')
    
    .post(async (req, res) => {
      try {
        let { text, delete_password, board } = req.body;
        const thread = new Thread({ text: text, delete_password: delete_password, replies: [] });
        if (!board) { board = req.params.board; }

        const boardData = await Board.findOne({ board: board });
        if (!boardData) {
          const newBoardData = new Board({ board: board, threads: thread });
          const savedData = await newBoardData.save();
          res.json(savedData);
        } else {
          boardData.threads.push(thread);
          const updatedBoardData = await boardData.save();
          res.json(thread);
        }
      } catch (err) {
        res.status(500).json({ error: "Server error" });
      }
    })

    .get(async (req, res) => {
      try {
        let board = req.params.board;
        const boardData = await Board.findOne({ board: board });
        if (!boardData) {
          res.json({ error: "No board found" });
        } else {
          let sortThread = (obj1, obj2) => obj2.bumped_on - obj1.bumped_on;
          let sortReply = (obj1, obj2) => obj2.created_on - obj1.created_on;
          let threads = boardData.threads.map(obj => {
            let { _id, text, created_on, bumped_on, replies } = obj;
            replies = replies.map(obj => {
              const { _id, text, created_on } = obj;
              return { _id, text, created_on };
            });
            replies.sort(sortReply);
            replies = replies.slice(0, 3);
            return { _id, text, created_on, bumped_on, replies, replycount: obj.replies.length };
          });
          threads.sort(sortThread);
          threads = threads.slice(0, 10);
          res.json(threads);
        }
      } catch (err) {
        res.status(500).json({ error: "Server error" });
      }
    })

    .delete(async (req, res) => {
      try {
        let { thread_id, delete_password } = req.body;
        let board = req.params.board;
        const boardData = await Board.findOne({ board: board });
        
        if (!boardData) {
          return res.json({ error: "No board found" });
        }
    
        // Find the index of the thread to be deleted
        const threadIndex = boardData.threads.findIndex(t => t._id.toString() === thread_id);
        
        if (threadIndex === -1) {
          return res.send('thread not found');
        }
    
        // Check the delete_password
        if (delete_password !== boardData.threads[threadIndex].delete_password) {
          return res.send('incorrect password');
        }
    
        // Remove the thread from the threads array
        boardData.threads.splice(threadIndex, 1);
        
        await boardData.save();
        res.send('success');
      } catch (err) {
        res.status(500).json({ error: "Server error" });
      }
    })
    

    .put(async (req, res) => {
      try {
        let { thread_id } = req.body;
        let board = req.params.board;
        const boardData = await Board.findOne({ board: board });
        if (!boardData) {
          res.json({ error: "No board found" });
        } else {
          let thread = boardData.threads.id(thread_id);
          thread.reported = true;
          await boardData.save();
          res.send('reported');
        }
      } catch (err) {
        res.status(500).json({ error: "Server error" });
      }
    });

  // REPLIES
  app.route('/api/replies/:board')

    .post(async (req, res) => {
      try {
        let { text, delete_password, thread_id } = req.body;
        let reply = new Reply({ text: text, delete_password: delete_password });
        const board = req.params.board;
        const boardData = await Board.findOne({ board: board });
        if (!boardData) {
          res.json({ error: 'board not found' });
        } else {
          let thread = boardData.threads.id(thread_id);
          thread.replies.push(reply);
          thread.bumped_on = reply.created_on;
          await boardData.save();
          res.json(reply);
        }
      } catch (err) {
        res.status(500).json({ error: "Server error" });
      }
    })

    .get(async (req, res) => {
      try {
        let board = req.params.board;
        let thread_id = req.query.thread_id;
        const boardData = await Board.findOne({ board: board });
        if (!boardData) {
          res.json({ error: "No board found" });
        } else {
          let sortReply = (obj1, obj2) => obj2.created_on - obj1.created_on;
          let thread = boardData.threads.id(thread_id);
          let { _id, text, created_on, bumped_on, replies } = thread;
          replies = replies.map(obj => {
            const { _id, text, created_on } = obj;
            return { _id, text, created_on };
          });
          replies.sort(sortReply);
          res.json({ _id, text, created_on, bumped_on, replies });
        }
      } catch (err) {
        res.status(500).json({ error: "Server error" });
      }
    })

    .delete(async (req, res) => {
      try {
        let { thread_id, delete_password, reply_id } = req.body;
        let board = req.params.board;
        const boardData = await Board.findOne({ board: board });
        if (!boardData) {
          res.json({ error: "No board found" });
        } else {
          let thread = boardData.threads.id(thread_id);
          let reply = thread.replies.id(reply_id);
          if (delete_password != thread.delete_password) {
            res.send('incorrect password');
          } else {
            reply.text = "[deleted]";
            await boardData.save();
            res.send('success');
          }
        }
      } catch (err) {
        res.status(500).json({ error: "Server error" });
      }
    })

    .put(async (req, res) => {
      try {
        let { thread_id, delete_password, reply_id } = req.body;
        let board = req.params.board;
        const boardData = await Board.findOne({ board: board });
        if (!boardData) {
          res.json({ error: "No board found" });
        } else {
          let thread = boardData.threads.id(thread_id);
          let reply = thread.replies.id(reply_id);
          reply.reported = true;
          await boardData.save();
          res.send('reported');
        }
      } catch (err) {
        res.status(500).json({ error: "Server error" });
      }
    });
};
