function addToCart(productId) {
  $.ajax({
    url: '/add-to-cart/' + productId,
    method: 'get',
    success: (response) => {
      // alert(response);
      console.log(response)
      if (response.status) {
        let count = $('#cart-count').html()
        count = parseInt(count) + 1;
        $('#cart-count').html(count);
      }
    }
  })
}

function placeOrder() {
  let fname = document.myform.fname.value;
  let lname = document.myform.lname.value;
  let street = document.myform.street.value;
  let state = document.myform.state.value;
  let town = document.myform.town.value;
  let zip = document.myform.zip.value;
  let phone = document.myform.phone.value;
  let email = document.myform.email.value;

  let nameRegx = /^([A-Za-z]){3,20}$/gm
  let streetRegx = /^([A-Za-z]){3,20}$/gm
  let stateRegx = /^([A-Za-z ]){3,20}$/gm
  let townRegx = /^([A-Za-z]){3,20}$/gm
  let lnameRegx = /^([A-Za-z]){1,20}$/gm
  let zipRegx = /^([0-9]){6}$/gm
  let phoneRegx = /^([0-9]){10}$/gm
  let emailRegx = /^(\w){3,16}@([A-Za-z]){5,8}.([A-Za-z]){2,3}$/gm

  if (fname == '') {
    document.getElementById('err').innerHTML = "Firstname field required";
    return false;
  }
  else if (nameRegx.test(fname) == false) {
    document.getElementById('err').innerHTML = "Firstname should be characters and should atleast have 4 characters";
    return false;
  }
  else if (lname == '') {
    document.getElementById('err').innerHTML = "Lastname field required";
    return false;
  }
  else if (lnameRegx.test(lname) == false) {
    document.getElementById('err').innerHTML = "Lastname should be characters";
    return false;
  }
  else if (street == '') {
    document.getElementById('err').innerHTML = "Street name required";
    return false;
  }
  else if (streetRegx.test(street) == false) {
    document.getElementById('err').innerHTML = "Street name should atleast have 4 characters";
    return false;
  }
  else if (state == '') {
    document.getElementById('err').innerHTML = "State name required";
    return false;
  }
  else if (stateRegx.test(state) == false) {
    document.getElementById('err').innerHTML = "State name should atleast have 4 characters";
    return false;
  }
  else if (town == '') {
    document.getElementById('err').innerHTML = "Town name required";
    return false;
  }
  else if (townRegx.test(town) == false) {
    document.getElementById('err').innerHTML = "Town name should atleast have 4 characters";
    return false;
  }
  else if (zip == '') {
    document.getElementById('err').innerHTML = "Zip code required";
    return false;
  }
  else if (zipRegx.test(zip) == false) {
    document.getElementById('err').innerHTML = "zip code should have 6 digits";
    return false;
  }
  else if (phone == '') {
    document.getElementById('err').innerHTML = "Phone number required";
    return false;
  }
  else if (phoneRegx.test(phone) == false) {
    document.getElementById('err').innerHTML = "Phone number should have 10 digits";
    return false;
  }
  else if (email == '') {
    document.getElementById('err').innerHTML = "Email id required";
    return false;
  }
  else if (emailRegx.test(email) == false) {
    document.getElementById('err').innerHTML = "Enter valid email id";
    return false;
  }
}



