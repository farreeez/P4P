import { useState, useEffect } from 'react'
import './App.css'

function App() {
    const [testModules, setTestModels] = useState([]);


    useEffect(() => {
        // gets test models
        fetch("https://localhost:7193/testapi/GetTestModels", {
            method: "GET",
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Could not fetch Test Models.");
                }

                return response.json();
            })
            .then((data) => {
                setTestModels(data);
                console.log(data);
            })
            .catch((error) => console.error(error));
    }, []);

  return (
    <>
          <div>
              <h2>Test Models List</h2>
              <ul>
                  {testModules.map((item, index) => (
                      <li key={index}>{item.id}, {item.name}</li>
                  ))}
              </ul>
          </div>
    </>
  )
}

export default App
