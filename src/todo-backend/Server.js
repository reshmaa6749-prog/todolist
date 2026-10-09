// const express = require("express");
// const cors = require("cors");
// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const { google } = require("googleapis");
// const crypto = require("crypto");
// require("dotenv").config();

// // =====================================================
// // CREATE EXPRESS APP
// // =====================================================

// const app = express();
// const PORT = process.env.PORT || 5000;

// // =====================================================
// // MIDDLEWARE & CORS CONFIGURATION
// // =====================================================

// const allowedOrigins = [
//   "https://infinityresh.infinityfreeapp.com",
//   "http://infinityresh.infinityfreeapp.com",
//   "http://localhost:5173",
//   "http://localhost:3000",
// ];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin) return callback(null, true);
//       const cleanOrigin = origin.replace(/\/$/, "");
//       if (allowedOrigins.some((o) => o.replace(/\/$/, "") === cleanOrigin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Blocked by CORS policy"));
//       }
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// app.use(express.json());

// // =====================================================
// // SILENCE FAVICON 404
// // =====================================================

// app.get("/favicon.ico", (req, res) => res.status(204).end());

// // =====================================================
// // ENVIRONMENT VARIABLES WITH PRODUCTION FALLBACKS
// // =====================================================

// const MONGO_URI = process.env.MONGO_URI;

// if (!MONGO_URI) {
//   throw new Error("MONGO_URI is not configured");
// }

// const JWT_SECRET = process.env.JWT_SECRET || "fallback_jwt_secret_key";
// const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
// const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// const GOOGLE_CALLBACK_URL =
//   process.env.GOOGLE_CALLBACK_URL ||
//   "https://todolist-r9lu.onrender.com/auth/google/callback";

// const FRONTEND_URL =
//   process.env.FRONTEND_URL ||
//   "https://infinityresh.infinityfreeapp.com";

// // =====================================================
// // CONNECT TO MONGODB
// // =====================================================

// mongoose
//   .connect(MONGO_URI, { family: 4 })
//   .then(() => {
//     console.log("Successfully connected to MongoDB!");
//   })
//   .catch((err) => {
//     console.error("MongoDB connection error:", err);
//   });

// // =====================================================
// // GOOGLE OAUTH CLIENT
// // =====================================================

// const oauth2Client = new google.auth.OAuth2(
//   GOOGLE_CLIENT_ID,
//   GOOGLE_CLIENT_SECRET,
//   GOOGLE_CALLBACK_URL
// );

// // =====================================================
// // SCHEMAS & MODELS
// // =====================================================

// const userSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true, trim: true },
//     email: { type: String, required: true, unique: true, trim: true, lowercase: true },
//     password: { type: String },
//     googleId: { type: String },
//   },
//   { timestamps: true }
// );

// const User = mongoose.model("User", userSchema);

// const todoSchema = new mongoose.Schema(
//   {
//     text: { type: String, required: true, trim: true },
//     completed: { type: Boolean, default: false },
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   },
//   {
//     timestamps: true,
//     toJSON: {
//       transform: (doc, ret) => {
//         ret.id = ret._id.toString();
//         delete ret._id;
//         delete ret.__v;
//         return ret;
//       },
//     },
//   }
// );

// const Todo = mongoose.model("Todo", todoSchema);

// // =====================================================
// // JWT HELPERS & MIDDLEWARE
// // =====================================================

// function createJWT(user) {
//   return jwt.sign(
//     {
//       userId: user._id.toString(),
//       name: user.name,
//       email: user.email,
//     },
//     JWT_SECRET,
//     { expiresIn: "1d" }
//   );
// }

// function authenticateToken(req, res, next) {
//   const authHeader = req.headers.authorization;

//   if (!authHeader) {
//     return res.status(401).json({ error: "No token provided" });
//   }

//   const token = authHeader.split(" ")[1];

//   if (!token) {
//     return res.status(401).json({ error: "Invalid authorization header" });
//   }

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     req.userId = decoded.userId;
//     next();
//   } catch (err) {
//     return res.status(403).json({ error: "Invalid or expired token" });
//   }
// }

// // =====================================================
// // AUTH ROUTES
// // =====================================================

// app.post("/api/register", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({ error: "All fields are required" });
//     }

//     if (password.length < 6) {
//       return res.status(400).json({ error: "Password must be at least 6 characters" });
//     }

