import React, { useState } from "react";
import styles from "../styles/Home.module.css";
import { Button, Form } from "react-bootstrap";
import { db, firebaseApp } from "../firebase-config";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { async } from "@firebase/util";
import { useCookies } from "react-cookie";
import { useRouter } from "next/router";
import { ParseCookies } from "./cookies";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import Head from "next/head";

const Login = (props) => {
  const router = useRouter();
  const auth = getAuth(firebaseApp);
  const provider = new GoogleAuthProvider();
  const [userCookie, setUserCookie] = useCookies(["user"]);
  const [tokenCookie, setTokenCookie] = useCookies(["token"]);
  const [idCookie, setIdCookie] = useCookies(["id"]);
  const [isLogin, setLogin] = useState(false);
  const [register, setRegister] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [channelNameError, setChannelNameError] = useState("");
  const [about, setAbout] = useState("");
  const [aboutError, setAboutError] = useState("");
  const [agreement, setAgreement] = useState(false);
  const [agreementError, setAgreementError] = useState("");
  const [reToken, setReToken] = useState("");

  const [dataSnapshot, setDataSnapshot] = useState({
    user: {},
    providerData: {},
    docSnap: {},
  });

  const signin = async () => {
    const data = await signInWithPopup(auth, provider);
    const { user } = data;
    const { refreshToken, providerData } = user;
    setLogin(true);
    //register
    const docRef = doc(db, "db", "channels");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const snapshot = docSnap.data();
      console.log(snapshot, user.uid in snapshot, user.uid);
      setDataSnapshot({ user, providerData, docSnap });
      if (user.uid in snapshot) {
        setReToken(refreshToken);
        setUserCookie("user", JSON.stringify(providerData), {
          path: "/",
          maxAge: 10800, // Expires after 3hr
          sameSite: true,
        });
        setTokenCookie("token", JSON.stringify(refreshToken), {
          path: "/",
          maxAge: 10800, // Expires after 3hr
          sameSite: true,
        });
        setIdCookie("id", JSON.stringify(user.uid), {
          path: "/",
          maxAge: 10800, // Expires after 3hr
          sameSite: true,
        });
        router.replace("/");
        return;
      }
      setRegister(true);
      return;
    }
    alert("error!");
  };

  const createAccount = async (e) => {
    e.preventDefault();
    console.log(`${channelName} \n${about} \n${agreement}`);
    setChannelNameError("");
    setAboutError("");
    setAgreementError(false);

    if (channelName.length < 3) {
      setChannelNameError(
        "*Please, put in channel that has lenght more than 3"
      );
      return;
    }
    if (channelName === "") {
      setChannelNameError("*Do not put in empty channel name");
      return;
    }
    if (about === "") {
      setAboutError("*Do not put in empty about");
      return;
    }
    if (!agreement) {
      setAgreementError("*Please, accept the agreement :(");
      return;
    }

    const docToSet = doc(db, "db", "channels");
    try {
      const docToSetData = await getDoc(docToSet);
      console.log(docToSetData.data());
      await setDoc(docToSet, {
        ...docToSetData.data(),
        [dataSnapshot["user"]["uid"]]: {
          name: channelName,
          about: about,
          total_subcribers: 0,
          total_view: 0,
          subscribing: {},
          videos: {},
          posts: {},
          liking: {},
          disliking: {},
          profilePicture: dataSnapshot.user["photoURL"],
          createdAt: serverTimestamp(),
        },
      });
      setUserCookie("user", JSON.stringify(dataSnapshot["providerData"]), {
        path: "/",
        maxAge: 10800, // Expires after 3hr
        sameSite: true,
      });
      setTokenCookie("token", JSON.stringify(reToken), {
        path: "/",
        maxAge: 10800, // Expires after 3hr
        sameSite: true,
      });
      setIdCookie("id", dataSnapshot["user"]["uid"], {
        path: "/",
        maxAge: 10800, // Expires after 3hr
        sameSite: true,
      });
      router.replace("/");
      return;
    } catch (error) {
      alert(error);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Login</title>
      </Head>
      <h1>Welcome to Login page! Please, proceed to login</h1>
      {!isLogin ? (
        <Button onClick={() => signin()}>Login with google</Button>
      ) : (
        <></>
      )}
      {register ? (
        <div>
          <hr />
          <p>
            look like you haven&#39;t create channel with this email, please
            create one
          </p>
          <Form onSubmit={(e) => createAccount(e)}>
            <Form.Group className="mb-3" controlId="channelName">
              <Form.Label>
                Your Channel{" "}
                {channelNameError !== "" ? (
                  <p style={{ color: "red" }}>{channelNameError}</p>
                ) : (
                  <></>
                )}
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Channel Name"
                onChange={(e) => setChannelName(e.target.value)}
                maxLength={20}
              />
              <Form.Text className="text-muted">
                Just let everyone knows your channel!.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="about">
              <Form.Label>
                Your About{" "}
                {aboutError !== "" ? (
                  <p style={{ color: "red" }}>{aboutError}</p>
                ) : (
                  <></>
                )}
              </Form.Label>
              <br />
              <textarea
                id="about"
                name="about"
                rows="10"
                cols="50"
                placeholder="Your about"
                onChange={(e) => setAbout(e.target.value)}
                maxLength={150}
              ></textarea>
            </Form.Group>
            <Form.Group className="mb-3" controlId="agreement">
              <Form.Check
                type="checkbox"
                label={`I've read the term of service and agree with it`}
                onChange={(e) => setAgreement(e.target.value)}
              />
              {agreementError !== "" ? (
                <>
                  <br />
                  <p style={{ color: "red" }}>{agreementError}</p>
                </>
              ) : (
                <></>
              )}
            </Form.Group>
            <Button variant="primary" type="submit">
              Create and go!
            </Button>
          </Form>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export async function getServerSideProps({ req, res }) {
  let data = null;

  console.log("hi, ", ParseCookies(req));
  if (res && ParseCookies(req) !== "") {
    data = JSON.parse(JSON.stringify(ParseCookies(req)));
    console.log(data);
    if (Object.keys(data).length > 2) {
      return {
        redirect: {
          permanent: false,
          destination: `/`,
        },
      };
    }
    // return {
    //   redirect: {
    //     permanent: false,
    //     destination: `/`,
    //   },
    // };
  }

  return {
    props: {
      data: data && JSON.stringify(data),
    },
  };
}

export default Login;
