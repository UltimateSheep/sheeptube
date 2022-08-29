import React, { useEffect, useState } from "react";
import { ParseCookies } from "../cookies";
import { useRouter } from "next/router";

const Channels = () => {
    const router = useRouter()
    useEffect(()=>{
        router.replace("/")
    },[])

  return(
    <div>
      <h1>Please, input id. This is just empty page</h1>
    </div>
  );
};

export default Channels;
