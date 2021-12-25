import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import mysql from 'mysql';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import ejs from 'ejs';

const app = express();
app.use(cors());
app.use(bodyParser.json({extended: true}));

var __dirname = path.resolve();
var options = {
    root: path.join(__dirname,'views'),
};
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const PORT = process.env.PORT||5000;



const JWT_SECRET = 'sdjkfh8923yhjdksbfma@#*(&@*!^#&@bhjb2qiuhesdbhjdsfg839ujkdhfjk'

const conn = mysql.createConnection({
    database: 'webdevtask',
    host: 'localhost',
    user: 'root',
    password: 'host123',
});

conn.connect((err) => {
    if(err){
        console.log(err);
        throw err;
    }
    console.log("Connection established!");
});

app.get('/', (req, res) => {
    res.sendFile('home.html', options);
});
app.get('/login', (req, res) => {
    var __dirname = path.resolve();
    var options = {
        root: path.join(__dirname,'views'),
    };
    res.sendFile('login.html', options);
});

app.post('/api/login',async (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    conn.query(`SELECT * FROM users WHERE username = '${username}'`, async (err, result) => {
        if(err){
            console.log(err);
            throw err;
        }   
        console.log(result[0].Password);
        if (await bcrypt.compare(password, result[0].Password)) {
            const token = jwt.sign(
                {
                    id: result[0].Id,
                    username: username
                },
                JWT_SECRET,
                { expiresIn: '30s'}
            )
            console.log(token);
            res.json({ status: 'ok', data: token })
        }
        else
        {
            res.json({ status: 'error', error: 'Invalid username/password' })
        }
    });
    
});

app.post('/api/register',async (req,res) => {
    console.log(req.body);
    
    const username = req.body.username;
    const password = req.body.password;
    const confirm = req.body.password2;
    const name = req.body.name;
    const dob = req.body.dob;
    const phone = req.body.phone;

    if(password !== confirm){
        res.status(400).send('Passwords do not match');
    }
    else{
    const pw = await bcrypt.hash(password, 10);
    try{
        conn.query(`INSERT INTO users (Name,Username,Password,Dob,Phone) VALUES (?,?,?,?,?)`,[name,username,pw,dob,phone],(err,result)=>{
            if(err){
                console.log(err);
                throw err;
            }
        });
    }
    catch(err){
        console.log(err);
        throw err;
    }
    res.json({status: 'ok'});}
});

function authUser(req,res,next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ');
    req.token = token;
    next();
    if(token==null) return res.sendStatus(401);
}
app.post('/api/products',authUser,(req,res) => {
    jwt.verify(token,JWT_SECRET,(err,user) => {
        if(err) 
            return res.sendStatus(403);
    })
});
app.get('/products',(req,res) => {
    conn.query('SELECT * FROM products', function(err, result) {
        if(err){
            return err;
        } else {
            console.log(result.length);
            const obj = {print: result};
            res.render('products', obj);
        }
    });
})
app.post('/api/products/add',(req,res) => {
    const name = req.body.name;
    const qty = req.body.qty;
    conn.query(`INSERT INTO products (Name,Quantity) VALUES (?,?)`,[name,qty],(err,result)=>{
        if(err){
            console.log(err);
            throw err;
        }
        console.log(result);
    });
    res.json({status: 'ok'});
});
app.post('api/products/edit',(req,res) => {
    const newqty = req.body.newqty;
    const id = req.body.i;
    conn.query(`UPDATE products SET Quantity = '(?)' WHERE Id = '(?)'`,[newqty,id],(err,result)=>{
        if(err){
            console.log(err);
            throw err;
        }
        console.log(result);
    });
    res.json({status: 'ok'});
});
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});