//     const normalizedEmail = email.toLowerCase().trim();
//     const existingUser = await User.findOne({ email: normalizedEmail });

//     if (existingUser) {
//       return res.status(400).json({ error: "Email already registered" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = new User({
//       name: name.trim(),
//       email: normalizedEmail,
//       password: hashedPassword,
//     });

//     await newUser.save();
//     res.status(201).json({ message: "Registration successful" });
//   } catch (err) {
//     console.error("Registration error:", err);
//     res.status(500).json({ error: "Registration failed" });
//   }
// });

// app.post("/api/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ error: "Email and password are required" });
//     }

//     const normalizedEmail = email.toLowerCase().trim();
//     const user = await User.findOne({ email: normalizedEmail });

//     if (!user) {
//       return res.status(401).json({ error: "Invalid email or password" });
//     }

//     if (!user.password) {
//       return res.status(401).json({
//         error: "This account uses Google login. Please continue with Google.",
//       });
//     }

//     const passwordMatch = await bcrypt.compare(password, user.password);

//     if (!passwordMatch) {
//       return res.status(401).json({ error: "Invalid email or password" });
//     }

//     const token = createJWT(user);
//     res.json({
//       token: token,
//       user: { id: user._id, name: user.name, email: user.email },
//     });
//   } catch (err) {
//     console.error("Login error:", err);
//     res.status(500).json({ error: "Login failed" });
//   }
// });

// app.get("/auth/google", (req, res) => {
//   try {
//     // Encodes timestamp and random bytes into state to avoid server RAM dependency
//     const timestamp = Date.now();
//     const randomHex = crypto.randomBytes(16).toString("hex");
//     const statePayload = `${timestamp}:${randomHex}`;
//     const state = Buffer.from(statePayload).toString("base64url");

//     const authorizationUrl = oauth2Client.generateAuthUrl({
//       access_type: "offline",
//       scope: ["openid", "email", "profile"],
//       state: state,
//       prompt: "select_account",
//       include_granted_scopes: true,
//     });

//     res.redirect(authorizationUrl);
//   } catch (err) {
//     console.error("Google OAuth error:", err);
//     res.status(500).send("Unable to start Google login");
//   }
// });

// app.get("/auth/google/callback", async (req, res) => {
//   try {
//     const { code, state, error } = req.query;

//     if (error) {
//       return res.redirect(`${FRONTEND_URL}/?oauthError=Google%20login%20cancelled`);
//     }

//     if (!state) {
//       return res.status(400).send("OAuth state missing");
//     }

//     // Verify state timestamp expiration (10 minute limit)
//     try {
//       const decodedState = Buffer.from(state, "base64url").toString("utf-8");
//       const [timestamp] = decodedState.split(":");
//       const age = Date.now() - parseInt(timestamp, 10);

//       if (isNaN(age) || age > 10 * 60 * 1000) {
//         return res.status(400).send("OAuth state expired. Please try logging in again.");
//       }
//     } catch (e) {
//       return res.status(400).send("Invalid OAuth state format");
//     }

//     if (!code) {
//       return res.status(400).send("Google authorization code missing");
//     }

//     const { tokens } = await oauth2Client.getToken(code);
//     const ticket = await oauth2Client.verifyIdToken({
//       idToken: tokens.id_token,
//       audience: GOOGLE_CLIENT_ID,
//     });

//     const googlePayload = ticket.getPayload();
//     const googleId = googlePayload.sub;
//     const googleEmail = googlePayload.email.toLowerCase().trim();
//     const googleName = googlePayload.name || "Google User";

//     let user = await User.findOne({ googleId: googleId });

//     if (!user) {
//       user = await User.findOne({ email: googleEmail });
//     }

//     if (!user) {
//       user = new User({
//         name: googleName,
//         email: googleEmail,
//         googleId: googleId,
//       });
//     } else if (!user.googleId) {
//       user.googleId = googleId;
//     }

//     await user.save();

//     const token = createJWT(user);

//     // Redirect to root domain without /index.html
//     res.redirect(`${FRONTEND_URL}/?token=${encodeURIComponent(token)}`);
//   } catch (err) {
//     console.error("Google OAuth callback error:", err);
//     res.redirect(`${FRONTEND_URL}/?oauthError=Google%20login%20failed`);
//   }
// });

// // =====================================================
// // TODO ROUTES
// // =====================================================

