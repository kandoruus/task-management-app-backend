const { app } = require("./src/app/tasks");
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI_APP, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

const listener = app.listen(process.env.PORT || 3001, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
