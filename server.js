require("dotenv").config()
const multer = require("multer")
const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); 
const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true}))

const File = require("./models/File")
mongoose.set("strictQuery", false);
const upload = multer({ dest: "uploads"})

mongoose.connect(process.env.DATABASE_URL)


// const mongoose = require('mongoose')

// const url = `Connection String`;

// const connectionParams={
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useUnifiedTopology: true 
// }
// mongoose.connect(process.env.DATABASE_URL,connectionParams)
//     .then( () => {
//         console.log('Connected to the database ')
//     })
//     .catch( (err) => {
//         console.error(`Error connecting to the database. n${err}`);
//     })





app.set("view engine", "ejs");
app.get("/", (req, res)=>{
    res.render("Index");
})

app.post("/upload", upload.single("file"), async (req, res)=>{
    const filedata = {
        path: req.file.path,
        originalName: req.file.originalname,
    }
    if(req.body.password != null && req.body.password !==""){
        filedata.password = await bcrypt.hash (req.body.password,10 )
    }
    const file = await File.create(filedata);
    // res.send(file.originalName);
    res.render("index", { fileLink: `${req.headers.origin}/file/${file.id}`})
})

app.get("/file/:id" , handleDownload)
app.post("/file/:id" , handleDownload)


async function handleDownload(req, res){
    const file = await File.findById(req.params.id)
    if(file.password != null){
        if(req.body.password==null){
            res.render("password")
            return
        }
        if(!await bcrypt.compare(req.body.password, file.password)){
            res.render("password", {error:true})
            return 
        }
    }
    file.downloadCount++
    await file.save()
    console.log(file.downloadCount)
    res.download(file.path, file.originalName)
}

    


app.listen(process.env.PORT);