import React, { useState, useRef } from "react";
import "./App.css";

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
  apiKey: "AIzaSyC_tIdstQUbZIcjNslbZcEObn8iGGcReKU",
  authDomain: "react-a6fd6.firebaseapp.com",
  databaseURL: "https://react-a6fd6.firebaseio.com",
  projectId: "react-a6fd6",
  storageBucket: "react-a6fd6.appspot.com",
  messagingSenderId: "31892377365",
  appId: "1:31892377365:web:79480586f3aed54cbca31c",
  measurementId: "G-8MXG4J1FVE",
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  return (
    <>
      {user ? (
        <div className="App">
          <header className="App-header">
            <h3>Group Chat</h3>
            <SignOut />
          </header>

          <section>
            <ChatRoom />
          </section>
        </div>
      ) : (
        <SignIn />
      )}
    </>
  );
}

const SignIn = () => {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };
  return (
    <>
      <div className="signin">
        <div>
          <h1>Try our new realtime chat! </h1>
          {/* <h2>Instant sign in with your Google account</h2> */}
          <button onClick={signInWithGoogle}>Sign in with Google</button>
        </div>
      </div>
    </>
  );
};

const SignOut = () => {
  return (
    auth.currentUser && <button onClick={() => auth.signOut()}>Sign Out</button>
  );
};

const ChatRoom = () => {
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(25);

  const [messages] = useCollectionData(query, { idField: "id" });
  const [formValue, setFormValue] = useState("");
  const scrollPoint = useRef();

  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL, displayName } = auth.currentUser;
    await messagesRef.add({
      displayName: displayName,
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");
    scrollPoint.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

        <div ref={scrollPoint}></div>
      </main>
      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </>
  );
};

const ChatMessage = (props) => {
  const { displayName, text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} alt={"avatar"} />
      <div>
        <p className="username">{displayName}</p>
        <p>{text}</p>
      </div>
    </div>
  );
};

export default App;