function checkAddress() {
  let fname = document.addressform.fname.value;
  let lname = document.addressform.lname.value;
  let street = document.addressform.street.value;
  let state = document.addressform.state.value;
  let town = document.addressform.town.value;
  let zip = document.addressform.zip.value;
  let phone = document.addressform.phone.value;
  let email = document.addressform.email.value;
  console.log("hgfgh");
  console.log(fname);
  console.log(fname, lname, street, state, town, zip, phone, email);
  let nameRegex = /^([A-Za-z ]){3,20}$/gm
  let streetRegex = /^([A-Za-z ]){3,20}$/gm
  let stateRegex = /^([A-Za-z ]){3,20}$/gm
  let townRegex = /^([A-Za-z ]){3,20}$/gm
  let lnameRegex = /^([A-Za-z]){1,20}$/gm
  let zipRegex = /^([0-9]){6}$/gm
  let phoneRegex = /^([0-9]){10}$/gm
  let emailRegex = /^(\w){3,16}@([A-Za-z]){5,8}.([A-Za-z]){2,3}$/gm

  if (fname == '') {
    document.getElementById('errAdd').innerHTML = "Firstname field required";
    return false;
  }
  else if (nameRegex.test(fname) == false) {
    document.getElementById('errAdd').innerHTML = "Firstname should be characters and should atleast have 4 characters";
    return false;
  }
  else if (lname == '') {
    document.getElementById('errAdd').innerHTML = "Lastname field required";
    return false;
  }
  else if (lnameRegex.test(lname) == false) {
    document.getElementById('errAdd').innerHTML = "Lastname should be characters";
    return false;
  }
  else if (street == '') {
    document.getElementById('errAdd').innerHTML = "Street name required";
    return false;
  }
  else if (streetRegex.test(street) == false) {
    document.getElementById('errAdd').innerHTML = "Street name should atleast have 4 characters";
    return false;
  }
  else if (state == '') {
    document.getElementById('errAdd').innerHTML = "State name required";
    return false;
  }
  else if (stateRegex.test(state) == false) {
    document.getElementById('errAdd').innerHTML = "State name should atleast have 4 characters";
    return false;
  }
  else if (town == '') {
    document.getElementById('errAdd').innerHTML = "Town name required";
    return false;
  }
  else if (townRegex.test(town) == false) {
    document.getElementById('errAdd').innerHTML = "Town name should atleast have 4 characters";
    return false;
  }
  else if (zip == '') {
    document.getElementById('errAdd').innerHTML = "Zip code required";
    return false;
  }
  else if (zipRegex.test(zip) == false) {
    document.getElementById('errAdd').innerHTML = "zip code should have 6 digits";
    return false;
  }
  else if (phone == '') {
    document.getElementById('errAdd').innerHTML = "Phone number required";
    return false;
  }
  else if (phoneRegex.test(phone) == false) {
    document.getElementById('errAdd').innerHTML = "Phone number should have 10 digits";
    return false;
  }
  else if (email == '') {
    document.getElementById('errAdd').innerHTML = "Email id required";
    return false;
  }
  else if (emailRegex.test(email) == false) {
    document.getElementById('errAdd').innerHTML = "Enter valid email id";
    return false;
  }

}

function userProfileCheck(){
  let nameRegex = /^([A-Za-z ]){3,20}$/gm;
  let emailRegex = /^(\w){3,16}@([A-Za-z]){5,8}.([A-Za-z]){2,3}$/gm;
  let name = document.userProfile.name.value;
  let email = document.userProfile.email.value;
  if (name == '') {
    document.getElementById('name').innerHTML = "Name field required";
    return false;
  }
  else if (nameRegex.test(name) == false) {
    document.getElementById('name').innerHTML = "Firstname should be characters and should atleast have 4 characters";
    return false;
  }
  else if (email == '') {
    document.getElementById('email').innerHTML = "Email id required";
    return false;
  }
  else if (emailRegex.test(email) == false) {
    document.getElementById('email').innerHTML = "Enter valid email id";
    return false;
  }
}


function verifyPassword() {
  let password = document.pwform.password.value;
  let newPassword = document.pwform.newPassword.value;
  let confirmPassword = document.pwform.confirmNewPassword.value;
  console.log(password, newPassword, confirmPassword)

  let passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]){8,16}/gm;
  let newPasswordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]){8,16}/gm;


  if (password == '') {
    document.getElementById('errMsg').innerHTML = "Password field required";
    return false;
  }
  else if (passwordRegex.test(password) == false) {
    document.getElementById('errMsg').innerHTML = "Invalid password";
    return false;
  }
  else if (newPassword == '') {
    document.getElementById('errMsg').innerHTML = "Password field required";
    return false;
  }
  else if (newPasswordRegex.test(newPassword) == false) {
    document.getElementById('errMsg').innerHTML = "Invalid new password";
    return false;
  }
  else if (newPassword != confirmPassword) {
    document.getElementById('errMsg').innerHTML = "New password and confirm password should match";
    return false;
  }
}


