const helmet = require('helmet')

module.exports = (app) =>{
    app.use(
        helmet({
          xFrameOptions: { action: "deny" },
          xDnsPrefetchControl: { allow: false },
          referrerPolicy: {policy: "same-origin"}
        })
      );
}
