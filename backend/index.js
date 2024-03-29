const express = require("express");
const dotenv = require('dotenv')
const connectDB = require("./config/db");
const cors = require("cors");
// const Student = require("./models/student");
// const Division = require("./models/division");
// const Batch = require("./models/batch");
// const MentorshipGrp = require("./models/mentorshipGrp");
// const Subject = require("./models/assignments");
// const Teacher = require("./models/division");
// const Assignment = require("./models/student");
const teacherController = require('../backend/controllers/teacherController');
const  studentController  = require("./controllers/studentController");
const adminController = require("../backend/controllers/adminController")

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 8080;

app.post('/registerTeacher',teacherController.registerTeacher);
app.post('/registerStudent',studentController.registerStudent);
app.post('/loginStudent',studentController.loginStudent);
app.post('/loginTeacher',teacherController.loginTeacher);
app.post('/loginAdmin',adminController.loginAdmin);


app.get('/getteachers',adminController.getTeachers);
app.get('/getbatches',adminController.getBatches);
app.post('/addbatches',adminController.addBatch);

app.post('/adddivsion',adminController.addDivision);
app.get('/getdivison',adminController.getDivisions);

app.listen(port, () => {
    console.log(
      `Node Server Running on Port ${process.env.PORT || 8080}`
    );
});