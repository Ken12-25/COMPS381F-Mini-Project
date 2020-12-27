const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const assert = require('assert');
const fs = require('fs');
const formidable = require('express-formidable');
let express = require('express');
var cookieSession = require('cookie-session')
let app = express();
app.use(formidable());
const mongourl = 'mongodb+srv://sch:1225@cluster0.1zxyy.mongodb.net/&#39;Project?retryWrites=true&amp;w=majority';
const dbName = 'Project';
const SECRETKEY = 'This my a gp project';


app.use(cookieSession({
  name: 'LoginSession',
  keys: [SECRETKEY],
  maxAge: 30 * 60 * 1000
}))

app.set('view engine', 'ejs');
const findDocument = (db, criteria, callback) => {
  let cursor = db.collection('restaurant').find(criteria);
  console.log(`findDocument: ${JSON.stringify(criteria)}`);
  cursor.toArray((err, docs) => {
    assert.equal(err, null);
    console.log(`findDocument: ${docs.length}`);
    callback(docs);
  });
}

const handle_Delete = (res, criteria,req) => {
  const client = new MongoClient(mongourl);
  client.connect((err) => {
    assert.equal(null, err);
    console.log("Handle Delete");
    const db = client.db(dbName);
      let DOCID = {};
      DOCID['_id'] = ObjectID(criteria._id)
if(criteria.userid == req.session.id){
      db.collection('restaurant').
      deleteOne(DOCID, (err, results) => {
      assert.equal(err, null);
      client.close();
      console.log("Closed DB connection"); 
      res.render('deleteSu');
    });
}else{
      res.render('deleteError', { doc: criteria });
}
  });
}

const handle_Rate = (res, criteria,req) => { 
 const client = new MongoClient(mongourl);
  client.connect((err) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);
    let DOCID = {};
	DOCID['_id'] = ObjectID(criteria._id);
  
    let cursor = db.collection('restaurant').find(DOCID);
    
    cursor.toArray((err, docs) => {
      assert.equal(err, null);
	 
	  docs[0].grades.push({"user":req.session.id,"score":criteria.score});


    db.collection('restaurant').updateOne(DOCID,
        {
          $set: {
            "grades": docs[0].grades
          }
        },
        (err, results) => {
          client.close();
          assert.equal(err, null);
          res.render('rateSu', { doc: criteria });
        });

    });
  });
}

  const handle_RateForm = (res, req) => {
	  const client = new MongoClient(mongourl);
  client.connect((err) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);
	  let DOCID = {};
	DOCID['_id'] = ObjectID(req.query._id);
	let cursor = db.collection('restaurant').find(DOCID);
    cursor.toArray((err, docs) => {
      assert.equal(err, null);
	   var check = false;
	  for (var doc of docs[0].grades){
	 if(doc.user == req.session.id){
     check = true;
	 }else {
		 check = false;
		 
	 }
	  }
	  if(!check){
		res.render('rateForm', { doc: docs[0] });
	  }else if(check){
      res.render('rateFormError');
    }
    });
  });
  }


const handle_Insert = (res, criteria) => {
  const client = new MongoClient(mongourl);
  client.connect((err) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);

      db.collection('restaurant').
    insertOne(criteria, (err, results) => {
      assert.equal(err, null);
      client.close();
      console.log("Closed DB connection");
      res.render('insert', { doc: criteria });

    });
  });
}



const handle_Register = (res, req) => {
const doc =
  {
    "username": null,
    "password": null,
  };
  if(req.fields.password == req.fields.repassword){
  doc.username = req.fields.username;
  doc.password = req.fields.password;
  const client = new MongoClient(mongourl);
  client.connect((err) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);

    db.collection('user').
    insertOne(doc, (err, results) => {
            assert.equal(err, null);
      client.close();
      console.log("Closed DB connection");
      console.log(`Inserted document(s): ${results.insertedCount}`);
      res.render('registerSucess');

    });
  });
}else{
  res.render('registerError');
}
}

const handle_Read = (res,req, criteria) => {
  const client = new MongoClient(mongourl);
  client.connect((err) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);

    findDocument(db, criteria, (docs) => {
      client.close();
      console.log("Closed DB connection");
      res.render('read', { docs: docs,session: req.session, criteria:JSON.stringify(criteria)});


    });
  });
}

const handle_ProSearchRestaurant = (res, req,criteria) => {
  const client = new MongoClient(mongourl);
  client.connect((err) => {
    assert.equal(null, err);
    console.log("handling ProSearchRestaurant");
    const db = client.db(dbName);
    let DOCID = {};
    DOCID['restname'] = req.fields.restname;
    findDocument(db, criteria, (docs) => {
      client.close();
      console.log("Closed DB connection");
      res.render('searchRestaurant', { docs: docs , restName: DOCID['restname']} );
    });
  });
}

