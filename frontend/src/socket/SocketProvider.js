

import { useEffect, useState } from "react";
import { connectSocket } from "./socket";



export const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = connectSocket();
    setSocket(newSocket);

    // return () => {
    //   disconnectSocket();
    //   setSocket(null);
    // };
  }, []);
  // console.log("MMMMMMMMMMMMMMM socket", socket);
  return socket;
};

