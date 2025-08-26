const http=require('http');
const dotenv=require('dotenv').config()
const express=require('express');
const {Pool}=require('pg');
const session=require('express-session');
const { hostname, type } = require('os');
const { text } = require('stream/consumers');
const path = require('path');
const bodyParser=require('body-parser');
const cron=require('node-cron');
const cache=require('memory-cache');
const moment=require('moment');
const exp = require('constants');
const nodemailer=require('nodemailer');
const crypto=require('crypto');
const bcrypt=require('bcryptjs')
const Paystack=require('paystack');
const paystack=Paystack(process.env.PAYPAL_SECRET_KEY);
const cors=require('cors');
const { message } = require('emailjs');
const e = require('express');
const { emit } = require('process');
const { compileFunction } = require('vm');
const app=express();
app.use(cors())
app.use(bodyParser.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,'static')))
let roomID;
let roomId;
app.use(session({
    resave:false,
    saveUninitialized:true,
    secret:process.env.DB_PASS,
    cookie:{
        secure:true,
        maxAge:1000 * 60 * 60 * 24

    }
}))

process.on('unhandledRejection',(reason,promise)=>{
    console.error("Unhandled Rejection at:" + '' + JSON.stringify(promise) , 'Reason:' + " " + reason)
})

app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", 
        "default-src 'self'; " + 
        "font-src 'self' https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/webfonts/fa-brands-400.woff2; "+
        "script-src 'self' https://*.datadoghq.com https://js.paystack.co; " + 
        "style-src 'self' https://paystack.com 'unsafe-inline' https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css ; " +  
        "frame-src 'self' https://checkout.paystack.com; " +  
        "connect-src 'self' https://*.datadoghq.com https://4257-102-90-82-250.ngrok-free.app;");
    next();
});


const pool = new Pool({
  connectionString:"postgresql://twosmilehotel_user:LImxRa6NacLpclVVMMtvZwYTbvqHGpB1@dpg-d2ljpv3e5dus738tkisg-a.frankfurt-postgres.render.com/twosmilehotel",
  ssl: {
    rejectUnauthorized: false,
  },
});

console.log('Along the line', process.env.DB_PASS,process.env.DB_USER,process.env.PAYPAL_SECRET_KEY,process.env.DB_PORT);

app.use(express.json())
app.get('/',async (req,res)=>{
    res.sendFile(path.join(__dirname,'static','Register.html'));
})

app.use((req, res, next) => {
    if (req.path.endsWith('.html')) {
        const newPath = req.path.slice(0, -5);
        return res.redirect(301, newPath);
    }
    next();
});


function checkAuth(req, res, next) { if (req.session && req.session.user) { next();} 
else { res.redirect('/verify.html');
    }
     }

    app.get('/table.html', checkAuth, (req, res) => { res.sendFile(path.join(__dirname, 'public', 'table.html')); });

async function createTable(){
    try{
        await pool.connect()
        await pool.query('begin');
        let tab=`create table if not exists twosmilehotelusers(
        id serial primary key,
        firstname varchar(50) ,
        lastname varchar(50) ,
        passowrd varchar(60) ,
        email varchar(50) unique not null,
        tel varchar(40) unique not null,
        days integer,
        created_at timestamp default current_timestamp
        )`
        let rooms=`
        create table if not exists twosmilerooms(
        id serial primary key,
        customer_name varchar(50),
        room_type varchar(50),
        room_number integer unique not null,
        days integer,
        email varchar(50),
        phone_numbers varchar(60),
        extras varchar(50),
        available boolean default false
        )
        `
        let bookings=`
        create table if not exists twosmilebookings(
        id serial primary key,
        customer_name varchar(50),
        type varchar(50),
        price integer,
        check_in date,
        check_out date,
        no_of_rooms integer,
        payment_status varchar(50),
        email varchar(50),
        phone_numbers varchar(50),
        extras varchar(60),
        days integer,
        points integer,
        last_updated timestamp without time zone,
        )
        `
        let receipt=`
        create table if not exists twosmilereceipt(
        id serial primary key,
        name varchar(60),
        email varchar(60),
        amount varchar(30),
        currency varchar(40),
        paidAt timestamp without time zone,
        status varchar(50),
        ref varchar(80),
        bank varchar(50),
        cardType varchar(60),
        channel varchar(50) 
        )
        `
        await pool.query(receipt);
        await pool.query(tab)
        await pool.query(rooms)
        await pool.query(bookings)
        await pool.query('commit')
        console.log('Table created')
    }catch(err){
        await pool.query('rollback')
        if(err) throw console.log(err)
    }
}

