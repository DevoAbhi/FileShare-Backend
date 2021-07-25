const express = require('express')
const path = require('path')
const schedule = require('node-schedule');
const schedulerJob = require('./services/scheduler')

// Initializing app
const app = express();

// Built-in Body-Parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// EJS configuration
app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'ejs');

// Public configuration
app.use(express.static('public'))

// Import routes
const filesRoutes = require('./routes/files')
const showRoutes = require('./routes/show')
const downloadRoutes = require('./routes/download')

// CORS headers
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-AUTH-TOKEN");
    res.setHeader("Access-Control-Allow-Methods",
    "GET, POST, PATCH,PUT, DELETE,OPTIONS");
  
    next();
});

// Use routes
app.use('/api/files', filesRoutes);
app.use('/files', showRoutes);
app.use('/file/download', downloadRoutes)

// Importing database config
const connectDB = require("./config/db");
connectDB();

// Run Cron Jobs
schedule.scheduleJob('0 0 * * *', () => {
    schedulerJob.deleteUploads()
})

const PORT = process.env.PORT || 3000;


// App listening
app.listen(PORT, () => {
    console.log(`Listening on PORT number -> ${PORT}`);
})