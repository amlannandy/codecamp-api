const hpp = require('hpp');
const cors = require('cors');
const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const helmet = require('helmet');
const xssClean = require('xss-clean');
const cookieParser = require('cookie-parser');
const fileupload = require('express-fileupload');
const expressMongoSanitizer = require('express-mongo-sanitize');

const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config({ path: './config/config.env' });

// Connect to Database
connectDB();

// Route files
const auth = require('./routes/auth');
const users = require('./routes/users');
const courses = require('./routes/courses');
const reviews = require('./routes/reviews');
const bootcamps = require('./routes/bootcamps');

const app = express();

//Body Server
app.use(express.json());

// Cookie parser
app.use(cookieParser());

//Dev loggin middleware
if (process.env.NODE_ENV == 'development') {
  app.use(morgan('dev'));
}

// File uploading
app.use(fileupload());

// Sanitize data
app.use(expressMongoSanitizer());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xssClean());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 1,
});

app.use(limiter);

// Prevent HTTP Params Polution
app.use(hpp());

// Enable CORS
app.use(cors());

// Set static folder
app.use(express.static(path.join((__dirname, 'public'))));

// Mount routes
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/courses', courses);
app.use('/api/v1/reviews', reviews);
app.use('/api/v1/bootcamps', bootcamps);

//Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}.`.blue.bold
      .inverse
  );
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(colors.red.underline(`Error: ${err.message}`));
  //Close server and exit process
  server.close(() => process.exit(1));
});