// app.get("/api/todos", authenticateToken, async (req, res) => {
//   try {
//     const todos = await Todo.find({ userId: req.userId });
//     res.json(todos);
//   } catch (err) {
//     console.error("Error getting todos:", err);
//     res.status(500).json({ error: "Failed to fetch todos" });
//   }
// });

// app.post("/api/todos", authenticateToken, async (req, res) => {
//   try {
//     const { text } = req.body;

//     if (!text || !text.trim()) {
//       return res.status(400).json({ error: "Todo text cannot be empty" });
//     }

//     const newTodo = new Todo({ text: text.trim(), userId: req.userId });
//     const savedTodo = await newTodo.save();
//     res.status(201).json(savedTodo);
//   } catch (err) {
//     console.error("Error creating todo:", err);
//     res.status(500).json({ error: "Failed to create todo" });
//   }
// });

// app.put("/api/todos/:id", authenticateToken, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { text, completed } = req.body;
//     const updatedData = {};

//     if (text !== undefined) {
//       if (!text.trim()) {
//         return res.status(400).json({ error: "Todo text cannot be empty" });
//       }
//       updatedData.text = text.trim();
//     }

//     if (completed !== undefined) {
//       updatedData.completed = completed;
//     }

//     const updatedTodo = await Todo.findOneAndUpdate(
//       { _id: id, userId: req.userId },
//       updatedData,
//       { new: true }
//     );

//     if (!updatedTodo) {
//       return res.status(404).json({ error: "Todo not found" });
//     }

//     res.json(updatedTodo);
//   } catch (err) {
//     console.error("Error updating todo:", err);
//     res.status(500).json({ error: "Failed to update todo" });
//   }
// });

// app.delete("/api/todos/:id", authenticateToken, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deletedTodo = await Todo.findOneAndDelete({ _id: id, userId: req.userId });

//     if (!deletedTodo) {
//       return res.status(404).json({ error: "Todo not found" });
//     }

//     res.json({ success: true, id: id });
//   } catch (err) {
//     console.error("Error deleting todo:", err);
//     res.status(500).json({ error: "Failed to delete todo" });
//   }
// });

// // =====================================================
// // START SERVER
// // =====================================================

