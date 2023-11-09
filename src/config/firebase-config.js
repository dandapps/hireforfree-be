var admin = require("firebase-admin");
const firebase = require('firebase/app');
require('firebase/auth');

const firebaseConfig = {
    apiKey: "AIzaSyCMg6U2fhALiC4kCbheBdnAJyhFME7oHP8",
    authDomain: "hireforfree-db.firebaseapp.com",
    projectId: "hireforfree-db",
    storageBucket: "hireforfree-db.appspot.com",
    messagingSenderId: "1012580929957",
    appId: "1:1012580929957:web:19ab8e75cd8190fb6a184c",
    measurementId: "G-9G270REM8Q"
  };

firebase.initializeApp(firebaseConfig);
var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://hireforfree-db-default-rtdb.firebaseio.com",
  storageBucket: 'hireforfree-db.appspot.com',
});

// Initialize Firebase
// const firebaseApp = initializeApp(firebaseConfig);
// const db = firebaseApp.fireStore();
// const Users =db.collection("Users");

// module.exports = admin;
// module.exports = firebase;

module.exports = {
    admin: admin,
    firebase: firebase
  };