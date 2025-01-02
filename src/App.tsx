import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import FoodEdit from "./components/FoodEdit";

function App() {
  return (
    <div className="App">
      <Router basename="/mf-food-edits">
          <Routes>
              <Route path="/food-edit" element={<FoodEdit isAppBarVisible={false}/>}/>
              
          </Routes>
        
      </Router>
    </div>
  );
}

export default App;
