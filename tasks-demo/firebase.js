  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
  import { getDatabase, ref, set, child, push,update, onValue  } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

  const firebaseConfig = {
    apiKey: "AIzaSyCUxCDXYh54ujSGo4rRS9TkiZTPhArYaIw",
    authDomain: "fir-tasks-24d9a.firebaseapp.com",
    databaseURL: "https://fir-tasks-24d9a-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "fir-tasks-24d9a",
    storageBucket: "fir-tasks-24d9a.firebasestorage.app",
    messagingSenderId: "772231948579",
    appId: "1:772231948579:web:e42a37a8e7b436e3cc4496"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);

  export function getNextKey(dataPath) {
    return push(child(ref(database), dataPath)).key;
  }

  export function getData(dataPath) {
    const dbPath = ref(database, dataPath);
    
    return new Promise((res) => {
      onValue(dbPath, (snapshot) => {
        const data = snapshot.val();
        res(data);
      });
    })
  }

  export function setData(dataPath, value) {
    const dbPath = ref(database, dataPath);
    return set(dbPath, value);
  }

  export function updateData(dataPath, value) {
    const dbPath = ref(database, dataPath);
    return update(dbPath, { [dataPath]: value });
  }