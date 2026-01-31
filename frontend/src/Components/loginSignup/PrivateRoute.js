import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const PrivateRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState('loading')
    // const [isServerError, setIsServerError] = useState(false)

    useEffect(() => {

        const checkAuthentication = async () => {
            try {
                await new Promise((resolve, reject) => setTimeout(resolve, 200))
                const response = await fetch(process.env.REACT_APP_API_HOST + '/userApi/authCheck', {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                });
                let data = await response.json();
                console.log('data1', data);
                if (response.status == '200') {
                    if (data.authenticated) {
                        setIsAuthenticated('authenticated');
                    } else {
                        setIsAuthenticated('NotAuthenticated');
                    }
                } else if (response.status == '500') {
                    setIsAuthenticated('serverError');
                    // setIsServerError(true)
                } else {
                    setIsAuthenticated('NotAuthenticated');
                }
                // if (response.ok) {

                // if (data.authenticated) {
                //     setIsAuthenticated('authenticated');
                // } else {
                //     setIsAuthenticated('NotAuthenticated');
                // }
                // } else {
                //     setIsAuthenticated('NotAuthenticated');
                // }
            } catch (e) {
                console.log('ERROR', e);
                setIsAuthenticated('NotAuthenticated');
            }
        }

        checkAuthentication();
    }, [])



    if (isAuthenticated == 'loading') {
        return <div style={{
            height: '100vh',
            width: '100vw',
            fontWeight: 'bold',
            display: "flex",
            justifyContent: "center",
            alignItems: 'center',
            background: 'rgb(62, 63, 63,0.5)'
        }}>
            Loading.....
        </div>
    }

    if (isAuthenticated == 'serverError') {
        return <div style={{
            height: '100vh',
            width: '100vw',
            fontWeight: 'bold',
            display: "flex",
            justifyContent: "center",
            alignItems: 'center',
            background: 'rgb(62, 63, 63,0.5)'
        }}>
            Internal Server Error. Please reload the page or try again some time later...
        </div>
    }

    if (isAuthenticated == 'NotAuthenticated') {

        return <Navigate to="/SignIn" replace />;
    }


    return children;
};

export default PrivateRoute;
