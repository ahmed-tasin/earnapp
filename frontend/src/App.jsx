import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import AdminApp from "./admin/AdminApp";
import UserApp from "./user/UserApp";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/*" element={<UserApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;