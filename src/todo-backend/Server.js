const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { google } = require("googleapis");
const crypto = require("crypto");
require("dotenv").config();

// =====================================================
// CREATE EXPRESS APP
// =====================================================

const app = express();

const PORT = process.env.PORT || 5000;

// =====================================================
// MIDDLEWARE & CORS CONFIGURATION
// =====================================================

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

// Handle preflight requests
app.options("*", cors());

// Converts JSON request body into JavaScript object
app.use(express.json());

// =====================================================
// ENVIRONMENT VARIABLES
// =====================================================

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("MONGO_URI is not configured");
}
const JWT_SECRET = process.env.JWT_SECRET;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;

const FRONTEND_URL = process.env.FRONTEND_URL;

// =====================================================
// CONNECT TO MONGODB
// =====================================================

mongoose
  .connect(MONGO_URI, { family: 4 })
  .then(() => {
    console.log("Successfully connected to MongoDB!");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// =====================================================
// GOOGLE OAUTH CLIENT
// =====================================================

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
);

// =====================================================
// OAUTH STATE STORAGE
// =====================================================

// Used to temporarily store OAuth state values
const oauthStates = new Map();

// =====================================================
// USER SCHEMA
// =====================================================

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
    },

    googleId: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// =====================================================
// USER MODEL
// =====================================================

const User = mongoose.model("User", userSchema);

// =====================================================
// TODO SCHEMA
// =====================================================

const todoSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },

    completed: {
      type: Boolean,
      default: false,
    },

    // Connect Todo with User
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,

    // Convert MongoDB _id into id
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// =====================================================
// TODO MODEL
// =====================================================

const Todo = mongoose.model("Todo", todoSchema);

// =====================================================
// FUNCTION TO CREATE JWT
// =====================================================

function createJWT(user) {
  const token = jwt.sign(
    {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
    },
    JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );

  return token;
}

// =====================================================
// JWT AUTHENTICATION MIDDLEWARE
// =====================================================

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: "No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "Invalid authorization header",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(403).json({
      error: "Invalid or expired token",
    });
  }
}

// =====================================================
// REGISTER
// =====================================================

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        error: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      message: "Registration successful",
    });
  } catch (err) {
    console.error("Registration error:", err);

    res.status(500).json({
      error: "Registration failed",
    });
  }
});

// =====================================================
// LOGIN
// =====================================================

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    if (!user.password) {
      return res.status(401).json({
        error: "This account uses Google login. Please continue with Google.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const token = createJWT(user);

    res.json({
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);

    res.status(500).json({
      error: "Login failed",
    });
  }
});

// =====================================================
// GOOGLE LOGIN - START
// =====================================================

app.get("/auth/google", (req, res) => {
  try {
    const state = crypto.randomBytes(32).toString("hex");

    oauthStates.set(state, Date.now());

    setTimeout(
      () => {
        oauthStates.delete(state);
      },
      10 * 60 * 1000,
    );

    const scopes = ["openid", "email", "profile"];

    const authorizationUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      state: state,
      include_granted_scopes: true,
    });

    res.redirect(authorizationUrl);
  } catch (err) {
    console.error("Google OAuth error:", err);

    res.status(500).send("Unable to start Google login");
  }
});

// =====================================================
// GOOGLE LOGIN - CALLBACK
// =====================================================

app.get("/auth/google/callback", async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(
        `${FRONTEND_URL}/?oauthError=Google%20login%20cancelled`,
      );
    }

    if (!state || !oauthStates.has(state)) {
      return res.status(400).send("Invalid OAuth state");
    }

    oauthStates.delete(state);

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

    let user = await User.findOne({
      googleId: googleId,
    });

    if (!user) {
      user = await User.findOne({
        email: googleEmail,
      });
    }

    if (!user) {
      user = new User({
        name: googleName,
        email: googleEmail,
        googleId: googleId,
      });
    } else {
      if (!user.googleId) {
        user.googleId = googleId;
      }
    }

    await user.save();

    const token = createJWT(user);

    res.redirect(`${FRONTEND_URL}/#token=${encodeURIComponent(token)}`);
  } catch (err) {
    console.error("Google OAuth callback error:", err);

    res.redirect(`${FRONTEND_URL}/?oauthError=Google%20login%20failed`);
  }
});

