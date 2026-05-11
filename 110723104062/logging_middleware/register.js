const data = {
  email: "dsony15@jnn.edu.in",
  name: "Sony Jenith D",
  mobileNo: "8680026343",
  githubUsername: "SonyJenith",
  rollNo: "110723104062",
  accessCode: "WNMcqN"
};

fetch("http://4.224.186.213/evaluation-service/register", {
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