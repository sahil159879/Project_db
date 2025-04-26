import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";

const Login = () => {
  const navigate = useNavigate(); // Use this to redirect users


  // useEffect checks if the user is already logged in
  // if already loggedIn then it will simply navigate to the dashboard
  // TODO: Implement the checkStatus function.
  useEffect(() => {
    const checkStatus = async () => {
      // Implement your logic here
    };
    checkStatus();
  }, []);

  // Read about useState to manage form data
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // TODO: This function handles input field changes
  const handleChange = (e) => {
    // Implement your logic here
  };

  // TODO: Implement the login operation
  // This function should send form data to the server
  // and handle login success/failure responses.
  // Use the API you made for handling this.
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Implement the login logic here
  };

  // TODO: Use JSX to create a login form with input fields for:
  // - Email
  // - Password
  // - A submit button
  return (
    <div>
      {/* Implement the form UI here */}
    </div>
  );
};

export default Login;