// =====================================================
// GET TODOS
// =====================================================

app.get("/api/todos", authenticateToken, async (req, res) => {
  try {
    const todos = await Todo.find({
      userId: req.userId,
    });

    res.json(todos);
  } catch (err) {
    console.error("Error getting todos:", err);

    res.status(500).json({
      error: "Failed to fetch todos",
    });
  }
});

// =====================================================
// ADD TODO
// =====================================================

app.post("/api/todos", authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        error: "Todo text cannot be empty",
      });
    }

    const newTodo = new Todo({
      text: text.trim(),
      userId: req.userId,
    });

    const savedTodo = await newTodo.save();

    res.status(201).json(savedTodo);
  } catch (err) {
    console.error("Error creating todo:", err);

    res.status(500).json({
      error: "Failed to create todo",
    });
  }
});

// =====================================================
// UPDATE TODO
// =====================================================

app.put("/api/todos/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { text, completed } = req.body;

    const updatedData = {};

    if (text !== undefined) {
      if (!text.trim()) {
        return res.status(400).json({
          error: "Todo text cannot be empty",
        });
      }

      updatedData.text = text.trim();
    }

    if (completed !== undefined) {
      updatedData.completed = completed;
    }

    const updatedTodo = await Todo.findOneAndUpdate(
      {
        _id: id,
        userId: req.userId,
      },
      updatedData,
      {
        new: true,
      },
    );

    if (!updatedTodo) {
      return res.status(404).json({
        error: "Todo not found",
      });
    }

    res.json(updatedTodo);
  } catch (err) {
    console.error("Error updating todo:", err);

    res.status(500).json({
      error: "Failed to update todo",
    });
  }
});

// =====================================================
// DELETE TODO
// =====================================================

app.delete("/api/todos/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTodo = await Todo.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!deletedTodo) {
      return res.status(404).json({
        error: "Todo not found",
      });
    }

    res.json({
      success: true,
      id: id,
    });
  } catch (err) {
    console.error("Error deleting todo:", err);

    res.status(500).json({
      error: "Failed to delete todo",
    });
  }
});

// =====================================================
// START SERVER
// =====================================================

