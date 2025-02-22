import React, { useEffect, useState} from 'react'
import Map from "./components/Map"; 



function App() {
  const [ backendData, setBackendData] = useState([{}])
 
  useEffect(() =>{
    fetch("/api").then(
      response => response.json()
    ).then(
      data => {
        setBackendData(data)
      }
    )
  }, [])


  return (
    <>
      <header>
        <h1>Hello World</h1>
        {(typeof backendData.users === 'undefined') ? (
          <p>Loading...</p>
        ) : (
          backendData.users.map((user, i) => (
            <p key={i}>{user}</p>
          ))
        )}
       
       
      </header>
    </>


  );
}

export default App