import { useState } from 'react';
import './SignUp.css';
import { useLocation, useNavigate } from 'react-router';
import axios from 'axios';
import GoogleSignInBtn from './GoogleSignInBtn';
import Cookies from 'js-cookie';


function SignUp() {
    const location = useLocation();
    const isSignIn = location.pathname === "/SignIn";
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        reyTypePassword: "",
    });



    // console.log('XXXXXXXXX', getCookie('JWTToken'))

    const [errors, setErrors] = useState({});
    const navigate = useNavigate();


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" });
    };

    const postRequest = async (url) => {
        try {

            let response = await fetch(url, {
                method: "POST", // HTTP method
                headers: {
                    "Content-Type": "application/json", // Inform the server about the data format
                },
                body: JSON.stringify(formData), // Convert the JavaScript object to JSON
                credentials: "include",
            })
            let data = await response.json()
            console.log(data)
            if (response.status == '200') {
                let userData = data.user;
                navigate('/')
                setFormData({
                    email: "",
                    password: "",
                })
            } else if (response.status == '409') {
                setErrors({ generalError: 'User already exist with this email. please log in.' })
            } else if (response.status == '400') {
                if (data.missing)
                    setErrors({ generalError: "Please fill the above filled." })
            } else if (response.status == '401') {
                setErrors({ generalError: "Incorrect credentials." })
            } else if (response.status == '500') {
                setErrors({ generalError: "Internal Server Error." })
            } else {
                setErrors({ generalError: "Something went wrong." })
            }
        } catch (error) {
            console.log("ERROR", error);
            setErrors({ generalError: "Something went wrong." })
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isSignIn) {
            const newErrors = {};

            if (!formData.name.trim()) newErrors.name = "Name is required.";
            if (!formData.email.trim()) newErrors.email = "Email is required.";
            if (!/\S+@\S+\.\S+/.test(formData.email))
                newErrors.email = "Enter a valid email address.";
            if (!formData.password.trim())
                newErrors.password = "Password is required.";
            if (formData.password.length < 6)
                newErrors.password = "Password must be at least 6 characters long.";
            if (formData.password !== formData.reyTypePassword)
                newErrors.reyTypePassword = "Passwords do not match.";

            setErrors(newErrors);

            console.log(formData)//https://quiz-app-api-nk7o.onrender.com/
            await postRequest(process.env.REACT_APP_API_HOST + '/userApi/signUp')
            // try {
            //     const response = await axios.post("http://localhost:8000/set-cookieu", formData);
            //     console.log("Signup successful:", response);
            //     if (response.status == '200') {
            //         let userData = response.data.user;
            //         navigate('/')
            //         setFormData({
            //             name: "",
            //             email: "",
            //             password: "",
            //             reyTypePassword: "",
            //         })
            //     }
            // } catch (error) {
            //     console.error("Error signing up:",);
            // }
        } else {
            const newErrors = {};

            if (!formData.password.trim())
                newErrors.password = "Password is required.";
            if (!formData.email.trim()) newErrors.email = "Email is required.";

            setErrors(newErrors);

            // if (Object.keys(newErrors).length === 0) {
            //     console.log("Form submitted successfully", formData);
            // }
            await postRequest(process.env.REACT_APP_API_HOST + '/userApi/signIn')

        }
    };

    // const data1 = {
    //     name: "John Doe",
    //     email: "johndoe@example.com",
    //     age: 25
    // };
    // const handelcoocki = async () => {
    //     // let response = await fetch('http://localhost:8000/set-cookie', {
    //     //     method: "GET",
    //     //     credentials: "include", // Include cookies in the request
    //     // })
    //     let response = await fetch('http://localhost:8000/set-cookie', {
    //         method: "POST", // HTTP method
    //         headers: {
    //             "Content-Type": "application/json", // Inform the server about the data format
    //         },
    //         body: JSON.stringify(data1), // Convert the JavaScript object to JSON
    //         credentials: "include",
    //     })

    //     // let data = response.json()

    //     // console.log(data.message)
    //     // axios
    //     //     .get("http://localhost:8000/set-cookie", {
    //     //         withCredentials: true, // Include cookies in the request
    //     //     })
    //     //     .then((response) => {
    //     //         console.log(response.data.message); // Confirm cookie is set
    //     //     })
    //     //     .catch((error) => {
    //     //         console.error("Error setting cookie:", error);
    //     //     });
    // }

    return (<div className='signUpDiv'>
        <div className='centerStyle signUpDivInner'>
            {console.log(isSignIn)}
            <form className="form-container" onSubmit={handleSubmit}>
                {!isSignIn && <div className="form-group">
                    <label htmlFor="name">Name:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                    {errors.name && <span className="error-message">{errors.name}</span>}
                </div>}

                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    {errors.password && (
                        <span className="error-message">{errors.password}</span>
                    )}
                </div>

                {!isSignIn && <div className="form-group">
                    <label htmlFor="reyTypePassword">Retype Password:</label>
                    <input
                        type="password"
                        id="reyTypePassword"
                        name="reyTypePassword"
                        placeholder="Retype your password"
                        value={formData.reyTypePassword}
                        onChange={handleChange}
                    />
                    {errors.reyTypePassword && (
                        <span className="error-message">{errors.reyTypePassword}</span>
                    )}
                </div>}



                <button
                    type="submit"
                    className="submit-button"
                >
                    Submit
                </button>
            </form>

            {errors.generalError && <span className="error-message">{errors.generalError}</span>}

            {/* <button onClick={handelcoocki}>coocki</button> */}
            <GoogleSignInBtn setErrors={setErrors} />

            {isSignIn ? <div className='signUpLink' onClick={() => navigate('/SignUp')}>
                New user SignUp
            </div>
                : <div className='signUpLink' onClick={() => navigate('/SignIn')}>
                    Exciting user SignIm
                </div>}
        </div>
    </div>)
}

export default SignUp;