createTable()
async function insertTable() {
    try{
    await pool.query("begin")
    const roomtypes=['Moderate'];
    let roomtype=''

    for(let i=1;i<=2;i++){
         roomtype=roomtypes[i];
         const roomNum= i;

    let insert={
        text:`insert into twosmilerooms(room_type,room_number,available) values($1,$2,$3)`,
        value:['Platinum Suite',roomNum,true]
    }
/**
 * app.get('/pay.html',async(req,res)=>{
    res.sendFile(path.join(__dirname,'static','pay.html'))
})    
 */
    const {text,value} = insert;
    await pool.query(text,value);
    }

    await pool.query('commit');
    //await pool.query('select setval(rooms_id_seq,1,true)')
    console.log("It actually loaded")
    }catch(error){
        console.log(error.stack);
        await pool.query("rollback")
        if(err) throw console.error("Error loading rooms into the table" + err);
    }
}

let fixEps=async()=>{
    try {
        for(let i=3; i<=5;i++){
        await pool.query('insert into twosmilerooms(room_type,room_number,available) values($1,$2,$3)',['Deluxe Suite',i,true]);
        console.log("Deluxe upload complete...");
    }
    } catch (error) {
        console.error("Error in eps: ",error);
    }
}
fixEps();

let fixEStandard=async()=>{
    try {
        for(let i=6; i<=13; i++){
        await pool.query('insert into twosmilerooms(room_type,room_number,available) values($1,$2,$3)' ,['Emperial Standard',i,true]);
        console.log("EStandard working complete...");
    }
    } catch (error) {
        console.error("Error in standard rooms ",error)
    }
}
    fixEStandard()

let fixRoyal=async()=>{
    try {
        for(let i=14; i<=19; i++){
        await pool.query('insert into twosmilerooms(room_type,room_number,available) values($1,$2,$3)',['Royal Standard',i,true]);
        console.log('Royal room update complete');
    }
    } catch (error) {
        console.error("Error for royal rooms upload :",error);
    }
}

let fixRoomCOn=async()=>{
    await pool.query('insert into twosmilerooms(room_type,room_number,available) values($1,$2,$3)',['Conference Room',20,true]);
}
fixRoomCOn()
fixRoyal();
insertTable()

 app.post('/login',async (req,res)=>{
    try{
        const {firstname,password,lastname,email} = req.body;
        let check={
            text:"select * from twosmilehotelusers where email=$1",
            value:[email]
        }
        const {text,value} = check;
        let inf= await pool.query(text,value);
        let info= inf.rows[0] || [];
        console.log(password,info.passowrd,email)
        const passwordCheck =await bcrypt.compare(password,info.passowrd)
        //const passwordCheck= password === info.passowrd;
        if(passwordCheck){
             req.session.info= {
                firstname:info.firstname,
                lastname:info.lastname,
                email:info.email
            }
           return res.json({sMsg:'succ',sRed:'/dashboard.html'});
         }else{
            return res.json({incorrectPasswordMsg:'Incorrect Email'})
         }
    }catch(err){
        res.json({msg:'Error in logging in: ',err})
        return console.error('Error in logging in'+ err.stack);
    }
 });

 app.post('/submit-order', async (req, res) => {
  const { email, items, total, reference } = req.body;

  // Save to DB
  try {
    let sto=`${items}_${total}_${reference}`
    await pool.query('update twosmilebookings set extras=$1 where email=$2',[`${sto}_NOW()`,email]);
    res.json({ success: true, msg: 'Order saved' });
  } catch (err) {
    res.status(500).json({ success: false, msg: 'Database error', error: err });
  }
});


 app.post('/reset-password',async(req,res)=>{
    try {
        const {email,pass} = req.body;
        const dar={
            text:`select id from twosmilehotelusers where email=$1`,
            val:[email]
        }
        const {text,val}=dar;
        const ree=await pool.query(text,val);
        if(ree.rows.length === 0){
           return res.json({msg:'No email available'})
        }
        trw=ree.rows[0].id
    //    const token=crypto.randomBytes(32).toString('hex');
      //  const expiryDate=new Date(Date.now() + 60 * 60 * 1000);
        const hashh=await bcrypt.hash(pass,10);
        const uppy={
            tre:'update twosmilehotelusers set passowrd=$1 where id=$2',
            trev:[hashh,trw]
        }
        const {tre,trev}= uppy;
        await pool.query(tre,trev);
        res.json({Upmsg:'Updated password successfully'})
    } catch (error) {
        console.error('Error in reset server',error)
    }
 })

