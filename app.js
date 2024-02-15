
const express=require("express")
const {MongoClient, ObjectId}=require('mongodb')
const fs=require("fs")
const expressFormidable=require('express-formidable')
const bodyParser=require('body-parser')
const Port=process.env.PORT || 2020
const uri='mongodb+srv://lavex2002:182002@cluster0.dfv5ser.mongodb.net/?retryWrites=true&w=majority'
const app=express()
const client=new MongoClient(uri)
app.use(expressFormidable())
app.set("view engine","ejs")
app.use(bodyParser.urlencoded({extended:false}))
//app.use(express.urlencoded({ extended: true }));


 client.connect()
console.log('database connected succefully!');
  
app.post("/upload", async (req,res)=>{
console.log(req.files);
const file=req.files.image
if(!file){
    console.log('file is not detecting')
    return
}
const fileData=await fs.readFileSync(file.path)
const filePath="./uploads/" + file.name
await fs.writeFileSync(filePath,fileData)

client.db().collection("recipesList").insertOne({
        name:file.name,
        path:filePath,
        size:file.size
})
res.send('data inserted succeffully!')
})
app.get('/image/:_id',async(req,res)=>{
   const  _id=req.params._id
   const image=await client.db().collection('recipesList').findOne({
    _id:new ObjectId(_id)
   })
   if(image==null){
     res.send("Image not found")
   }
   const fileData=fs.readFileSync(image.path)
   if(!fileData){
    console.error(fileData);
    return
   }
   let contentType
    if (req.url.endsWith('.png')) {
        contentType = 'image/png';
    } else if (req.url.endsWith('.jpg') || req.url.endsWith('.jpeg')) {
        contentType = 'image/jpeg';
    } else if(req.url.endsWith('.gif')) {
        contentType = 'image/gif';
    } else if(req.url.endsWith('.jfif')) {
        contentType = 'image/jfif';
    } 
   res.writeHead(200,{
    "content-type":'image/jpeg',
    "content-length":fileData.length
   })
   res.end(fileData)

})
app.get("/",async (req,res)=>{
    const images=await client.db().collection('recipesList').find({}).toArray()
    console.log(images)
     res.render("index",{
        images:images
     })
})
     

   



app.listen(Port,()=>{
    console.log("SERVER is runnuing");
})