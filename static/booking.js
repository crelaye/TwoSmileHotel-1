let remainingDays;

      const images=['./booking1.JPG','./booking2.JPG','./booking3.JPG','./booking4.JPG'];

setInterval(()=>{
    let index=0;
    document.getElementById('sawe').style.background=`url(${index})`;
    index=(index + 1) % images.length;
},3000);
 
document.addEventListener('DOMContentLoaded',async()=>{
        const calculateDays=()=>{   
        let daysOn=document.getElementById('take');
        const set=document.getElementById('setDate');
        const email=document.getElementById('email').value;
        localStorage.setItem('email',email);
        //const nof=document.getElementById('no_of_rooms').value;
        const check_in=document.getElementById('check_in').value;
        const check_out=document.getElementById('check_out').value;
        const btn=document.getElementById('btn');
        const phone=document.getElementById('numm');
        let inn=new Date(check_in);
        let outt=new Date(check_out);
        if(outt>inn){
            let remainingTime=outt-inn;
            remainingDays=remainingTime /(1000 * 3600 * 24);
            btn.disabled=false;
            set.style.display='none'
            daysOn.textContent=`You are spending ${remainingDays} ${remainingDays>1?'days':'day'} in 2 Smile Hotel.`
            localStorage.setItem('daysSpending',remainingDays);
            localStorage.setItem('phoneNum',phone);
            //console.log(sendDays(remainingDays))
            console.log('local storage',localStorage.getItem('daysSpending'));
            console.log('This is remainingDays Data: ',remainingDays);
        }else if(set.textContent === 'Set the right Date please'){
            btn.disabled=true;
            daysOn.textContent='';
            set.style.display='block';
        }
        else{
            set.style.display='block';
        }
        }
        document.getElementById('check_in').addEventListener('input',calculateDays);
        document.getElementById('check_out').addEventListener('input',calculateDays);
    let form=document.getElementById('for');
    let bnt=document.getElementById('btn');
    const showSpinner=()=>{
        document.getElementById('loading').style.display='block';
        bnt.disabled=true;
    }
    const hideSpinner=()=>{
        document.getElementById('loading').style.display='none'
        bnt.disabled=false;
    }    
    document.getElementById('check_in').addEventListener('input',calculateDays);
    document.getElementById('check_out').addEventListener('input',calculateDays);
    form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showSpinner();
    console.log('This is remainingDays Data: ',remainingDays);

    const check_in = document.getElementById('check_in').value;
    const check_out = document.getElementById('check_out').value;
    const CustomerName = document.getElementById('CustomerName').value;
    const roomType = document.getElementById('roomType').value;
    //const roomSet=document.getElementById('roomSet').value;
    //const no_of_rooms=document.getElementById('no_of_rooms').value
    const phone_number=document.getElementById('numm').value
    const emaill=document.getElementById('email').value;
    //localStorage.setItem('anoVal',roomSet);
    console.log(phone_number,emaill)
    try {
        const response = await fetch('/bookRoom', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                CustomerName,
                check_in,
                check_out,
                roomType,
                phone_number,
                //hours,
                //minutes,
                //seconds,
                emaill,
//                roomSet,
                remainingDays
            })
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Booking failed');
        }
        console.log(result);
        const thy=document.getElementById('take');
        thy.textContent='If booking takes longer time,please reload page.'
        setTimeout(()=>{
            thy.textContent=''
        },4000);
        if(result.msge){
            return thy.textContent=result.msge ;
        } 
        if(result.message){
            thy.textContent=result.message+" .Please wait while we take you to your payment page.Thanks";
                        setTimeout(async()=>{
                 let lerr=await fetch('/regBone',{
                    method:"POST",
                    headers:{
                        'Content-Type':'application/json'
                    },
                    body:JSON.stringify({
                        email:emaill,
                        remainingDays:remainingDays
                    })
                 })
                    
                 if(!lerr.ok){
                    return console.error("Error sending number of days to backend",lerr.statusText);
                 }
                 const ler= await lerr.json();
                 window.location.href=ler.success;
                 localStorage.setItem(ler.tiim,'greatDay');
            },6000)
        }
    } catch (err) {
        console.error('Error booking room:', err);
        alert('Booking failed. Please try again later.' + err);
        let ntt=document.getElementById('btn');
        ntt.disabled=false;
    } finally{
        let ntt=document.getElementById('btn');
        ntt.disabled=false;
        hideSpinner()
    }
});
 });

 /**
  *         let sendDays=async(teee)=>{
           let send= await fetch('/bookRoom',{
                method:"POST",
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    days:teee
                })
            })
            if(!send.ok){
                return console.error("Sending teee to the server did not work");
            }
            console.log("Working successfully")
        }

  */