app.get('/rooms',async(req,res)=>{
    try{
        const result= await pool.query("select * from twosmilerooms")
        let show=result.rows
        res.json(show);
    }catch(err){
        if(err) console.error("Error" + err.stack)
            res.status(404).send("Error in fetching free rooms.")
    }
})

app.get('/rooms_booked', async(req,res)=>{
    try{
        const result='select * from twosmilerooms where available=false'
        let query=await pool.query(result);
        let show=query.rows
        res.json(show)
    }catch(err){
        console.error("Error in showing booked rooms");
        res.status(404).send("Error in showing booked rooms");
    }
})

app.get('/rooms_unbooked',async(req,res)=>{
    try{
        
        const result={
           text:'select * from twosmilerooms where available= true '
        }
        const {text} =result;
        let show= await pool.query(text);
        let display=show.rows;
        res.json(display);
    }catch(err){
        if(err) throw err.stack;
    }
    })

app.use(async (req,res,next) => {
    if(!req.session.userData){
        req.session.userData={}
    }
    next();
})
//CORRECTION/REVERSAL FOR INCOMPLETE PROCESS...
app.post('/regBone',async(req,res)=>{
    const {email,remainingDays} = req.body;
    try {
    await pool.query("BEGIN");
    let awe=await pool.query("update twosmilehotelusers set days=$1 where email=$2",[remainingDays,email]);
    if(awe){
        if(remainingDays >=7){
            console.log("Sent data for regBone... and remainingDays: ",remainingDays);
           return res.json({success:'pay.html',tiim:remainingDays});
        }else{
                    res.json({success:'/pay.html'});
                            console.log("Sent data for regBone...")
        }
    }

await pool.query("COMMIT");
    } catch (error) {
        await pool.query("ROLLBACK");
        console.error("Regbone error: ",error);
    }
})
app.get('/regt',async(req,res)=>{
    const {email}=req.query;
    let poer=await pool.query('select days from twosmilerooms where email=$1',[email]);
    console.log(poer.rows[0] || 'N/A')
    res.json({msg:poer.rows[0]});
});
app.post('/register',async (req,res)=>{
    try{
        const {firstname,passowrd,lastname,email,tel} = req.body;
        console.log(passowrd,email,lastname,tel)
        const check={
            teer:'select * from twosmilehotelusers where email=$1 or tel=$2',
            teev:[email,tel]
        }
        const {teer,teev} = check;
        const pik=await pool.query(teer,teev);
        if(pik.rows.length > 1){
            console.error('Email already used');
            return res.json({EmailErrMsg:'Email already used,try a different email'})
        }
        let hashed=await bcrypt.hash(passowrd,10); 
        let insert={
        text:'insert into twosmilehotelusers(firstname,lastname,passowrd,email,tel) values($1,$2,$3,$4,$5)',
        value:[firstname,lastname,hashed,email,tel]
    }
/* Registration info stored to be used in other parts of the code */
    cache.put('registrationData',{firstname,lastname,passowrd,email,tel});
    const cachedData=cache.get('registrationData');
    console.log(cachedData.firstname,cachedData.lastname + " " + 'I want to be like you')
    const {text,value}=insert;
    await pool.query(text,value);
//    const data=cache.get('registrationData');
    res.redirect('/booking.html')
    }catch(err){
        if(err)console.error('Error in ' + err.stack);
        return res.json({msg:'Error: '+ err.stack})
    }
    })