const handle_Details = (res, criteria) => {
  const client = new MongoClient(mongourl);
  client.connect((err) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);


    let DOCID = {};
    DOCID['_id'] = ObjectID(criteria._id)
    findDocument(db, DOCID, (docs) => {  
      client.close();
      console.log("Closed DB connection");

      res.render('detail', { docs: docs });
    });
  });
}

const handle_Edit = (res, criteria,req) => {
  const client = new MongoClient(mongourl);
  client.connect((err) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);
    /* use Document ID for query */
    let DOCID = {};
    DOCID['_id'] = ObjectID(criteria._id)
    let cursor = db.collection('restaurant').find(DOCID);
    cursor.toArray((err, docs) => {
      client.close();
      assert.equal(err, null);
      if(docs[0].userid == req.session.id){
      res.render('edit', { docs: docs });}
      else{
      res.render('editerror', { docs: docs });
      }
    });
  });
}


const handle_Update = (res, criteria,req) => {


  
  const client = new MongoClient(mongourl);
  client.connect((err) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);
    /* use Document ID for query */
    let DOCID = {};
    DOCID['_id'] = ObjectID(criteria._id);
    if (criteria.photo && criteria.mimetype) {
      db.collection('restaurant').updateOne(DOCID,
        {
          $set: {
            "address": {
              "street": criteria.address.street,
              "zipcode": criteria.address.zipcode,
              "building": criteria.address.building,
              "coord": [
                criteria.address.coord[0], criteria.address.coord[1]
              ]
            },
            "borough": criteria.borough,
            "cuisine": criteria.cuisine,
            "name": criteria.name,
            "userid" : req.session.id,
            "photo": criteria.photo,
            "mimetype": criteria.mimetype
          }
        },
        (err, results) => {
          client.close();
          assert.equal(err, null);
          res.render('update', { docs: criteria });
        });
    } else {
      db.collection('restaurant').updateOne(DOCID,
        {
          $set: {
            "address": {
              "street": criteria.address.street,
              "zipcode": criteria.address.zipcode,
              "building": criteria.address.building,
              "coord": [
                criteria.address.coord[0], criteria.address.coord[1]
              ]
            },
            "borough": criteria.borough,
            "cuisine": criteria.cuisine,
            "name": criteria.name,
            "userid" : req.session.id
          }
        },
        (err, results) => {
          client.close();
          assert.equal(err, null);
res.render('update', { docs: criteria });
        });
    }
    
  });
}

const handle_Add = (res, req) => {
  const doc =
  {
    "address": {
      "street": null,
      "zipcode": null,
      "building": null,
      "coord": [null, null
      ]
    },
    "grades": [
    ],
    "borough": null,
    "cuisine": null,
    "name": null,
    "restaurant_id": null,
    "userid": req.session.id,
    "photo": null,
    "mimetype": null,
  }
    ;
  doc.address.street = req.fields.street;
  doc.address.zipcode = req.fields.zipcode;
  doc.address.building = req.fields.building;
  doc.address.coord[0] = req.fields.gps_lon;
  doc.address.coord[1] = req.fields.gps_lat;
  doc.borough = req.fields.borough;
  doc.cuisine = req.fields.cuisine;
  doc.name = req.fields.name;
  doc.restaurant_id = null;
  doc.userid = req.session.id;
  if (req.files.photo && req.files.photo.size > 0) {
    fs.readFile(req.files.photo.path, (err, data) => {
      assert.equal(err, null);
      doc['photo'] = new Buffer.from(data).toString('base64');
      doc['mimetype'] = req.files.photo.type;
    })
  }
  handle_Insert(res, doc);
  
}


const handle_PreUpdate = (res, req) => {
  const doc =
  {
    "_id": req.fields._id,
    "address": {
      "street": null,
      "zipcode": null,
      "building": null,
      "coord": [null, null
      ]
    },
    "grades": [],
    "borough": null,
    "cuisine": null,
    "name": null,
  }
    ;

  doc.address.street = req.fields.street;
  doc.address.zipcode = req.fields.zipcode;
  doc.address.building = req.fields.building;
  doc.address.coord[0] = req.fields.gps_lon;
  doc.address.coord[1] = req.fields.gps_lat;
  doc.borough = req.fields.borough;
  doc.cuisine = req.fields.cuisine;
  doc.name = req.fields.name;
  if (req.files.photo && req.files.photo.size > 0) {
    fs.readFile(req.files.photo.path, (err, data) => {
      assert.equal(err, null);
      doc['photo'] = new Buffer.from(data).toString('base64');
      doc['mimetype'] = req.files.photo.type;
    })
  }
  handle_Update(res, doc,req);
 
}


