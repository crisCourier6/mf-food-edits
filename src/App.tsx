import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import FoodEdit from "./components/FoodEdit";

function App() {
  return (
    <div className="App">
      <Router>
          <Routes>
              <Route path="/food-edit" element={<FoodEdit />}/>
              
          </Routes>
        
      </Router>
    </div>
  );
}

export default App;