/**Book a Room */
app.post('/bookRoom', async (req, res) => {
    try {
        const { CustomerName, check_in, check_out, roomType,no_of_rooms,phone_number,emaill,remainingDays } = req.body;
        await pool.query('BEGIN');
        const result = await pool.query(
            'SELECT * FROM twosmilerooms WHERE available = true AND room_type = $1 limit 1 for update skip locked',
            [roomType]
        );
        if (result.rows.length === 0) {
            await pool.query("ROLLBACK")
            return res.json({ msge: 'No available room of this type,Please try book another room.Thank you.' });
        }  
        const theID=result.rows[0].id;

        const inser={
            ty:`update twosmilerooms set phone_numbers=$1,email=$2,days=$3 where id=$4`,
            trv:[phone_number,emaill,remainingDays,theID]
                }

            const {ty,trv} = inser;
            await pool.query(ty,trv);
            await pool.query('COMMIT');
            //REVERSAL FUNCTION FOR INCOMPLETE PROCESS...
    setTimeout(async () => {
      try {
        const check = await pool.query(
          'SELECT available FROM twosmilerooms WHERE id = $1',
          [theID]
        );

        if (check.rows.length > 0 && check.rows[0].available === true) {
          // Clear user data since payment/verification not done
          await pool.query(
            'UPDATE twosmilerooms SET phone_numbers = $1, email = $2, days = $3 WHERE id = $4',
            [null, null, null, theID]
          );
          console.log(`Cleared booking data for room ${theID} due to no payment.`);
        }
      } catch (error) {
        console.error('Error in booking cleanup timeout:', error);
      }
    }, 30 * 60 * 1000);

        console.log(CustomerName,check_in,check_out,roomType,phone_number,remainingDays);
        const gett={
            gett1:'select phone_numbers from twosmilerooms where id=$1',
            gett2:[theID]
        }        
        const {gett1,gett2} = gett;
        const whi=await pool.query(gett1,gett2);
        roomId = whi.rows[0].phone_numbers;
        console.log(roomId);
        cache.put('bookingData',{CustomerName,check_in,check_out,roomId,roomType,no_of_rooms,phone_number,emaill});
        const cachedBooked=cache.get('bookingData');

console.log(cachedBooked.CustomerName,cachedBooked.check_in,cachedBooked.check_out);
res.status(200).json({message:'Booking successful'});
} catch (err) {
        console.error('Error during booking:', err);
        res.status(500).json({ message: 'Booking failed' });
    }      
});