const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Server running on port ${PORT}`);
});
// const express = require("express");
// const cors = require("cors");
// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const { google } = require("googleapis");
// const crypto = require("crypto");
// const { exec } = require("child_process");
// require("dotenv").config();

// // =====================================================
// // AUTOMATICALLY START MONGODB SERVICE (WINDOWS)
// // =====================================================

// const startMongoDBService = () => {
//   // Execute Windows command to start MongoDB service automatically
//   exec("net start MongoDB", (error, stdout, stderr) => {
//     if (error) {
//       // Common expected notice if MongoDB is already running or needs admin rights
//       console.log("MongoDB Service Notice:", error.message);
//       return;
//     }
//     console.log("MongoDB Service Output:", stdout);
//   });
// };

// // Attempt to start MongoDB service on script launch
// startMongoDBService();

// // =====================================================
// // CREATE EXPRESS APP
// // =====================================================

// const app = express();

// const PORT = process.env.PORT || 5000;

// // =====================================================
// // MIDDLEWARE
// // =====================================================

// // Allows React frontend to communicate with backend
// app.use(cors({
//   origin: ['https://your-infinityfree-domain.infinityfreeapp.com', 'http://localhost:5173'],
//   credentials: true
// }));
// // Converts JSON request body into JavaScript object
// app.use(express.json());

// // =====================================================
// // ENVIRONMENT VARIABLES
// // =====================================================

// const MONGO_URI = process.env.MONGO_URI;

// if (!MONGO_URI) {
//   throw new Error("MONGO_URI is not configured");
// }
// const JWT_SECRET = process.env.JWT_SECRET;

// const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

// const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;

// const FRONTEND_URL = process.env.FRONTEND_URL;

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
//   GOOGLE_CALLBACK_URL,
// );

// // =====================================================
// // OAUTH STATE STORAGE
// // =====================================================

// // Used to temporarily store OAuth state values
// const oauthStates = new Map();

// // =====================================================
// // USER SCHEMA
// // =====================================================

// const userSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       trim: true,
//       lowercase: true,
//     },

//     password: {
//       type: String,
//     },

//     googleId: {
//       type: String,
//     },
//   },
//   {
//     timestamps: true,
//   },
// );

// // =====================================================
// // USER MODEL
// // =====================================================

// const User = mongoose.model("User", userSchema);

// // =====================================================
// // TODO SCHEMA
// // =====================================================

// const todoSchema = new mongoose.Schema(
//   {
//     text: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     completed: {
//       type: Boolean,
//       default: false,
//     },

//     // Connect Todo with User
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//   },
//   {
//     timestamps: true,

//     // Convert MongoDB _id into id
//     toJSON: {
//       transform: (doc, ret) => {
//         ret.id = ret._id.toString();
//         delete ret._id;
//         delete ret.__v;
//         return ret;
//       },
//     },
//   },
// );

// // =====================================================
// // TODO MODEL
// // =====================================================

// const Todo = mongoose.model("Todo", todoSchema);

// // =====================================================
// // FUNCTION TO CREATE JWT
// // =====================================================

// function createJWT(user) {
//   const token = jwt.sign(
//     {
//       // Information stored inside JWT
//       userId: user._id.toString(),
//       name: user.name,
//       email: user.email,
//     },
//     JWT_SECRET,
//     {
//       // JWT will expire after 1 day
//       expiresIn: "1d",
//     },
//   );

//   return token;
// }

// // =====================================================
// // JWT AUTHENTICATION MIDDLEWARE
// // =====================================================

// function authenticateToken(req, res, next) {
//   // Get Authorization header
//   const authHeader = req.headers.authorization;

//   // If Authorization header doesn't exist
//   if (!authHeader) {
//     return res.status(401).json({
//       error: "No token provided",
//     });
//   }

//   // Expected format: Authorization: Bearer TOKEN
//   const token = authHeader.split(" ")[1];

//   // If token doesn't exist
//   if (!token) {
//     return res.status(401).json({
//       error: "Invalid authorization header",
//     });
//   }

//   try {
//     // Verify JWT
//     const decoded = jwt.verify(token, JWT_SECRET);

//     // Store user ID in request
//     req.userId = decoded.userId;

//     // Continue to API route
//     next();
//   } catch (err) {
//     return res.status(403).json({
//       error: "Invalid or expired token",
//     });
//   }
// }

// // =====================================================
// // REGISTER
// // =====================================================

// app.post("/api/register", async (req, res) => {
//   try {
//     // Get data from React
//     const { name, email, password } = req.body;

//     // Check fields
//     if (!name || !email || !password) {
//       return res.status(400).json({
//         error: "All fields are required",
//       });
//     }

//     // Password length
//     if (password.length < 6) {
//       return res.status(400).json({
//         error: "Password must be at least 6 characters",
//       });
//     }

//     // Convert email to lowercase
//     const normalizedEmail = email.toLowerCase().trim();

//     // Check whether email already exists
//     const existingUser = await User.findOne({
//       email: normalizedEmail,
//     });

//     if (existingUser) {
//       return res.status(400).json({
//         error: "Email already registered",
//       });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create user
//     const newUser = new User({
//       name: name.trim(),
//       email: normalizedEmail,
//       password: hashedPassword,
//     });

//     await newUser.save();

//     // Send response
//     res.status(201).json({
//       message: "Registration successful",
//     });
//   } catch (err) {
//     console.error("Registration error:", err);

//     res.status(500).json({
//       error: "Registration failed",
//     });
//   }
// });

// // =====================================================
// // LOGIN
// // =====================================================

// app.post("/api/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Check fields
//     if (!email || !password) {
//       return res.status(400).json({
//         error: "Email and password are required",
//       });
//     }

//     const normalizedEmail = email.toLowerCase().trim();

//     // Find user
//     const user = await User.findOne({
//       email: normalizedEmail,
//     });

//     // User doesn't exist
//     if (!user) {
//       return res.status(401).json({
//         error: "Invalid email or password",
//       });
//     }

//     // Google-only account
//     if (!user.password) {
//       return res.status(401).json({
//         error: "This account uses Google login. Please continue with Google.",
//       });
//     }

//     // Compare password with hash
//     const passwordMatch = await bcrypt.compare(password, user.password);

//     if (!passwordMatch) {
//       return res.status(401).json({
//         error: "Invalid email or password",
//       });
//     }

//     // Create JWT
//     const token = createJWT(user);

//     // Send token to React
//     res.json({
//       token: token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//       },
//     });
//   } catch (err) {
//     console.error("Login error:", err);

//     res.status(500).json({
//       error: "Login failed",
//     });
//   }
// });

// // =====================================================
// // GOOGLE LOGIN - START
// // =====================================================

// app.get("/auth/google", (req, res) => {
//   try {
//     // Create random state
//     const state = crypto.randomBytes(32).toString("hex");

//     // Save state
//     oauthStates.set(state, Date.now());

//     // Delete state after 10 minutes
//     setTimeout(
//       () => {
//         oauthStates.delete(state);
//       },
//       10 * 60 * 1000,
//     );

//     // Google permissions
//     const scopes = ["openid", "email", "profile"];

//     // Create Google login URL
//     const authorizationUrl = oauth2Client.generateAuthUrl({
//       access_type: "offline",
//       scope: scopes,
//       state: state,
//       include_granted_scopes: true,
//     });

//     // Redirect browser to Google
//     res.redirect(authorizationUrl);
//   } catch (err) {
//     console.error("Google OAuth error:", err);

//     res.status(500).send("Unable to start Google login");
//   }
// });

// // =====================================================
// // GOOGLE LOGIN - CALLBACK
// // =====================================================

// app.get("/auth/google/callback", async (req, res) => {
//   try {
//     const { code, state, error } = req.query;

//     // User cancelled Google login
//     if (error) {
//       return res.redirect(
//         `${FRONTEND_URL}/?oauthError=Google%20login%20cancelled`,
//       );
//     }

//     // Check state
//     if (!state || !oauthStates.has(state)) {
//       return res.status(400).send("Invalid OAuth state");
//     }

//     // Delete state after use
//     oauthStates.delete(state);

//     // Check authorization code
//     if (!code) {
//       return res.status(400).send("Google authorization code missing");
//     }

//     // Exchange code for Google tokens
//     const { tokens } = await oauth2Client.getToken(code);

//     // Verify Google ID token
//     const ticket = await oauth2Client.verifyIdToken({
//       idToken: tokens.id_token,
//       audience: GOOGLE_CLIENT_ID,
//     });

//     // Get Google information
//     const googlePayload = ticket.getPayload();
//     const googleId = googlePayload.sub;
//     const googleEmail = googlePayload.email.toLowerCase().trim();
//     const googleName = googlePayload.name || "Google User";

//     // Find user using Google ID
//     let user = await User.findOne({
//       googleId: googleId,
//     });

//     // If Google ID not found, check email
//     if (!user) {
//       user = await User.findOne({
//         email: googleEmail,
//       });
//     }

//     // Create new user if still not found
//     if (!user) {
//       user = new User({
//         name: googleName,
//         email: googleEmail,
//         googleId: googleId,
//       });
//     } else {
//       // Existing account - Add Google ID if missing
//       if (!user.googleId) {
//         user.googleId = googleId;
//       }
//     }

//     // Save user
//     await user.save();

//     // Create application JWT
//     const token = createJWT(user);

//     // Send user back to React
//     res.redirect(`${FRONTEND_URL}/#token=${encodeURIComponent(token)}`);
//   } catch (err) {
//     console.error("Google OAuth callback error:", err);

