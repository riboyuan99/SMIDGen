const express = require('express');
const path = require('path');
const request = require('request')

const app = express();
const port = 8080;

// CORS | needed to access the python API from a non-local source.
const cors = require('cors');
app.use(cors());

// Middleware for processing JSON objects.
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
app.use(bodyParser.urlencoded({
    extended: false
}));

// Firebase (https://firebase.google.com/docs/admin/setup#set-up-project-and-service-account)
//const { initializeApp } = require('firebase-admin/app');
//const { firestore } = require("firebase-admin");
var admin = require("firebase-admin");
// Generate file here -> https://console.firebase.google.com/u/1/project/smidgen-5f8b9/settings/serviceaccounts/adminsdk
var serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://smidgen-5f8b9-default-rtdb.firebaseio.com"
});
const db = admin.firestore()

app.use(express.json())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(function (req, res, next) {
    const {
        url,
        path: routePath
    } = req;
    console.log('Request: Timestamp:', new Date().toLocaleString(), ', URL (' + url + '), PATH (' + routePath + ').');
    next();
});

app.get('/api/v1/now', (req, res) => {
    res.json({
        now: new Date().toString()
    });
});

app.get('/firebaseConfig', (req, res) => {
    res.status(403).end();
});

app.get('/config', (req, res) => {
    var config = require('./firebaseConfig.json');
    res.send(JSON.stringify(config));
})

//app.use(express.static(__dirname + '/node_modules/firestore/app/'));

app.post('/api/v1/login', jsonParser, function (req, res) {

});

app.post('/api/v1/signup', jsonParser, function (req, res) {
    console.log(req.body.uid)
    var users_doc = db.collection('users').doc(req.body.uid);
    users_doc.set({"uid": req.body.uid, "uemail": req.body.u_email, "uname":req.body.name})
})

// -----------------------------------------------Collaboration-----------------------------------------------
// Load existing projects for a specified user:
app.post('/loadCollaborators', (req, res) => {
    console.log("here")
    var proj_id = req.body.project_id
    var collaborators = {}
    db.collection('projects').doc(proj_id).collection('user').get().then(function (result) {
        result.forEach(doc => {
            var collaborator = {}
            collaborator['role'] = doc.data().role
            collaborators[doc.data().uid] = collaborator
        })
    })
    .then(()=>{
        db.collection('users').get().then(function (users) {
            users.forEach(user => {
                if(collaborators[user.data().uid] === undefined){
                    //pass
                }else{
                    collaborators[user.data().uid]['email'] = user.data().uemail
                    collaborators[user.data().uid]['name'] = user.data().uname
                }
            })
            res.send(collaborators)
        })
    })
    
})

app.post('/getProjectName', (req, res) => {
    var proj_id = req.body.project_id
    db.collection('projects').doc(proj_id).get().then(function (result) {
        res.send(result.data().name)
    })
})

app.post('/isOwner', (req, res) => {
    var uid = req.body.uid
    var projID = req.body.proj_id
    db.collection('projects').doc(projID).collection('user').doc(uid).get().then(function (result) {
        if(result.data().role == "owner"){
            res.send(true)
        }else{
            res.send(false)
        }
    })
})

app.post('/inProject', (req, res) => {
    var uid = req.body.uid
    var projID = req.body.proj_id
    db.collection('projects').doc(projID).collection('user').doc(uid).get().then(function (result) {
        if(result.exists){
            res.send(true)
        }else{
            res.send(false)
        }
    })
})

app.post('/deleteCollaborator', (req, res) => {

    var email = req.body.email
    var projID = req.body.projID
    var uid = null
    db.collection("users").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(user) {
            console.log("looping firebase: ", user.data().uemail)
            if(user.data().uemail == email){
                console.log("found it!")
                uid = user.data().uid
            }
        });
    })
    .then( () => {
        db.collection('projects').doc(projID).collection('user').doc(uid).delete().then( ()=>{
            db.collection('users').doc(uid).collection('projects').doc(projID).delete()
        })
    })
})