app.get('/getReceipt',async(req,res)=>{
    const {email}=req.query;
    //let sent=await pool.query('select * from twosmilereceipt where email=$1',[email]);
        try {
        const sent = await pool.query('SELECT * FROM twosmilereceipt WHERE email = $1', [email]);
        res.json({ sen: sent.rows[0] });
    } catch (error) {
        console.error('Error fetching receipt:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

// Run every hour
cron.schedule('0 * * * *', async () => {
    try {
        await pool.query(`
            DELETE FROM twosmilereceipt
            WHERE paidAt IS NOT NULL
              AND paidAt < NOW() - INTERVAL '24 hours'
        `);
        console.log('✅ Old receipts deleted');
    } catch (err) {
        console.error('❌ Error deleting old receipts:', err);
    }
});

/**Make payments for booked room(s) */
app.post('/payments',async (req,res)=>{
try{
        const {email,amount,num,room,reference,days} = req.body;
        if(!email||!amount||!num||!room||!reference||!days){
            return console.error("Issue here... in payment");
        }
    const transactionData={
        email:email,
        amount:amount,
        reference:reference,
        split_code: 'SPL_RtT25Dkowi'
    }
    cache.put(reference, { email, amount, room, num,days })
    const paymentData=cache.get(reference);
    console.log(paymentData.email,paymentData.days,paymentData.amount,paymentData.room,paymentData.num + ' ' + 'this is payment Data');
    paystack.transaction.initialize(transactionData,(err,response)=>{
        if(err){
           return res.status(500).send("Error in payments");
        }else{
            return res.json(response.data)
        }
    })
}catch(err){
    console.error("Loggin error for payment",err);
}
})
app.post('/pay',async(req,res)=>{
    const {email,amount,refer} = req.body;
    const transactionData={
        email:email,
        amount:amount,
        reference:refer,
    }
    cache.put(refer, { email, amount })
    const paymentData=cache.get(refer);
    console.log(paymentData.email,paymentData.amount,refer + ' ' + 'this is payment Data');
    paystack.transaction.initialize(transactionData,(err,response)=>{
        if(err){
           return res.status(500).send("Error in payments");
        }else{
            return res.json({data:response.data,rece:refer});
        }
    })
});
app.get('/verify-pay',async(req,res)=>{
    const {reference,email} = req.query;
    try {
            const verifyPayment = (reference) => {
            return new Promise((resolve, reject) => {
                paystack.transaction.verify(reference, (err, response) => {
                    if (err) {
                        reject('Error in verifying payment');
                        return res.json({Errtr:'Error in processing payment'})
                    } else {
                        resolve(response.data);
                    }
                });
            });
        };

                const paymentResponse = await verifyPayment(reference);
                if(paymentResponse.status === 'success'){
                    return res.json({suc:"Payment complete and successful"});
                }else{
                    res.json({payErr:"Error in payment"})
                }
    } catch (error) {
        console.error("Error from verify-pay endpoint...");
    }
})

let receiptStore={};
// 
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

 async function updateLoyaltyPoints(phone, pointsToAdd) {
    
    const findUser = await pool.query('SELECT * FROM twosmilebookings WHERE phone_numbers = $1', [phone]);
    
    if (findUser.rows.length > 0) {
        const currentPoints = findUser.rows[0].points + pointsToAdd;
        await pool.query('UPDATE twosmilebookings SET points = $1, last_updated = NOW() WHERE phone_numbers = $2', [currentPoints, phone]);

        if ([2, 3, 4].includes(currentPoints)){

            console.log(`User with ${phone} earned a reward at ${currentPoints} points!`);
            return { reward: true, totalPoints: currentPoints };
        }
        return { reward: false, totalPoints: currentPoints };
    }else{
    console.warn(`No user found with phone number: ${phone}`);
    return { reward: false, totalPoints: 0, userFound: false };
    }
}

/**Payment verification using paystack */
app.get('/verify-payment',async (req, res)=>{
    const {reference} = req.query;
    let receipt;
    console.log(reference + 'For payment verification');
    if(!reference){
        //res.status(404).send("Reference not found")
       return console.log('Reference from server not available')
    }
    for (let i = 0; i < 5; i++){ // Retry up to 5 times
        receipt = receiptStore[reference];
        if (receipt) break;
        await wait(5000); // wait 1 second
    }
        const paymentData=cache.get(reference);
const quick={
teet:'select COUNT(*) from twosmilerooms where available=true and room_type=$1',
ttt:[paymentData.room]
}
    console.log(paymentData.num);
const {teet,ttt} = quick;
const cao=await pool.query(teet,ttt);
const caa=parseInt(cao.rows[0].count);
if(caa < paymentData.num){
return res.json({Singmsg:'There are currently not enough rooms'});
            }
    try{
        const verifyPayment = (reference) => {
            return new Promise((resolve, reject) => {
                paystack.transaction.verify(reference, (err, response) => {
                    if (err) {
                        reject('Error in verifying payment');
                    } else {
                        resolve(response.data);
                    }
                });
            });
        };
        const paymentResponse = await verifyPayment(reference);
        const cachedBooked=cache.get('bookingData');
        
        // Data from registration (cachedData)
        const paymentData=cache.get(reference);
        const cachedData=cache.get('registrationData');
        /**Payment for more than room (later use the cachedData('bookingData') to work with code)*/
        if( paymentResponse.status === 'success' && paymentData.num >1){
                const updat={
                    rese:`select * from twosmilerooms where room_type=$1 and available=true limit ${paymentData.num}`,
                    cal:[paymentData.room]
                }
                 const {rese,cal} = updat;
                 const rich= await pool.query(rese,cal);
                 const time=rich.rows;
         //        let roomPN=[];
         if(time.length < paymentData.num){
            console.log('Not enough rooms');
            return res.json({MultipleRoomErr:'Not enough rooms'})
         }
                for(let i=0; i<time.length; i++){ 
                  const roonPNs=time[i].phone_numbers
                  const roomNumber = time[i].room_number;
           //       roomPN.push(roonPNs)
           const sel={
            ser:`insert into twosmilebookings (customer_name,type,check_in,check_out,no_of_rooms,email,phone_numbers,countdown,days) values($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
            car:[
                cachedBooked.CustomerName,
                paymentData.room,
                cachedBooked.check_in,
                cachedBooked.check_out,
                paymentData.num,
                cachedData.email,
                cachedBooked.phone_number,
                null,
                paymentData.days
                ]
         }
         const {ser,car} = sel;
         await pool.query(ser,car);
         console.log('I worked well' + cachedBooked.phone_number +"and " + roomNumber);

           const did={
             inse:`update twosmilerooms set phone_numbers=$1, email=$2,days=$3 where room_number=$4`,
             insev:[cachedBooked.phone_number,cachedBooked.emaill,paymentData.days,roomNumber]
             }
              const {inse,insev} = did
             await pool.query(inse,insev) 
                 const edit={
                    ed:`update twosmilerooms set available=false where room_number=$1 `,
                    edd:[roomNumber]
                  }
    
                 const {ed,edd} = edit;
                 await pool.query(ed,edd);
                 console.log('Room number ',roomNumber)
                }

                 const verify={
                    text:`update twosmilebookings set payment_status=$1 where phone_numbers=$2`,
                    values:['PAID',cachedBooked.phone_number]
                }
                const {text,values} = verify;
                await pool.query(text,values);

            await pool.query("update twosmilebookings set days = $1 where email = $2",[paymentData.days, paymentData.email]);
                //LOYALTY PROGRAM...
let giftnum = 0;
if(paymentData.num == 2){
    giftnum = 2;
} else if (paymentData.num == 3){
    giftnum = 3;
} else if (paymentData.num == 4){
    giftnum = 4;
}
const oyaltyResult = await updateLoyaltyPoints(cachedBooked.phone_number, giftnum);
if (oyaltyResult.reward){
    console.log(`🎁 Reward triggered at ${oyaltyResult.totalPoints} points for user ${cachedBooked.phone_number}`);
}
    console.log('Functioning properly' + cachedBooked.phone_number);
            }
            //PROCESS FOR ONE TIME BOOKING...
            else{
                const insert={
                    txt:`insert into twosmilebookings(customer_name,type,check_in,check_out,no_of_rooms,email,phone_numbers,days) values($1,$2,$3,$4,$5,$6,$7)`,
                    vll:[cachedBooked.CustomerName,paymentData.room,cachedBooked.check_in,cachedBooked.check_out,paymentData.num,cachedData.email,roomId,paymentData.days]
                }
        
                const {txt,vll} = insert;
                await pool.query(txt,vll);
                console.log('Second effort ma sef pay')
                console.log('Working suitably');

                const verify={
                  text:`update twosmilebookings set payment_status=$1 where email=$2 and phone_numbers=$3`,
                  values:['PAID',cachedBooked.emaill,roomId]
                    }

const {text,values} = verify;
await pool.query(text,values);

//Data from booking (cachedBooked)

const update={
tet:'update twosmilerooms set available=false, customer_name=$1 where phone_numbers=$2',
val:[cachedBooked.CustomerName,roomId]
}
let giftnum=0;
giftnum+=1;
const {tet,val} = update;
await pool.query(tet,val);
console.log('Effort paid');
}
const cachedBook=cache.get('bookingData');
const loyaltyResult = await updateLoyaltyPoints(cachedBook.phone_number, 1);
if (loyaltyResult.reward) {
    console.log(`🎁 Reward triggered at ${loyaltyResult.totalPoints} points for user ${cachedBook.phone_number}`);
}
 let poe=await pool.query("select * from twosmilebookings where email=$1",[cachedBook.email]);
 let pointsList = poe.rows.map(row => row.points);
let totalPoints = pointsList.reduce((sum, val) => sum + val, 0);
        res.json({paymentStatus:'Success',message:'Payment successful and verified',rec:receipt,rep:totalPoints});   
    }
    catch(err){
        res.status(500).send("Error in handling this thing after payment" + ' ' + err)
        console.error("Error in handling payment update" + ' ' + err.stack);
    }
})

cron.schedule('* * * * *', async () => {  // every minute; adjust schedule as needed
  try {
    console.log('Cron job started: Checking bookings...');

    // 1. Fetch all bookings with status 'PAID' (active bookings)
    const { rows: bookings } = await pool.query(
      `SELECT * FROM twosmilebookings WHERE payment_status = 'PAID'`
    );

    const now = new Date();

    for (const booking of bookings) {
      // Only process if current time is after check_out (booking expired)
      if (booking.check_out && new Date(booking.check_out) <= now) {
        // Booking ended - proceed to clear rooms and booking data

        // Find rooms that are unavailable for this booking type
        const { rows: rooms } = await pool.query(
          `SELECT * FROM twosmilerooms WHERE available = false AND room_type = $1 AND phone_numbers=$2`,
          [booking.type,booking.phone_numbers]
        );

        if (rooms.length === 0) {
          // No booked rooms found - mark booking unpaid and clear
          await pool.query(
            `UPDATE twosmilebookings
             SET payment_status = 'unpaid', customer_name = NULL, type = NULL, check_in = NULL, check_out = NULL,
                 no_of_rooms = NULL, email = NULL, countdown = NULL, days = NULL, points = NULL, last_updated = NULL, extras = NULL,
                 phone_numbers=NULL
             WHERE phone_numbers = $1`,
            [booking.phone_numbers]
          );
          console.log(`Updated booking as unpaid for phone: ${booking.phone_numbers}`);
          continue; 
        }

        // Mark rooms available and clear their details
        for (const room of rooms) {
          await pool.query(
            `UPDATE twosmilerooms SET available = true, email = NULL, countdown = NULL,phone_numbers=NULL,customer_name=NULL,days=NULL WHERE phone_numbers = $1`,
            [room.phone_numbers]
          );
        }

        // Clear booking info (mark unpaid, clear fields)
        await pool.query(
          `UPDATE twosmilebookings
           SET payment_status = NULL, customer_name = NULL, type = NULL, check_in = NULL, check_out = NULL,
               no_of_rooms = NULL, email = NULL, countdown = NULL, days = NULL, points = NULL, last_updated = NULL,phone_numbers=NULL ,extras = NULL
           WHERE phone_numbers = $1`,
          [booking.phone_numbers]
        );
        console.log(`Processed booking and rooms for phone: ${booking.phone_numbers}`);
      }
    }

    console.log('Cron job finished.');
  } catch (error) {
    console.error('Error in cron job:', error);
  }
});
app.get('/getData',async(req,res)=>{
    const {email}=req.query;
    let ozon=await pool.query('select * from twosmilebookings where email=$1',[email]);
    let ose=await pool.query('select days from twosmilerooms where email=$1',[email]);
    console.log('Ozon Data: ',ozon.rows[0],ose.rows[0]);
    res.json({ozonData:ozon.rows[0],oseData:ose.rows[0]});
})

app.post('/paystack-webhook', express.json(), async(req, res) => {
    const signature = req.headers['x-paystack-signature'];
    const payload = JSON.stringify(req.body); 
    const secretKey = process.env.PAYPAL_SECRET_KEY;
    const generatedSignature = crypto.createHmac('sha512', secretKey).update(payload).digest('hex');

    if (generatedSignature !== signature) {
        return res.status(400).json({ message: 'Invalid signature' });
    }
    console.log('Incoming webhook data',signature ,'and payload',payload);
    const event = req.body;
     
    switch (event.event) {
    
        case 'charge.success':
            case 'payment.success':
            console.log('Payment Successful:', event.data);
            const data = event.data;
            const receipt = {
                receiptId: data.reference,
                name: data.customer?.name || 'N/A',
                email: data.customer?.email,
                amount: (data.amount / 100).toFixed(2),
                currency: data.currency,
                paidAt: data.paid_at,
                status: data.status,
                channel: data.channel,
                reference: data.reference,
                bank: data.authorization.bank,
                card_type:data.authorization.card
            };
            // Store by reference
            receiptStore[data.reference] = receipt;
            console.log("Worked till here...");
            const cachedData=cache.get('registrationData');
           let theData=
            [
                `${cachedData.firstname} ${cachedData.lastname}`,
                data.customer?.email,
                (data.amount / 100).toFixed(2),
                data.currency,
                data.paid_at,
                data.status,
                data.reference,
                data.bank,
                data.brand,
                data.channel
            ]
            await pool.query('insert into twosmilereceipt(name,email,amount,currency,paidAt,status,ref,bank,cardType,channel) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',theData);
            console.log("Receipt data stored...");
            break;

        case 'charge.failed':
            console.log('Payment Failed:', event.data);
            break;

       // case 'payment.success':
         //   console.log('Payment Successful:', event.data);
            
           // break;

        case 'payment.failed':
            console.log('Payment Failed:', event.data);
            break;

        default:
            console.log('Unhandled event:', event.event);
    }
    
    res.status(200).json({ message: 'Webhook processed successfully' });
});

app.post('/data',async(req,res)=>{
  try{
    const {eemail,phone} = req.body;
    const data={
        text:'select * from twosmilebookings where email=$1 or phone_numbers=$2',
        val:[eemail,phone]
     }
    const {text,val} = data;
    const result=await pool.query(text,val);
    //For Bookings...
    let resu=result.rows[0];
    
    const dataa={
        textt:'select * from twosmilerooms where phone_numbers=$1 or email=$2 and available=$3',
        vall:[phone,eemail,false]
     }
    const {textt,vall} = dataa;
    const resultt=await pool.query(textt,vall);
    //For Rooms...
    let resut=resultt.rows[0]
    res.json({tipp:resu,tip:resut});
  }catch(err){
    if(err){
        console.error("error in /data");
        res.json({error:'Error in retrieving data for the search response'});
    }
  }
})

app.get('/api/weekly-guests', async (req, res) => {
    try {
     const query = `
         SELECT
          EXTRACT(DOW FROM check_in::DATE) AS weekday,
          COUNT(*) AS guest_count
          FROM twosmilebookings  
          WHERE check_in >= CURRENT_DATE
          AND check_in < CURRENT_DATE + INTERVAL '7 days'
          GROUP BY weekday
          ORDER BY weekday;
      `;

/**const query=`
SELECT
  EXTRACT(DOW FROM check_in) AS weekday,
  COUNT(*) AS guest_count
FROM bookings  
WHERE check_in >= CURRENT_DATE - INTERVAL '6 days'
GROUP BY weekday
ORDER BY weekday;
`
 */
      const result = await pool.query(query);
      // Format the result to map weekdays to names
      let weekdays = [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
      ];
      
      // Map results to labels
      const formattedData = weekdays.map((day, index) => {
        const dayData = result.rows.find(row => parseInt(row.weekday) === index);
        return {
          day: day,
          guest_count: dayData ? parseInt(dayData.guest_count) : 0
        };
      });
      console.log(formattedData);
      res.json(formattedData);
    } catch (error) {
      console.error('Error fetching guest data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
let port=3000;

app.listen(port,(err)=>{ 
    console.error(err)
}).on('error',()=>{
    process.exit(1)
});






