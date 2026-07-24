import React from "react";
import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import HomePage from "./user/pages/HomePage";

function MainApp() {
  return (
    <Routes>
      <Route
        path="/"
        element={<HomePage />}
      />

      <Route
        path="/home"
        element={<HomePage />}
      />

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
}

export default MainApp;