// const HOST = "0.0.0.0";
// app.listen(PORT, HOST, () => {
//   console.log(`Server running on port ${PORT}`);
// });

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { google } = require("googleapis");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "https://infinityresh.infinityfreeapp.com",
  "http://infinityresh.infinityfreeapp.com",
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, "");
      if (allowedOrigins.some((o) => o.replace(/\/$/, "") === cleanOrigin)) {
        callback(null, true);
      } else {
        callback(new Error("Blocked by CORS policy"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.get("/favicon.ico", (req, res) => res.status(204).end());

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("MONGO_URI is not configured");
}

const JWT_SECRET = process.env.JWT_SECRET || "fallback_jwt_secret_key";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const GOOGLE_CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL ||
  "https://todolist-r9lu.onrender.com/auth/google/callback";

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  "https://infinityresh.infinityfreeapp.com";

mongoose
  .connect(MONGO_URI, { family: 4 })
  .then(() => {
    console.log("Successfully connected to MongoDB!");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String },
    googleId: { type: String },
    role: {
      type: String,
      enum: ["user", "editor", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

const todoSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Todo = mongoose.model("Todo", todoSchema);

function createJWT(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role || "user",
    },
    JWT_SECRET,
    { expiresIn: "1d" }
  );
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Invalid authorization header" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.userEmail = decoded.email;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}

function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.userRole || !allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        error: `Access denied. Requires one of roles: ${allowedRoles.join(", ")}`,
      });
    }
    next();
  };
}

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: ["user", "editor", "admin"].includes(role) ? role : "user",
    });

    await newUser.save();
    res.status(201).json({ message: "Registration successful" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!user.password) {
      return res.status(401).json({
        error: "This account uses Google login. Please continue with Google.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = createJWT(user);
    res.json({
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

app.get("/auth/google", (req, res) => {
  try {
    const timestamp = Date.now();
    const randomHex = crypto.randomBytes(16).toString("hex");
    const statePayload = `${timestamp}:${randomHex}`;
    const state = Buffer.from(statePayload).toString("base64url");

    const authorizationUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["openid", "email", "profile"],
      state: state,
      prompt: "select_account",
      include_granted_scopes: true,
    });

    res.redirect(authorizationUrl);
  } catch (err) {
    console.error("Google OAuth error:", err);
    res.status(500).send("Unable to start Google login");
  }
});

app.get("/auth/google/callback", async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(`${FRONTEND_URL}/?oauthError=Google%20login%20cancelled`);
    }

    if (!state) {
      return res.status(400).send("OAuth state missing");
    }

    try {
      const decodedState = Buffer.from(state, "base64url").toString("utf-8");
      const [timestamp] = decodedState.split(":");
      const age = Date.now() - parseInt(timestamp, 10);

      if (isNaN(age) || age > 10 * 60 * 1000) {
        return res.status(400).send("OAuth state expired. Please try logging in again.");
      }
    } catch (e) {
      return res.status(400).send("Invalid OAuth state format");
    }

    if (!code) {
      return res.status(400).send("Google authorization code missing");
    }

    const { tokens } = await oauth2Client.getToken(code);
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID,
    });

    const googlePayload = ticket.getPayload();
    const googleId = googlePayload.sub;
    const googleEmail = googlePayload.email.toLowerCase().trim();
    const googleName = googlePayload.name || "Google User";

    let user = await User.findOne({ googleId: googleId });

    if (!user) {
      user = await User.findOne({ email: googleEmail });
    }

    if (!user) {
      user = new User({
        name: googleName,
        email: googleEmail,
        googleId: googleId,
        role: "user",
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
    }

    await user.save();

    const token = createJWT(user);

    res.redirect(`${FRONTEND_URL}/?token=${encodeURIComponent(token)}`);
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    res.redirect(`${FRONTEND_URL}/?oauthError=Google%20login%20failed`);
  }
});

app.get("/api/todos", authenticateToken, requireRole(["user", "editor", "admin"]), async (req, res) => {
  try {
    let todos;
    if (req.userRole === "admin") {
      // Admin can access their own tasks and others' tasks
      todos = await Todo.find().populate("userId", "name email role").sort({ createdAt: -1 });
    } else {
      // Standard user can only access their own tasks
      todos = await Todo.find({ userId: req.userId }).sort({ createdAt: -1 });
    }
    res.json(todos);
  } catch (err) {
    console.error("Error getting todos:", err);
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

app.post("/api/todos", authenticateToken, requireRole(["user", "editor", "admin"]), async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Todo text cannot be empty" });
    }

    const newTodo = new Todo({ text: text.trim(), userId: req.userId });
    let savedTodo = await newTodo.save();
    savedTodo = await savedTodo.populate("userId", "name email role");
    res.status(201).json(savedTodo);
  } catch (err) {
    console.error("Error creating todo:", err);
    res.status(500).json({ error: "Failed to create todo" });
  }
});

app.put("/api/todos/:id", authenticateToken, requireRole(["user", "editor", "admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { text, completed } = req.body;
    const updatedData = {};

    if (text !== undefined) {
      if (!text.trim()) {
        return res.status(400).json({ error: "Todo text cannot be empty" });
      }
      updatedData.text = text.trim();
    }

    if (completed !== undefined) {
      updatedData.completed = completed;
    }

    // Admin can update any task; standard user can only update their own
    const query = req.userRole === "admin" ? { _id: id } : { _id: id, userId: req.userId };
    const updatedTodo = await Todo.findOneAndUpdate(
      query,
      updatedData,
      { new: true }
    ).populate("userId", "name email role");

    if (!updatedTodo) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json(updatedTodo);
  } catch (err) {
    console.error("Error updating todo:", err);
    res.status(500).json({ error: "Failed to update todo" });
  }
});

app.delete("/api/todos/:id", authenticateToken, requireRole(["user", "editor", "admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    // Admin can delete any task; standard user can only delete their own
    const query = req.userRole === "admin" ? { _id: id } : { _id: id, userId: req.userId };
    const deletedTodo = await Todo.findOneAndDelete(query);

    if (!deletedTodo) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json({ success: true, id: id });
  } catch (err) {
    console.error("Error deleting todo:", err);
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

app.get("/api/admin/users", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.put("/api/admin/users/:id/role", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["user", "editor", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role specification" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role: role },
      { new: true, select: "-password" }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error("Error updating user role:", err);
    res.status(500).json({ error: "Failed to update user role" });
  }
});

const HOST = "0.0.0.0";
app.listen(PORT, HOST, () => {
  console.log(`Server running on port ${PORT}`);
});