//const { error } = require("emailjs");
const form3=document.getElementById('payment_own');
const payBtn=document.getElementById('paynow');
const cardElem=document.getElementById('card_element_display');
let DaysToSpend=localStorage.getItem('daysSpending');
const paid=document.getElementById('paid');
paid.textContent=`${DaysToSpend} ${DaysToSpend>1?'days.':'day.'}`
const showSpinner=()=>{
    document.getElementById('loading').style.display='block'
}
const hideSpinner=()=>{
    document.getElementById('loading').style.display='none'
}

form3.addEventListener('submit', async (e) => {
    showSpinner();
    e.preventDefault();
    const amount = document.getElementById('price')
    const email = document.getElementById('email').value;
    const room=document.getElementById('room').value;
    const num=document.getElementById('number_of_rooms').value;
    localStorage.setItem('payEmail',email);
    let simp=26100;
    let del=41100;
    let sta=31100;
    let plat=51100;
    let con=153100;
    
    console.log(DaysToSpend);
    
    let ert=await fetch(`/regt?email=${email}`);
    if(!ert.ok){
     return console.error(`Error in regt endpoint...${ert.statusText}_${ert.status}`);
    }
    let data=await ert.json();
    console.log(data);
      let reed;
      console.log(reed);
      reed=data.msg.days;
      if(reed === undefined){
         console.error("Reed is undefined...")
      } 
    switch(room){
      case 'Royal Standard':
        amount.value= simp * parseInt(num) * parseInt(DaysToSpend);
        break;
        case 'Emperial Standard':
          amount.value= sta * parseInt(num) * parseInt(DaysToSpend);
          break;
          case 'Deluxe Suite':
            amount.value= del * parseInt(num) * parseInt(DaysToSpend);
            break;
            case 'Platinum Suite':
              amount.value=plat * parseInt(num) * parseInt(DaysToSpend);
              break
              case 'Conference Room':
                amount.value=con * parseInt(num) * parseInt(DaysToSpend);
                break
            default:
              amount.value=0.00;
    }

    const refe = 'payment_verification_' + Math.random().toString(36).substr(2, 9).replace(/[^a-zA-Z0-9]/g, '');
    console.log(refe);
console.log(DaysToSpend);
    let amountKobo = parseInt(amount.value) * 100;
    
    const response = await fetch('https://twosmilehotel.onrender.com/payments',{
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            amount: parseInt(amountKobo),
            email: email,
            currency: 'NGN',
            room:room,
            num:num,
            reference:refe,
            days:DaysToSpend
        })
    });
    if(!response.ok){
             console.error("Error from frontEnd",response.text,response.status,response.statusText);      
    }else{
               const data=await response.json()
        console.log('Payment data sent appropriately')
    }

    const handler=PaystackPop.setup({
        key: 'pk_live_00c3bb6d40a8ec4b19d0c289864d76c594618ddb', 
        email: email,
        amount: amountKobo, 
        currency: 'NGN',
        ref: refe,         
    callback: function(response) {
        showSpinner()
            fetch('/verify-payment?reference=' + response.reference)
              .then(res => res.json())
              .then(resp => {
                if (resp.paymentStatus === 'Success') {
                  console.log(resp.rec);
                  document.getElementById('roomErr').textContent=`Please wait you will be redirected to your dashboard,With 2 Smiles Thank you!`
                  localStorage.setItem(resp.rep,'points');
                  window.location.href = './dashboard.html';
                  console.log('/jiiii')
                }else if(resp.multipleRoomErr){
                    return document.getElementById('roomErr').textContent=resp.MultipleRoomErr;
                }else if(resp.Singmsg){
                  return document.getElementById('roomErr').textContent=resp.Singmsg + ' Please reload page';
                }
                else {
                  document.getElementById('tag').textContent = resp.msg || 'Verification failed.';
                }
              })
              .catch(err => {
                console.error('Verification error', err);
              })
              .finally(() => {
                hideSpinner();
              });
},   
    onClose: function() {
        hideSpinner()
      console.log('Transaction cancelled or closed');
  }
  })
  handler.openIframe()
    });
 //   fer();

const callBook=async()=>{
    const send=await fetch('/bookRoom',{
        method:'post',
        headers:{'Content-Type':'application/json'}
    });
    const res=await send.json();
    if(res.message){
        document.getElementById('roomErr').textContent=res.message;
    }
}

/**
 *     <div id="hed">
    <h2>Two Smile Hotel <i class="fa-sharp fa-solid fa-hotel" style="width: 50%;"></i> <br> <aside><em>Exclusive access to a unique experience</em></aside></h2>
    </div>
        <p id="may">Make secured payments to secure your room <br>Fill in and Select required inputs.<br>
    You are paying the selected room for <span id="paid"></span>
    </p>
    <hr>
    <form id="payment_own">
        <div id="flex">
                 <label for="type" id="roo"><span id="sel"> <i class="fa-solid fa-house" id="thi"></i> Select Room Type:</span><br>
                    <select id="room">
                        <option value="Ro. Room">Royal Standard N25,500</option>
                        <option value="Emp. Standard">Emperial Standard N30,000</option>
                        <option value="Platinum Suite">Platinum Suite N50,000</option>
                        <option value="Deluxe Suite">Deluxe Suite N40,000</option>
                    </select>
                </label>
                <label for="number_of_rooms" style="font-weight: bolder;" id="nolo"><span id="nom"><i class="fa-brands fa-slack"></i> Number of rooms:</span><br>
                    <select id="number_of_rooms">
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                    </select>
                </label>        
                <label id="pricee"><i class="fa-solid fa-credit-card" id="card"></i> <span id="pol"> Price:</span><br>
                    <input type="text" name="price" id="price" disabled placeholder="Price will load automatically" />
                </label>
                <label id="emaill"><i class="fa-solid fa-envelope" id="emi"></i><span id="ema">Email:</span><br>
                    <input type="email" name="email" id="email" placeholder="Enter your email" required/>
                </label>    
            
            <div id="card_element_display"></div>
        </div>
        <button id="paynow" type="submit">Pay now</button>
    </form>
    <footer>
        Two Smile Hotel web services hosts this transaction and carries out every financial transaction on this page using the Nigerian paystack service as it's handler.Please you are advised to provide correct and accurate information
        as data such as email and phone number can be a means of confirmation of payments and contact for other info.Two Smile Hotels remains thankful to your patronage and cooperation in keeping to this information.However,if there are 
        any issues please do well to reach out to us as we are very open to help.Thank You!
        
    </footer>
    <p id="time"></p>  
    <div >
        <p class="loading" id="loading">Hotel Ballocoona ...</p>
      </div>
<p id="tag"></p>
<p id="roomErr"></p>

 */


