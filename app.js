const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const colors = require('colors')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const mongoSanitize = require('express-mongo-sanitize')
const fileupload = require('express-fileupload')
const helmet = require('helmet')
const xss = require('xss-clean')
// const rateLimit = require('express-rate-limit')
const hpp = require("hpp");
const cors = require("cors");

const errorHandler = require("./middleware/error");

const DBConnection = require("./config/db");

dotenv.config({ path: "./config/.env" });

//changed by megha on 12-06-2023
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");



// db connection

DBConnection()


// importing routes
const zoomRouter = require("./routes/zoomRouter")
const authRoutes = require("./routes/auth");

const chatRoute = require('./routes/chatRoutes')
const messageRoute = require('./routes/messageRoutes')


const userRoutes = require("./routes/users");
const categoriesRoutes = require("./routes/categories");
const questionsRoutes = require("./routes/questions");
const scoresRoutes = require("./routes/scores");
const leaderBoardRoutes = require("./routes/leaderboard");
const countRoutes = require("./routes/counts");
const assignmentRoutes = require("./routes/assignment");
const { assign } = require("nodemailer/lib/shared");

const app = express();

app.use(express.json());

app.use(cookieParser());

// db connection

DBConnection()


// importing routes
// const zoomRouter = require("./routes/zoomRouter")
// // const authRoutes = require('./routes/auth')
// const userRoutes = require('./routes/users')

// const audioMaterialRoutes = require("./routes/courseMaterialAudio")
// const categoriesRoutes = require('./routes/categories')
// const questionsRoutes = require('./routes/questions')
// const scoresRoutes = require('./routes/scores')
// const leaderBoardRoutes = require('./routes/leaderboard')
// const countRoutes = require('./routes/counts')
// const assignmentRoutes = require('./routes/assignment');
// const { assign } = require('nodemailer/lib/shared')

// const app = express()

app.use(express.json())

app.use(cookieParser())

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// File uploading
app.use(
  fileupload({
    createParentPath: true,
  })
);

//middlewares
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use("/courseMaterials", express.static(path.join(__dirname, "/courseMaterials")));
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Enable CORS
app.use(
  cors({
    origin: ["http://localhost:3000", "https://funclass-pearlorg.netlify.app"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);


// const limiter = rateLimit({
//   windowMs: 10 * 60 * 1000, // 10 mins
//   max: 100 // 100 request per 10 mins
// })

// app.use(limiter)

// Prevent http param pollution
app.use(hpp());

app.use(express.static(path.join(__dirname, "public")));
const versionOne = (routeName) => `/api/v1/${routeName}`;
app.use(versionOne('auth'), authRoutes)
app.use(versionOne('users'), userRoutes)
app.use(versionOne('categories'), categoriesRoutes)
app.use(versionOne('questions'), questionsRoutes)
app.use(versionOne('scores'), scoresRoutes)
app.use(versionOne('leaderboard'), leaderBoardRoutes)
app.use(versionOne('counts'), countRoutes)
app.use(versionOne('assignments'), assignmentRoutes)

app.use(versionOne("auth"), authRoutes);


app.use(versionOne("users"), userRoutes);

app.use(versionOne("categories"), categoriesRoutes);
app.use(versionOne("questions"), questionsRoutes);
app.use(versionOne("scores"), scoresRoutes);
app.use(versionOne("leaderboard"), leaderBoardRoutes);
app.use(versionOne("counts"), countRoutes);
app.use(versionOne("assignments"), assignmentRoutes);

// routes section
app.use("/zoomapi", zoomRouter);


//chat route 
app.use(versionOne('chat'), chatRoute)
app.use(versionOne('message'), messageRoute)


app.use(errorHandler);

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(
    `We are live on ${process.env.NODE_ENV} mode on port ${PORT}`.red.bold
  );
});

// Handle unhandled promise rejections
// process.on('unhandledRejection', (err, promise) => {
//   console.log(`Error: ${err.message}`.red)
//   // Close server & exit process
//   server.close(() => process.exit(1))
// })

// --------------------------deployment------------------------------

const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

// --------------------------deployment------------------------------

// Error Handling middlewares

// app.use(notFound);
// app.use(errorHandler);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
    // credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing")); //realtime typing functionality
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing")); //realtime stopped functionality

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      //created functionlity to send message to all the user except the sender themselves
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved); //realtime message recieved functionality
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