function sendData(e) {
  const searchResults = document.getElementById('searchResults');
  let match1 = e.value.match(/^[a-zA-z ]*/);
  let match2 = e.value.match(/^\s*/);
  if (match2[0] === e.value) {
    searchResults.innerHTML = '';
    return;
  }
  if (match1[0] === e.value) {
    fetch('get-search-result', {
      method: 'POST',
      headers: { 'content-Type': 'application/json' },
      body: JSON.stringify({ payload: e.value })
    }).then(res => res.json()).then(data => {
      let payload = data.payload;
      searchResults.innerHTML = '';
      if (payload.length < 1) {
        searchResults.innerHTML = '<p>Sorry, Nothing found!</p>';
        return;
      }
      payload.forEach((item, index) => {
        if (index > 0)
          searchResults.innerHTML += '<hr>';
        searchResults.innerHTML += `<p onclick="window.location.href='/single-product/${item._id}'" >${item.name}</p>`;

      });
    });
    return;
  }
  searchResults.innerHTML = '';
}


function filter(id) {
  $.ajax({
    url: '/filter',
    data: {
      id
    },
    method: 'post',
    success: (res) => {
      if (res.status) {
        location.href = "/shop"
      }
    }
<<<<<<< HEAD

  })
}
=======
    else if(nameRegx.test(fname) == false){
      document.getElementById('err').innerHTML = "Firstname should be characters and should atleast have 4 characters";
        return false;
    }
    else if(lname == ''){
      document.getElementById('err').innerHTML="Lastname field required";
        return false;
    }
    else if(lnameRegx.test(lname) == false){
      document.getElementById('err').innerHTML = "Lastname should be characters";
        return false;
    }
    else if(street == ''){
      document.getElementById('err').innerHTML="Street name required";
        return false;
    }
    else if(streetRegx.test(street) == false){
      document.getElementById('err').innerHTML = "Street name should atleast have 4 characters";
        return false;
    }
    else if(state == ''){
      document.getElementById('err').innerHTML="State name required";
        return false;
    }
    else if(stateRegx.test(state) == false){
      document.getElementById('err').innerHTML = "State name should atleast have 4 characters";
        return false;
    }
    else if(town == ''){
      document.getElementById('err').innerHTML="Town name required";
        return false;
    }
    else if(townRegx.test(town) == false){
      document.getElementById('err').innerHTML = "Town name should atleast have 4 characters";
        return false;
    }
    else if(zip == ''){
      document.getElementById('err').innerHTML="Zip code required";
        return false;
    }
    else if(zipRegx.test(zip) == false){
      document.getElementById('err').innerHTML = "zip code should have 6 digits";
        return false;
    }
    else if(phone == ''){
      document.getElementById('err').innerHTML="Phone number required";
        return false;
    }
    else if(phoneRegx.test(phone) == false){
      document.getElementById('err').innerHTML = "Phone number should have 10 digits";
        return false;
    }
    else if(email == ''){
      document.getElementById('err').innerHTML="Email id required";
        return false;
    }
    else if(emailRegx.test(email) == false){
      document.getElementById('err').innerHTML = "Enter valid email id";
        return false;
    }
  }



  function checkAddress(){
    let fname = document.addressform.fname.value;
    let lname = document.addressform.lname.value;
    let street = document.addressform.street.value;
    let state = document.addressform.state.value;
    let town = document.addressform.town.value;
    let zip = document.addressform.zip.value;
    let phone = document.addressform.phone.value;
    let email = document.addressform.email.value;
    console.log("hgfgh"); 
    console.log(fname); 
    console.log(fname,lname,street,state,town,zip,phone,email);
    let nameRegex=/^([A-Za-z]){3,20}$/gm
    let streetRegex=/^([A-Za-z]){3,20}$/gm
    let stateRegex=/^([A-Za-z ]){3,20}$/gm
    let townRegex=/^([A-Za-z]){3,20}$/gm
    let lnameRegex=/^([A-Za-z]){1,20}$/gm
    let zipRegex=/^([0-9]){6}$/gm 
    let phoneRegex=/^([0-9]){10}$/gm
    let emailRegex=/^(\w){3,16}@([A-Za-z]){5,8}.([A-Za-z]){2,3}$/gm

    if(fname == ''){
      document.getElementById('errAdd').innerHTML="Firstname field required";
        return false;
    }
    else if(nameRegex.test(fname) == false){
      document.getElementById('errAdd').innerHTML = "Firstname should be characters and should atleast have 4 characters";
        return false;
    }
    else if(lname == ''){
      document.getElementById('errAdd').innerHTML="Lastname field required";
        return false;
    }
    else if(lnameRegex.test(lname) == false){
      document.getElementById('errAdd').innerHTML = "Lastname should be characters";
        return false;
    }
    else if(street == ''){
      document.getElementById('errAdd').innerHTML="Street name required";
        return false;
    }
    else if(streetRegex.test(street) == false){
      document.getElementById('errAdd').innerHTML = "Street name should atleast have 4 characters";
        return false;
    }
    else if(state == ''){
      document.getElementById('errAdd').innerHTML="State name required";
        return false;
    }
    else if(stateRegex.test(state) == false){
      document.getElementById('errAdd').innerHTML = "State name should atleast have 4 characters";
        return false;
    }
    else if(town == ''){
      document.getElementById('errAdd').innerHTML="Town name required";
        return false;
    }
    else if(townRegex.test(town) == false){
      document.getElementById('errAdd').innerHTML = "Town name should atleast have 4 characters";
        return false;
    }
    else if(zip == ''){
      document.getElementById('errAdd').innerHTML="Zip code required";
        return false;
    }
    else if(zipRegex.test(zip) == false){
      document.getElementById('errAdd').innerHTML = "zip code should have 6 digits";
        return false;
    }
    else if(phone == ''){
      document.getElementById('errAdd').innerHTML="Phone number required";
        return false;
    }
    else if(phoneRegex.test(phone) == false){
      document.getElementById('errAdd').innerHTML = "Phone number should have 10 digits";
        return false;
    }
    else if(email == ''){
      document.getElementById('errAdd').innerHTML="Email id required";
        return false;
    }
    else if(emailRegex.test(email) == false){
      document.getElementById('errAdd').innerHTML = "Enter valid email id";
        return false;
    }
    
  }


  function verifyPassword(){
    let password = document.pwform.password.value;
    let newPassword = document.pwform.newPassword.value;
    let confirmPassword = document.pwform.confirmNewPassword.value;
    console.log(password,newPassword,confirmPassword)
    
    let passwordRegex=/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]){8,16}/gm;
    let newPasswordRegex=/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]){8,16}/gm;
    
    
    if(password == ''){
      document.getElementById('errMsg').innerHTML="Password field required";
        return false;
    }
    else if(passwordRegex.test(password) == false){
      document.getElementById('errAdd').innerHTML="Invalid password";
        return false;
    }
    else if(newPassword == ''){
      document.getElementById('errMsg').innerHTML="Password field required";
        return false;
    }
    else if(newPasswordRegex.test(newPassword) == false){
      document.getElementById('errAdd').innerHTML="Invalid new password";
        return false;
    }
    else if(newPassword != confirmPassword){
      document.getElementById('errAdd').innerHTML="New password and confirm password should match";
        return false;
    }
  }
>>>>>>> 44fc99901b655be9570cb355c355657cdc30e2cf