app.post('/addCollaborator', (req, res) => {
    console.log("req.body: ", req.body)
    var uid = req.body.uid
    var name = req.body.name
    var project_name = req.body.project_name
    var role = req.body.role
    var project_id = req.body.project_id
    db.collection('projects').doc(project_id).collection("user").doc(uid).set({
        uid: uid,
        role: role,
        name: name
    })
    .then(()=>{
        db.collection('users').doc(uid).collection("projects").doc(project_id).set({
            name: project_name,
            role:role
        })
    })
})

app.post('/check_uemail', (req, res) => {
    var uemail = req.body.uemail
    var exist = false
    var found = false
    var temp_uid = null
    console.log("need to check: ", uemail)
    db.collection("users").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(user) {
            console.log("looping firebase: ", user.data().uemail)
            if(user.data().uemail == uemail){
                console.log("found it!")
                exist = true
                temp_uid = user.data().uid
            }
        });
    })    
    .then(()=>{
        db.collection("projects").doc(req.body.projID).collection('user').get().then(function(querySnapshot) {
            querySnapshot.forEach(function(user) {
                console.log("looping firebase: ", user.data().uid)
                if(user.data().uid == temp_uid){
                    found = true
                    console.log("found!")
                }
            });  
        })
        .then(()=>{
            var result = {"uid": temp_uid}
            if(exist && (!found)){
                result['add'] = true
                res.send(result)
            }else{
                result['add'] = false
                res.send(result)
            }
    
        })

    })
   
})

app.get('/collaboration', function (req, res) {
    res.sendFile(path.join(__dirname, '/html/collaboration.html'));
});







// Project dashboard:
app.get('/projects', function (req, res) {
    res.sendFile(path.join(__dirname + '/html/projects.html'))
});

// Load existing projects for a specified user:
app.post('/loadProjects', (req, res) => {
    var user_id = req.body.uid
    console.log("Load projects for: ",user_id)
    var projects = []
    db.collection('users').doc(user_id).collection('projects').get().then(function (result) {
        console.log("here")
        result.forEach(doc => {
            var project_dic = {
                'id': doc.id,
                'name': doc.data().name + "(" +  doc.data().role + ")",
                'role': doc.data().role
            }
            projects.push(project_dic)
        })
        res.send(projects)
    })
   
})

// Create a project: 
app.post("/createProject", (req, res) => {
    console.log("Creating project: ", req.body)
    var full_name = null
    db.collection("users").doc(req.body.uid).get().then(function (user){
        full_name = user.data().uname
    })
    .then(() =>{
        db.collection('projects').doc(req.body.proj_id).set({
            name: req.body.name
        })
        .then(()=>{
            db.collection('projects').doc(req.body.proj_id).collection("user").doc(req.body.uid).set({
                uid: req.body.uid,
                role: "owner",
                name: full_name
            })
        })
        .then(() => {
            db.collection('users').doc(req.body.uid).collection('projects').doc(req.body.proj_id).set({
                name: req.body.name,
                role:"owner"
            })
        })

    })

})

//Delete a project:
app.post("/deleteProject", (req, res) => {
    db.collection('projects').doc(req.body.id).delete().then(function () {
        console.log(req.body.id + " deleted from projects collection!");
    }).catch(function (error) {
        console.log("Error removing doc: ", error)
    })
    .then(()=>{
        db.collection('users').doc(req.body.uid).collection('projects').doc(req.body.id).delete().then(function () {
            console.log(req.body.id + " deleted from users/projects collection!");
        }).catch(function (error) {
            console.log("Error removing doc: ", error)
        })
    })
    .then(() =>  {
        db.collection("users").get().then(function(querySnapshot) {
            querySnapshot.forEach(function(user) {
                db.collection('users').doc(user.id).collection("projects").doc(req.body.id).delete().then(function(){
                    console.log("Project deleted from " + user.id);
                  }).catch(function(error){
                    console.log("Error removing doc: ", error)
                  })
            });
        });
    })
})


//Rename a project:
app.post("/renameProject", (req, res) => {
    db.collection('projects').doc(req.body.id).update({
        name: req.body.new_name
    })
    .then(() => {
        db.collection('users').doc(req.body.uid).collection('projects').doc(req.body.id).update({
            name: req.body.new_name
        })
    })
    .then(() => {
        db.collection("users").get().then(function(querySnapshot) {
            querySnapshot.forEach(function(user) {
                db.collection('users').doc(user.id).collection("projects").doc(req.body.id).update({
                    name: req.body.new_name
                }).catch(function(error){
                    console.log("Error rename doc: ", error)
                })
            });
        });
    })
})





