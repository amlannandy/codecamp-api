const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const fileupload = require('express-fileupload');

const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config({ path: './config/config.env' });

// Connect to Database
connectDB();

// Route files
const auth = require('./routes/auth');
const courses = require('./routes/courses');
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

// Set static folder
app.use(express.static(path.join((__dirname, 'public'))));

// Mount routes
app.use('/api/v1/auth', auth);
app.use('/api/v1/courses', courses);
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
