

import { useEffect, useState } from "react";
import { connectSocket } from "./socket";


// custom hook for get the socket connection
export const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = connectSocket();
    setSocket(newSocket);

 
  }, []);
 
  return socket;
};