//Testing labelTweets page
app.get('/labelTweets', function (req, res) {
    res.sendFile(path.join(__dirname, '/html/labelTweets.html'));
});

//Load existing tweets:
app.post('/loadTweets', (req, res) => {
    console.log(req.body)
    var project_id = req.body.projectID
    var tweets_arr = []
    db.collection('projects').doc(project_id).collection('tweets').get().then(function(tweets){
        tweets.forEach(doc => {
            var tweet_dic = {'id': doc.data().id, 'content': doc.data().text, 'relevance': doc.data().relevance}
            console.log(tweet_dic)
            tweets_arr.push(tweet_dic)
        })
        res.send(tweets_arr)
    })
})

//Load existing tweets:
app.post('/getProjInfo', (req, res) => {
    console.log(req.body)
    var project_id = req.body.proj_id
    console.log("project_id: ", project_id)
    var proj_info = {}
    db.collection('projects').doc(project_id).get().then(function(doc) {
        proj_info['name'] = doc.data().name
        proj_info['keyword'] = doc.data().keyword
        console.log("proj_info: ", proj_info)
        res.send(proj_info)
    });

      
})

//Save tweet relevance status
app.post("/saveRelevance", (req, res) => {
    var project_id = req.body.projectID
    console.log(project_id)
    req.body.relevance.forEach(record => {
        var tweet = db.collection('projects').doc(project_id).collection('tweets').doc(record.id);
        tweet.update({
            relevance: record['relevance']
        })
    })

})


// Index (Login/Signup) page
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, './index.html'));
});

//--------------------------------------------------Search tweets page------------------------------------------

// Load search page
app.get('/search', function (req, res) {
    res.sendFile(path.join(__dirname, '/html/newSearch.html'));
});

// Search Tweets(new)
app.post('/searchTweets', function (req, res) {
    request({
        method: 'POST',
        // url: "http://smidgen.cis.udel.edu:8081/tweets",
        url: 'http://127.0.0.1:8081/tweets',
        // body: '{"foo": "bar"}'
        json: {"keyword_arr":req.body.keywords, "counts":req.body.numOfTweets}
    }, (error, response, body) => {
        console.log(error);
        console.log("body: ", body)
        res.json(body)
    });
});


app.post('/saveTweets', function (req, res) {
    console.log(req.body)
    var proj_id = req.body.project_id
    var keywords = req.body.keywords
    var tweets_need_to_save = req.body.save_tweets

    const curr_project = db.collection('projects').doc(proj_id)
    curr_project.update({
        keyword: keywords
    })
    // Add new tweets
    for (const [key, value] of Object.entries(tweets_need_to_save)) {
        db.collection("projects").doc(proj_id).collection("tweets").doc(key).set({
            id: key,
            text: value
        })
    }
    res.send("done")
});

app.post('/deleteExistingTweets', function (req, res) {
    
    var proj_id = req.body.project_id
    // Delete existing tweets:
    db.collection('projects').doc(proj_id).collection('tweets').get().then(querySnapShot => {
        querySnapShot.docs.forEach(snapshot => {
          snapshot.ref.delete()
        })
        res.send("deleted existing tweets")
    })
});


app.post('/loadTweets_proj', function (req, res) {
    var projectID = req.body.proj_id
    var tweets = {}
    db.collection('projects').doc(projectID).collection('tweets').get().then(function (result) {
        result.forEach(doc => {
            tweets[doc.id] = doc.data().text
        })
        res.send(tweets)
    })
    
});
app.post('/getKeyword', function (req, res) {
    var projectID = req.body.proj_id
    var tweets = {}
    db.collection('projects').doc(projectID).get().then(function(doc) {
        res.send(doc.data().keyword);

    });
    
});



/*
// Auth page
app.get('/auth', function (req, res) {
    res.sendFile(path.join(__dirname, '/html/auth.html'));
});
*/


// A middle ware for serving static files
app.use('/', express.static(path.join(__dirname, '')))

// Start server
app.listen(port, () => {
    console.log("Server running at:\u001b[1;36m http://127.0.0.1:" + port + "\u001b[0m");
});