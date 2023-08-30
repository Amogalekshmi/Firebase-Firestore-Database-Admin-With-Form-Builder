
import Firebase from 'firebase'
let config = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  };

  export default !Firebase.apps.length ? Firebase.initializeApp(config) : Firebase.app();
  export const db =  !Firebase.apps.length ? Firebase.initializeApp(config) : Firebase.firestore();
  export const firestorage =  !Firebase.apps.length ? Firebase.initializeApp(config) : Firebase.storage();
  export const firestore = !Firebase.apps.length ? Firebase.initializeApp(config) : Firebase.firestore();