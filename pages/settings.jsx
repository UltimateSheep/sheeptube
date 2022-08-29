import { Button } from "react-bootstrap";
import React, { useState } from "react";
import { getAuth, signOut } from "firebase/auth";
import { updateDoc, doc } from "firebase/firestore";
import { db, firebaseApp } from "../firebase-config";
import { useCookies } from "react-cookie";
import { useRouter } from "next/router";
import { ParseCookies } from "./cookies";
import Head from "next/head";

const Settings = () => {
  const auth = getAuth(firebaseApp);
  const [token, setToken] = useCookies(["token"]);
  const [user, setUser] = useCookies(["user"]);
  const [id, setId] = useCookies(["id"]);
  const [updatingPfp, setUpdatingPfp] = useState(false);
  const router = useRouter();

  const updatePfp = async () => {
    setUpdatingPfp(true);
    const _id = id["id"];
    const _user = user["user"][0];
    const { photoURL } = _user;
    const docRef = doc(db, "db", "channels");
    await updateDoc(docRef, {
      [`${_id}.profilePicture`]: photoURL,
    });
    setUpdatingPfp(false);
  };
  const signOutHandler = () => {
    setToken("token", "", {
      path: "/",
      maxAge: 0, // Expires after 3hr
      sameSite: true,
    });
    setUser("user", "", {
      path: "/",
      maxAge: 0, // Expires after 3hr
      sameSite: true,
    });
    setId("id", "", {
      path: "/",
      maxAge: 0, // Expires after 3hr
      sameSite: true,
    });
    router.replace("/login");
  };

  return (
    <div>
      <Head>
        <title>Settings</title>
      </Head>
      <h1>Settings</h1>
      <Button onClick={() => updatePfp()} disabled={updatingPfp}>
        Update Profile Picture
      </Button>
      <hr />
      <Button onClick={() => signOutHandler()} variant="danger">
        Sign Out
      </Button>
    </div>
  );
};

export async function getServerSideProps({ req, res }) {
  let data = null;

  console.log("hi, ", ParseCookies(req));
  if (res && ParseCookies(req) !== "") {
    data = JSON.parse(JSON.stringify(ParseCookies(req)));
    console.log(data);
    if (Object.keys(data).length < 2) {
      return {
        redirect: {
          permanent: true,
          destination: `/login`,
        },
      };
    }
  }

  return {
    props: {
      data: data && JSON.stringify(data),
    },
  };
}
export default Settings;
