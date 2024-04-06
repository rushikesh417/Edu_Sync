const Student = require("../models/student")
const Teacher = require("../models/teacher")

const Conversation = require("../models/conversation")
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');
const Assignment = require("../models/assignments");


exports.registerStudent = async(req,res)=>{
    const {regid,fname,lname,email,mobile,division,year,rollno,batch,password} = req.body;
    
    if(!regid || !fname || !lname || !email || !mobile || !division || !year || !rollno || !batch ||!password){
        return res.status(400).send("Fill complete details")
    }

    const user = await Student.findOne({email:email});
    if(user) return res.status(409).send("Student already exists");

    try{
        // const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password,10);
        const newStudent = new Student({
            regid:regid,
            fname:fname,
            lname:lname,
            email:email,
            mobile:mobile,
            division:division,
            year:year,
            rollno:rollno,
            batch:batch,
            password:hashedPassword
        })
        await newStudent.save();
        return res.status(201).json(newStudent);
    }
    catch(err){
        return res.status(400).json({message : err.message});
    }
}

exports.loginStudent = async(req,res)=>{
    const {email,password} = req.body;
    if(!email || !password){
        return res.status(400).send("Fill All Details");
    }

    const user = await Student.findOne({email});
    console.log(user);
    if(!user) return res.status(409).send("Student Does not exist");
   
    const isMatch = await bcrypt.compare(req.body.password,user.password);
    console.log(isMatch,password,user.password);
    if(!isMatch) return res.status(401).send("Invalid Password");
    try{
        const token=jwt.sign({email,student_id:user._id},
            process.env.SECRET_KEY,
            {
                expiresIn:"1m",
            }
        )
        res.cookie("jwt",token,{httpOnly:true,secure:true,maxAge:60000})
        user.token=token;
        console.log("Login successfull")
        return res.status(200).json(user)
    }
    catch(err){
        return res.status(400).json({message:err.message});
    }

}

exports.addStudentChats = async (req, res) => {
    try {
        const studentId = req.student.student_id;
        const {teacherId} = req.params;
        const sender = "student";
        const receiver = "teacher";
        const message = req.body.message;

        // Find the teacher by ID
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found' });
        }

        // Construct chat object
        const chat = {
            sender: sender,
            receiver: receiver,
            message: message
        };

        // Create conversation or find existing one
        let conversation = await Conversation.findOne({ teacherId: teacherId, studentId: studentId });

        // If conversation doesn't exist, create a new one
        if (!conversation) {
            conversation = new Conversation({
                teacherId: teacherId,
                studentId: studentId,
                chats: [chat] // Add the chat to the chats array
            });
        } else {
            // If conversation exists, push the new chat to the existing chats array
            conversation.chats.push(chat);
        }

        // Save the conversation
        await conversation.save();

        res.status(201).json({ message: 'Chat added successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getStudentsChats = async (req, res) => {
    try {
        const studentId = req.student.student_id;
        const {teacherId} = req.params;

        // Find conversation between the teacher and student
        const conversation = await Conversation.findOne({ teacherId: teacherId, studentId: studentId });

        // Check if conversation exists
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        // Return the chats from the conversation
        res.status(200).json({ chats: conversation });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAssignments = async(req,res)=>{
    const studentID = req.student.student_id;
    const assignments = await Assignment.find({student_id:studentID});

    return res.status(200).json(assignments);
}

exports.getCompletedAssignments = async(req,res)=>{
    const studentID = req.student.student_id;
    const assignments = await Assignment.find({student_id:studentID,isComplete:true});

    return res.status(200).json(assignments);
}

exports.getIncompleteAssignments = async(req,res)=>{
    const studentID = req.student.student_id;
    const assignments = await Assignment.find({student_id:studentID,isComplete:false});

    return res.status(200).json(assignments);
}

exports.getCurrentStudent=async(req,res)=>{
    try{
        const student=await Student.findById(req.student.student_id);
        if(!student){
            return res.status(400).json("No teacher found")
        }
        return res.status(200).json(student);
    }catch(error){
        res.status(500).json({error:error.message});
    }
}