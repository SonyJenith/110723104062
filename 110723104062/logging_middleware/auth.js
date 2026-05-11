const data = {
  email: 'dsony15@jnn.edu.in',
  name: 'sony jenith d',
  rollNo: '110723104062',
  accessCode: 'WNMcqN',
  clientID: 'ad37997a-e676-441d-8f18-5278cf3f12ec',
  clientSecret: 'aFWAsRxHpWYxfUvU'
};

fetch("http://4.224.186.213/evaluation-service/auth", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(data)
})
.then(res => res.json())
.then(data => {
  console.log(data);
})
.catch(err => {
  console.log(err);
});