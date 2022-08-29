import React, { useState, useRef } from "react";
import { db, firebaseApp } from "../firebase-config";
import Form from "react-bootstrap/Form";
import {
  getStorage,
  uploadBytesResumable,
  ref,
  getDownloadURL,
} from "firebase/storage";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { Badge, Button, Spinner } from "react-bootstrap";
import { ParseCookies } from "./cookies";
import Link from "next/link";
import { async } from "@firebase/util";
import { useCookies } from "react-cookie";
import { useRouter } from "next/router";
import { v4 } from "uuid";
import ShortUniqueId from "short-unique-id";
import Head from "next/head";

function Upload({ data }) {
  const [filePercent, setFilePerscent] = useState(0);
  const [videoFile, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [Finished, setFinished] = useState(false);
  const fileRef = useRef(null);
  const [userId, setUserId] = useCookies(["id"]);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState("");
  const [desc, setDesc] = useState("");
  const [vidId, setVidId] = useState("");
  const [generated, setGenerated] = useState("");

  const ChangeFile = (e) => {
    const previewFile = e.target.files[0];
    if (previewFile === undefined || previewFile === null)
      return

    if (previewFile["size"] > 200_000_000) {
      alert("You hit maximum of 200mb!")
      return;
    }
    const urlLink = URL.createObjectURL(previewFile);
    setVideo(urlLink);
    setLoading(false);
    router.push("#video");
  };

  const UploadFile = () => {
    setFinished(false);
    setTitleError("");
    if (title === "") {
      setTitleError("Please, do not enter empty title");
      router.push("#titleError");
      return;
    }
    setUploading(true);
    setLoading(true);
    const file = fileRef.current.files[0];
    const videoStorage = getStorage(
      firebaseApp,
      "gs://sheeptube-bff33.appspot.com/"
    );
    const videoRef = ref(
      videoStorage,
      `/uploads/videos/${new Date().getTime()}-${file.name}`
    );
    const task = uploadBytesResumable(videoRef, file);

    task.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerscent(progress);
        switch (snapshot.state) {
          case "paused":
            alert("Paused");
            break;
          case "running":
            console.log("running");
            break;
        }
      },
      (error) => {
        console.error(error);
        setLoading(false);
      },
      () => {
        getDownloadURL(task.snapshot.ref).then(async (url) => {
          const docRef = doc(db, "db", "channels");
          const docSnap = await getDoc(docRef);
          const idToSet = userId["id"];
          const anotherVideos = docSnap.data()[idToSet]["videos"];
          const vidUid = new ShortUniqueId({ length: 10 })();
          console.log(idToSet, anotherVideos);
          await updateDoc(docRef, {
            [idToSet]: {
              ...docSnap.data()[idToSet],
              videos: {
                [vidUid]: {
                  urlId: vidUid,
                  creator: idToSet,
                },
                ...anotherVideos,
              },
            },
          });
          const docVidRef = doc(db, "db", "videos");
          const docVidSnap = await getDoc(docVidRef);
          const allVideos = docVidSnap.data();
          await setDoc(docVidRef, {
            ...allVideos,
            [vidUid]: {
              title: title,
              description: desc,
              author: idToSet,
              likes: 0,
              dislikes: 0,
              views: 0,
              url: url,
              comments: [],
              id: vidUid,
              createdAt: Timestamp.now(),
            },
          });
          setGenerated(`${location.origin}/v/${vidUid}`);
          setFinished(true);
        });
      }
    );
  };

  return (
    <div>
      <Head>
        <title>Upload</title>
      </Head>
      <h1>Let&#39;s upload new video and get famous! </h1>
      <Badge bg="danger">200MB limit</Badge>
      <br />
      <input
        ref={fileRef}
        type="file"
        accept="video/*"
        onChange={(e) => ChangeFile(e)}
        disabled={generated !== "" || uploading}
      />
      <Button onClick={() => UploadFile()} disabled={uploading || videoFile === null || generated !== ""}>
        Upload
      </Button>
      {uploading === true || Finished === true ? (
        <Spinner animation="border" />
      ) : (
        <></>
      )}
      <progress
        value={filePercent}
        max={100}
        style={{ marginLeft: "10px", paddingTop: "15px", width: "500px" }}
      />
      <br />
      <hr />
      {videoFile != null && generated === "" ? (
        <div>
          <p style={{ color: "grey" }}>&#65288;This is a preview file&#41;</p>
          <video
            src={videoFile}
            controls
            style={{ maxWidth: "990px", maxHeight: "360px" }}
            id="video"
          />
          <hr />
          <Form>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <p
                style={{ color: "red", marginBottom: "-10px" }}
                id="titleError"
              >
                *{titleError}
              </p>
              <Form.Label>Enter your title...</Form.Label>
              <Form.Control
                type="text"
                placeholder="Your title"
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                disabled={uploading === true}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Enter your description...</Form.Label>
              <br />
              <textarea
                id="about"
                name="about"
                rows="10"
                cols="50"
                placeholder="Your description (optional)"
                onChange={(e) => setDesc(e.target.value)}
                maxLength={1150}
                disabled={uploading === true}
              ></textarea>
            </Form.Group>
            {/* <Form.Group className="mb-3" controlId="formBasicCheckbox">
              <Form.Check type="checkbox" label="Check me out" />
            </Form.Group> */}
          </Form>
        </div>
      ) : generated !== "" ? (
        <div>
          <h3>
            You&#39;ve uploaded the video! Check it here :{" "}
            <Link href={generated}>{generated}</Link>
          </h3>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export async function getServerSideProps({ req, res }) {
  let data = null;

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

export default Upload;
