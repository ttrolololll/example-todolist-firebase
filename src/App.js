import './App.css';
import { useEffect, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GithubAuthProvider, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { useCookies } from 'react-cookie';

const firebaseConfig = {
  apiKey: "AIzaSyAjQJGHOWZmHy-CuFaMxNKM_ZkT9swqQjA",
  authDomain: "juicyspicy-todolist.firebaseapp.com",
  projectId: "juicyspicy-todolist",
  storageBucket: "juicyspicy-todolist.appspot.com",
  messagingSenderId: "947077837288",
  appId: "1:947077837288:web:d6856a5aa0c7b2d83f345d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Github Auth provider
const githubProvider = new GithubAuthProvider();

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Get DB collection references
const todosCollectionRef = collection(db, 'todos')

function App() {
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [todoFormData, setTodoFormData] = useState({
    title: '',
    todo: '',
  })
  const [userTodos, setUserTodos] = useState([])

  const loginViaEmail = () => {
    signInWithEmailAndPassword(auth, formData.email, formData.password)
      .then((userCredential) => {
        console.log(userCredential.user)
      })
      .catch((error) => {
        console.log(error)
      });
  }

  const loginViaGithub = () => {
    signInWithPopup(auth, githubProvider)
      .then((result) => {
        setUser(result.user)
      }).catch((error) => {
        console.log(error)
      });
  }

  const handleInputChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleTodoInputChange = e => {
    setTodoFormData({
      ...todoFormData,
      [e.target.name]: e.target.value
    })
  }

  const createTodo = () => {
    const data = {
      // user_id: user.uid,
      title: todoFormData.title,
      todo: todoFormData.todo
    }
    addDoc(todosCollectionRef, data)
      .then(response => {
        data.id = response.id

        setUserTodos([
          data,
          ...userTodos
        ])
      })
      .catch(err => {
        console.log(err)
      })
  }

  useEffect(() => {
    onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)

        const q = query(todosCollectionRef, where('user_id', '==', firebaseUser.uid))

        // retrieve user's todos and set state
        getDocs(q)
          .then(querySnapshot => {
            const todoData = []

            querySnapshot.forEach(item => {
              todoData.push({
                ...item.data(),
                id: item.id
              })
            })

            setUserTodos(todoData)
          })
          .catch(err => {
            console.log(err)
          })
      }
    });
  }, [])


  const [cookies, setCookie] = useCookies(['auth_token']);

  useEffect(() => {
    console.log('current cookies: ', cookies)
    setCookie('auth_token', "love_mcspicy")
    console.log('cookies after setting: ', cookies)
  }, [])

  return (
    <div className="App">
      <h1>JuicySpicy Todolist</h1>

      {!user ? (

        <div className='auth-section'>
          <div className='password-login'>
            <input type="email" value={formData.email} name="email" onChange={handleInputChange} />
            <input type="password" value={formData.password} name="password" onChange={handleInputChange} />
            <button type='button' onClick={loginViaEmail}>Login</button>
          </div>

          <hr />

          <div className='github-login'>
            <button type="button" onClick={loginViaGithub}>Access via Github</button>
          </div>

          <div className='todolist-form'>
            <input type="text" name="title" placeholder='Title' value={todoFormData.title} onChange={handleTodoInputChange} />
            <input type="text" name="todo" placeholder='Todo' value={todoFormData.todo} onChange={handleTodoInputChange} />
            <button type='button' onClick={createTodo}>Create TODO</button>
          </div>
        </div>

      ) : (
        
        <div className='todolist'>
          
          <div className='todolist-form'>
            <input type="text" name="title" placeholder='Title' value={todoFormData.title} onChange={handleTodoInputChange} />
            <input type="text" name="todo" placeholder='Todo' value={todoFormData.todo} onChange={handleTodoInputChange} />
            <button type='button' onClick={createTodo}>Create TODO</button>
          </div>

          <div className='todos'>
            {userTodos.length > 0 ? (
              <ul>
                {
                  userTodos.map(item => {
                    return (
                      <li key={item.id}>{item.title}: {item.todo}</li>
                    )
                  })
                }
              </ul>
            ) : (<p>No todo yet</p>)}
          </div>

        </div>

      )}
      
    </div>
  );
}

export default App;
