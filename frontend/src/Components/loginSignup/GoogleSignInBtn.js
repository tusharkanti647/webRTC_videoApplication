import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router";

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
function GoogleSignInBtn({ setErrors }) {
    const navigate = useNavigate()

    //google signin handel
    const handelLogin = async (googleData) => {

        try {
            let response = await fetch(process.env.REACT_APP_API_HOST + '/userApi/googleSignIn', {
                method: "POST", // HTTP method
                headers: {
                    "Content-Type": "application/json", // Inform the server about the data format
                },
                body: JSON.stringify({ googleToken: googleData }), // Convert the JavaScript object to JSON
                credentials: "include",
            })
            let data = await response.json();
            console.log(data)
            if (response.status == '200') {
                let userData = data.user;
                navigate('/')
            } else if (response.status == '500') {
                setErrors({ generalError: "Internal Server Error." })
            }
        } catch (error) {
            console.log("ERROR", error);
        }

    }


    return (<div style={{ marginTop: '40px' }}><GoogleLogin
        onSuccess={credentialResponse => {
            handelLogin(credentialResponse.credential);
        }}
        onError={() => {
            console.log('Login Failed');
        }}
    />;</div>)
}

export default GoogleSignInBtn;