//     res.redirect(`${FRONTEND_URL}/?oauthError=Google%20login%20failed`);
//   }
// });

// // =====================================================
// // GET TODOS
// // =====================================================

// app.get("/api/todos", authenticateToken, async (req, res) => {
//   try {
//     // Get only logged-in user's todos
//     const todos = await Todo.find({
//       userId: req.userId,
//     });

//     res.json(todos);
//   } catch (err) {
//     console.error("Error getting todos:", err);

//     res.status(500).json({
//       error: "Failed to fetch todos",
//     });
//   }
// });

// // =====================================================
// // ADD TODO
// // =====================================================

// app.post("/api/todos", authenticateToken, async (req, res) => {
//   try {
//     // Get text from React
//     const { text } = req.body;

//     // Check empty todo
//     if (!text || !text.trim()) {
//       return res.status(400).json({
//         error: "Todo text cannot be empty",
//       });
//     }

//     // Create Todo
//     const newTodo = new Todo({
//       text: text.trim(),
//       userId: req.userId,
//     });

//     // Save Todo
//     const savedTodo = await newTodo.save();

//     // Send saved Todo
//     res.status(201).json(savedTodo);
//   } catch (err) {
//     console.error("Error creating todo:", err);

//     res.status(500).json({
//       error: "Failed to create todo",
//     });
//   }
// });

