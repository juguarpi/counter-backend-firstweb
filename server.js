const express = require('express');
const app = express();
const port = 3001;
var cors = require('cors')


const db = require('knex')({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : '123',
      database : 'firstweb'
    }
  });

app.use(express.json()); 
app.use(cors());


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/signin', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    db.select('name', 'email').from('users').where({ email: email, password: password})
    .then(data=> {
        if (data[0]!=null) res.status(200).json(data);
        else res.status(401).json("email or password not matched ");
    })
    .catch(err => res.status(404).json("Error or server connection not available"))
})

app.post('/getcounters', (req, res) => {
  const email = req.body.email;
  db.select('email', 'counter', 'score').from('counterlist').where({email: email}).orderBy('counter')
  .then(data=> {
    console.log(data);
    res.status(200).json(data)})
  .catch(err => res.status(404).json("server connection not available"))
})

app.put('/updatecounter', (req, res) => {
  const counter = req.body.counter;
  const newCounter = req.body.newCounter;
 
  if (newCounter === "delete"){
    db('counterlist')
    .where({ email: counter.email, counter: counter.counter, score: counter.score})
    .del()
    .then(()=> res.status(202)).json("counter db updated")
    .catch(() => res.status(404).json("server connection not available"))
  }
  else if (newCounter==="add"){
    db('counterlist').max('counter')
    .then(maxId => {
        db('counterlist').insert({email:counter.email, counter: maxId[0].max+1, score:0})
        .then(()=> res.status(202).json("counter db updated"))
        .catch(() => res.status(404).json("server connection not available"))
      })
    .catch(() => res.status(404).json("server connection not available"))
  } 
  else if (newCounter==="reset"){
    db('counterlist')
    .where({email: counter.email})
    .update({
      score: 0
    })
    .then(()=> res.status(202).json("counter db updated"))
    .catch(() => res.status(404).json("server connection not available"))
  } 

  else {
    db('counterlist')
    .where({email: counter.email, counter: counter.counter, score: counter.score})
    .update({
      score: newCounter.score
    })
    .then(()=> res.status(202).json("counter db updated"))
    .catch(() => res.status(404).json("server connection not available"))
  }
})

app.post('/register', (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  if (name ==="" || email ==="" || password ==="") 
    res.status(406).json("registration not successful,try again");
  else {
  db('users').insert({name: name, email: email, password:password})
  .then(()=> res.status(202).json("new account registered, please signin"))
  .catch(() => res.status(406).json("registration not successful, try again"))
  }
})

//         db.select('users.name','counterlist.counter','counterlist.score').from('users').fullOuterJoin('counterlist', 'users.email', 'counterlist.email').where("counterlist.email", "=", email)
//         .then(data =>
//             {console.log(data);
//             res.status(200).json(data)} )
//         .catch(err => res.status(404).json("counter data not available"))
//     } else res.status(401).json("email or password not matched ")
// })
//     .catch(err => res.status(404).json("user data not available"))
    
//   })

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})