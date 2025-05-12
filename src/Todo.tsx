import React, { useEffect, useState, useCallback, useContext } from "react";
import authgear from "@authgear/web";
import { UserContext } from "./context/UserProvider.js";

import { signInWithCustomToken, UserCredential } from "firebase/auth";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase.js";

interface Todo {
  id: string;
  text: string;
  userId: string;
}

const Todo: React.FC = () => {
  const { isLoggedIn } = useContext(UserContext);
  const [firebaseUser, setFirebaseUser] = useState<object>({});
  const [authError, setAuthError] = useState<boolean>(false);

  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    async function getFirebaseUser() {
      if (isLoggedIn) {
        try {
          const getCustomToken = await authgear
            .fetch(
              "https://us-central1-my-firebase-project.cloudfunctions.net/getFirebaseToken"
            )
            .then((response) => response.json());
          if (getCustomToken.firebaseToken !== null) {
            const firebaseUserObj = await signInWithCustomToken(
              auth,
              getCustomToken.firebaseToken
            );
            setFirebaseUser(firebaseUserObj);
            setAuthError(false);
          }
        } catch (e) {
          console.log(e);
          setAuthError(true);
        }
      } else {
        setAuthError(true);
      }
    }

    getFirebaseUser()
      .then(() => {
        fetchTodos();
      })
      .catch((e) => {
        console.error(e);
      });
  }, [authgear]);

  async function fetchTodos() {
    try {
      const querySnapshot = await getDocs(collection(db, "todos"));
      const todoList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Todo[];
      setTodos(todoList);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  }

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!newTodo.trim() || authError) return;

    try {
      await addDoc(collection(db, "todos"), {
        text: newTodo,
        userId: (firebaseUser as UserCredential).user.uid,
        createdAt: new Date(),
      });
      setNewTodo("");
      fetchTodos();
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  }

  async function deleteTodo(id: string) {
    try {
      await deleteDoc(doc(db, 'todos', id));
      fetchTodos();
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  }

  if (!authError) {
    return (
      <div className="app">
        <div className="todo-container">
          <form onSubmit={addTodo}>
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new todo"
            />
            <button type="submit">Add Todo</button>
          </form>

          <ul>
            {todos.map((todo) => (
              <li key={todo.id}>
                {todo.text}
                <button onClick={() => deleteTodo(todo.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  } else {
    return (
      <div>
        <p>User not logged in</p>
      </div>
    );
  }
};

export default Todo;