// // =====================================================
// // UPDATE TODO
// // =====================================================

// app.put("/api/todos/:id", authenticateToken, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { text, completed } = req.body;

//     const updatedData = {};

//     if (text !== undefined) {
//       if (!text.trim()) {
//         return res.status(400).json({
//           error: "Todo text cannot be empty",
//         });
//       }

//       updatedData.text = text.trim();
//     }

//     if (completed !== undefined) {
//       updatedData.completed = completed;
//     }

//     // Update only user's own todo
//     const updatedTodo = await Todo.findOneAndUpdate(
//       {
//         _id: id,
//         userId: req.userId,
//       },
//       updatedData,
//       {
//         new: true,
//       },
//     );

//     if (!updatedTodo) {
//       return res.status(404).json({
//         error: "Todo not found",
//       });
//     }

//     res.json(updatedTodo);
//   } catch (err) {
//     console.error("Error updating todo:", err);

//     res.status(500).json({
//       error: "Failed to update todo",
//     });
//   }
// });

// // =====================================================
// // DELETE TODO
// // =====================================================

// app.delete("/api/todos/:id", authenticateToken, async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Delete only user's todo
//     const deletedTodo = await Todo.findOneAndDelete({
//       _id: id,
//       userId: req.userId,
//     });

//     if (!deletedTodo) {
//       return res.status(404).json({
//         error: "Todo not found",
//       });
//     }

//     res.json({
//       success: true,
//       id: id,
//     });
//   } catch (err) {
//     console.error("Error deleting todo:", err);

//     res.status(500).json({
//       error: "Failed to delete todo",
//     });
//   }
// });

// // =====================================================
// // START SERVER
// // =====================================================

// const HOST = "0.0.0.0";

// app.listen(PORT, HOST, () => {
//   console.log(`Server running on port ${PORT}`);
// });


//mongodb+srv://todoappuser:todoapp@cluster0.as943ds.mongodb.net/?todoappuser