const roomsDis=[
    {
        img:'./delu3.JPG',
        img1:'./delu1.JPG',
        img2:"./delu2.JPG",
        img3:'./use1.JPG',
        img4:'./use2.JPG',
        category:'Deluxe Suite',
        price:'N40,000'
    },
    {
        img:'./Emp Sta.JPG',
        img1:'./emp2.JPG',
        img2:'./use3.JPG',
        img3:'./use4.JPG',
        category:'Emperial Standard',
        price:'N30,000'
    },
    {
        img:'./plat1.JPG',
        img1:'./plat2.JPG',
        img2:'./plat3.JPG',
        img3:'./plat4.JPG',
        img4:'./use5.JPG',
        img5:'./use6.JPG',
        category:'Platinum suite',
        price:'N50,000'
    },
        {
        img:'./roySta.JPG',
        img1:'./royStan2.JPG',
        img2:'./use7.JPG',
        img3:'./use8.JPG',
        category:'Royal Standard',
        price:'N25,000'
    },
    {
        img:'./reg6.JPG',
        img1:'./toBe.JPG',
        category:'Queen/Conference Room',
        price:'N70,000'
    }
]

const disp=document.getElementById('reth');
disp.innerHTML+=`
<div id='div1'>
<img src='${roomsDis[0].img}'/>
<img src='${roomsDis[0].img1}'/>
<img src='${roomsDis[0].img2}'/>
<img src='${roomsDis[0].img3}'/>
<img src='${roomsDis[0].img4}'/>
<span>${roomsDis[0].category}</span>
<span>${roomsDis[0].price}</span>
</div>
<div id='div2'>
<img src='${roomsDis[1].img}'/>
<img src='${roomsDis[1].img1}'/>
<img src='${roomsDis[0].img2}'/>
<img src='${roomsDis[0].img3}'/>
<span>${roomsDis[1].category}</span>
<span>${roomsDis[1].price}</span>
</div>
<div id='div3'>
<img src='${roomsDis[2].img}'/>
<img src='${roomsDis[2].img1}'/>
<img src='${roomsDis[2].img2}'/>
<img src='${roomsDis[2].img3}'/>
<img src='${roomsDis[0].img4}'/>
<img src='${roomsDis[0].img5}'/>
<span>${roomsDis[2].category}</span>
<span>${roomsDis[2].price}</span>
</div>
<div id='div4'>
<img src='${roomsDis[3].img}'/>
<img src='${roomsDis[3].img1}'/>
<img src='${roomsDis[3].img2}'/>
<img src='${roomsDis[3].img3}'/>
<span>${roomsDis[3].category}</span>
<span>${roomsDis[3].price}</span>
</div>
<div id='div5'>
<img src='${roomsDis[4].img}'/>
<img src='${roomsDis[4].img1}'/>
<span>${roomsDis[4].category}</span>
<span>${roomsDis[4].price}</span>
</div>
`

// Lightbox functionality
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'IMG' && e.target.closest('#reth')) {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        lightboxImg.src = e.target.src;
        lightbox.style.display = 'flex';
    }
});

document.getElementById('lightbox-close').onclick = function() {
    document.getElementById('lightbox').style.display = 'none';
};

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('toggle-btn')) {
        const imagesDiv = e.target.nextElementSibling;
        imagesDiv.style.display = imagesDiv.style.display === 'none' ? 'block' : 'none';
    }
});

const roomDivs = document.querySelectorAll('#reth > div');

roomDivs.forEach(roomDiv => {
  const images = roomDiv.querySelectorAll('img');
  let current = 0;

  // Show only the first image at start
  images.forEach((img, index) => {
    img.classList.toggle('active', index === 0);
  });

  // Rotate images every 3 seconds
  function rotateImages() {
    images[current].classList.remove('active');
    current = (current + 1) % images.length;
    images[current].classList.add('active');
    setTimeout(rotateImages, 3000); // Recursive timeout
  }

  setTimeout(rotateImages, 3000);
});
const nttm=document.getElementById('see');
nttm.addEventListener('click',()=>{
   let reth= document.getElementById('reth');
   if(reth.style.visibility==='visible'){
    reth.style.visibility='hidden'
    nttm.textContent='Show';
   }else{
    reth.style.visibility='visible';
    nttm.textContent='Hide';
   }

})


