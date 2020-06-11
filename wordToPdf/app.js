const express = require("express")
const upload = require("express-fileupload")
const docxConverter = require('docx-pdf');
const nodemailer = require("nodemailer");
require("dotenv").config();

const port = process.env.PORT

const app = express();

let downloadPath;

app.use(upload());

app.get("/", (req,res) => {
    res.sendFile(__dirname + "/public/index.html");
})

app.post("/upload", (req, res) => {
    if(req.files.upfile) {
        const file = req.files.upfile;
        const name = file.name;
        const type = file.mimetype;
        const uplaodpath = __dirname +"/word/" + name;

        let helpName = name.substring(0,name.length-5);

        file.mv(uplaodpath, (err) => {
            if(err){
                console.log("filed!", name, err)
                res.send("error occured")
            } else{
                downloadPath = __dirname + `/pdf/${helpName}.pdf`;
            }
        })

        docxConverter(`word/${req.files.upfile.name}`,`pdf/${helpName}.pdf`,function(err){
            if(err){
              console.log(err);
            }
          });
    } else {
        res.send("No file selected!")
    }
})
app.get("/download", (req,res) => {
    res.download(downloadPath)
})

app.post('/email', (req, res) => {
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "hadzajlicemir@gmail.com", 
      pass: process.env.PASSWORD
    }
  });
  const mailOptions = {
    from: "hadzajlicemir@gmail.com",
    to: req.body.toEmail.toString(),
    subject: "WordToPdf",
    text: "",
    attachments: [
      {
        path: downloadPath
      }
    ]
  }

  transporter.sendMail(mailOptions,(error,info)=>{
    if(error){
      console.log(error);
    }
  })
})

app.listen(port, function() {
    console.log("Connected!")
})