async function savetocloud(event){
    event.preventDefault();
    const signinDetails={
  email: event.target.email.value,
  
    }
    console.log(signinDetails)
  
  
  
  let serilized_Obj = JSON.stringify(signinDetails);
  
  await axios.post("http://localhost:3000/password/forgotpassword",signinDetails)
  .then((Response)=>{
    if(Response.status === 202){
      alert('check your Mail')
      document.body.innerHTML += '<div style="color:red;text-align:center;margin-top:70px;">Mail Successfuly sent <div>'
  }else {
      throw new Error('Something went wrong!!!')
  }
  
  })
  
  .catch((err)=>{
     throw new Error('Failed to send link');
  })
  
  }