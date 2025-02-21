const express = require('express')
const app = express()


app.get("/api", (req, res) => {
  res.json({ "users": ["userOne", "userTwo"] })
})


app.listen(5000, () => { console.log("Server Started on Port 5000") })