const handle_ProLogin = (res, req) => {
  const client = new MongoClient(mongourl);
  client.connect((err) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);

    let DOCID = {};
    DOCID['username'] = req.fields.username;
    DOCID['password'] = req.fields.password;
    let cursor = db.collection('user').find(DOCID);
    console.log(`findDocument: ${JSON.stringify(DOCID)}`);
    cursor.toArray((err, docs) => {
      assert.equal(err, null);
      console.log(`findDocument: ${docs.length}`);
      if (docs.length > 0) {
        if (req.session.fail) {
          req.session.fail = null;
        }
        console.log("Login successfully");
        req.session.id = DOCID['username'];
        res.redirect('/read');
      } else {
        req.session.fail = "Login Fail!Try again!";
        res.redirect('/login');
      }
    });
  });
}

app.get('/', (req, res) => {
  res.redirect('/login');
})
app.get('/login', (req, res) => {
  res.render('login', { session: req.session });
})

app.get('/searchRestaurant', (req, res) => {
    if (req.session.id) {
    res.render('searchRestaurantPage');
  } else {
    res.redirect('/login');
  }
})

app.get('/pro_searchRestaurant', (req, res) => {
  res.render('searchRestaurantPage');
})

app.get('/read', (req, res) => {
  if (req.session.id) {
    handle_Read(res,req, req.query);
  } else {
    res.redirect('/login');
  }
})

app.get('/details', (req, res) => {
  if (req.session.id) {
    handle_Details(res, req.query);
  } else {
    res.redirect('/login');
  }
})
app.get('/edit', (req, res) => {
  if (req.session.id) {
    handle_Edit(res, req.query,req);
  } else {
    res.redirect('/login');
  }
})
app.post('/update', (req, res) => {
  if (req.session.id) {
    handle_PreUpdate(res, req);
  } else {
    res.redirect('/login');
  }
})
app.get('/new', (req, res) => {
  if (req.session.id) {
    res.render('new');
  } else {
    res.redirect('/login');
  }
})
app.get('/map', (req, res) => {
  if (req.session.id) {
    res.render('leaflet', { lo: req.query });
  } else {
    res.redirect('/login');
  }
})

app.post('/add', (req, res) => {
  if (req.session.id) {
    handle_Add(res, req);
  } else {
    res.redirect('/login');
  }
})

app.get('/registerForm', (req, res) => {
  res.render('register');
})

app.post('/register', (req, res) => {
  handle_Register(res,req);
})

app.get('/rate', (req, res) => {
  handle_RateForm(res,req);
})


app.get('/ratesub', (req, res) => {
  handle_Rate(res,req.query,req);
})

app.get('/delete', (req, res) => {
  handle_Delete(res,req.query,req);
})

app.post('/pro_login', (req, res) => {
  handle_ProLogin(res, req);
})

app.post('/pro_searchRestaurant', (req, res) => {
  
  handle_ProSearchRestaurant(res, req , req.query);
})

app.get('/logout', (req, res) => {
  req.session = null;
    res.redirect('/');
})

app.get('/api/restaurant/name/:name', (req,res) => {
    if (req.params.name) {
        let criteria = {};
        criteria['name'] = req.params.name;
        const client = new MongoClient(mongourl);
        client.connect((err) => {
            assert.equal(null, err);
            console.log("Connected successfully to server");
            const db = client.db(dbName);

            findDocument(db, criteria, (docs) => {
                client.close();
                console.log("Closed DB connection");
                res.status(200).json(docs);
            });
        });
    } else {
        res.status(500).json({"error": "missing name"});
    }
})

app.get('/api/restaurant/borough/:borough', (req,res) => {
    if (req.params.borough) {
        let criteria = {};
        criteria['borough'] = req.params.borough;
        const client = new MongoClient(mongourl);
        client.connect((err) => {
            assert.equal(null, err);
            console.log("Connected successfully to server");
            const db = client.db(dbName);

            findDocument(db, criteria, (docs) => {
                client.close();
                console.log("Closed DB connection");
                res.status(200).json(docs);
            });
        });
    } else {
        res.status(500).json({"error": "missing name"});
    }
})

app.get('/api/restaurant/cuisine/:cuisine', (req,res) => {
    if (req.params.cuisine) {
        let criteria = {};
        criteria['cuisine'] = req.params.cuisine;
        const client = new MongoClient(mongourl);
        client.connect((err) => {
            assert.equal(null, err);
            console.log("Connected successfully to server");
            const db = client.db(dbName);

            findDocument(db, criteria, (docs) => {
                client.close();
                console.log("Closed DB connection");
                res.status(200).json(docs);
            });
        });
    } else {
        res.status(500).json({"error": "missing name"});
    }
})

app.get('/*', (req, res) => {
    if (req.session.id) {
  res.status(404).render('ErrorRequest', { message: `${req.path} -  Is Unknown request!`,req:req });
   }
  else {
    res.render('login', { session: req.session });
  }
})


app.listen(app.listen(process.env.PORT || 8099));