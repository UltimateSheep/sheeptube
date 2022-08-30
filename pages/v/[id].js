import { async } from "@firebase/util";
import React, { useState, useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import { Badge, Button, Toast, ToastContainer } from "react-bootstrap";
import { ParseCookies } from "../cookies";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
  updateDoc,
  deleteDoc,
  deleteField,
} from "firebase/firestore";
import { db } from "../../firebase-config";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import ReactPlayer from "react-player";
import ShortUniqueId from "short-unique-id";
import Head from "next/head";

const Details = ({ id, data }) => {
  const [video, setVideo] = useState({});
  const [author, setAuthor] = useState({});
  const [authorId, setAuthorId] = useState("");
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);
  const [userData, setUserData] = useState({});
  const [idData, setIdData] = useState("");
  const controllerRef = useRef();
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [loadingComment, setLoadingComment] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [subscribers, setSubscribers] = useState(0);
  const [isSubscribed, setIsSubcribed] = useState(false);
  const [loadingSub, setLoadingSub] = useState(false);
  const [isChannelAuthor, setIsChannelAuthor] = useState(false);

  const router = useRouter();

  const FetchData = async () => {
    const docChannelRef = doc(db, "db", "channels");
    const docChannelSnap = await getDoc(docChannelRef);
    const docChannelData = docChannelSnap.data();

    const docVidRef = doc(db, "db", "videos");
    const docVidSnap = await getDoc(docVidRef);
    const docVidData = docVidSnap.data();
    // const clientUserId = JSON.parse(JSON.parse(data)["id"]);

    if (!(id in docVidData)) {
      setNotFoundError(true);
      return;
    }
    const authorId = docVidData[id]["author"];

    if (!id in docChannelData[authorId]["videos"][id]) {
      setNotFoundError(true);
      return;
    }
    const videoData = docVidData[id];
    const _author = docChannelData[authorId];

    // if (clientUserId === authorId) {
    //   setIsChannelAuthor(true);
    // }
    // if (authorId in docChannelData[clientUserId]["subscribing"]) {
    //   setIsSubcribed(true);
    // }

    setSubscribers(_author["total_subcribers"]);
    setLoading(false);
    setVideo(videoData);
    setAuthor(_author);
    setAuthorId(authorId);
  };

  const FetchComments = async () => {
    setComments([]);
    const docChannelRef = doc(db, "db", "channels");
    const docChannelSnap = await getDoc(docChannelRef);
    const docChannelData = docChannelSnap.data();

    const docVidRef = doc(db, "db", "videos");
    const docVidSnap = await getDoc(docVidRef);
    const docVidData = docVidSnap.data();

    if (!id in docVidData) {
      setNotFoundError(true);
      return;
    }
    const authorId = docVidData[id]["author"];

    if (!id in docChannelData[authorId]["videos"][id]) {
      setNotFoundError(true);
      return;
    }
    const videoData = docVidData[id];
    const _author = docChannelData[authorId];

    const _comments = videoData["comments"];
    const sortedComments = Object.values(_comments).sort((a, b) => {
      return b["createdAt"].seconds - a["createdAt"].seconds;
    });
    console.log("sorted", sortedComments);

    const allComments = sortedComments.map((e, i) => {
      console.log(i, e);
      const t = new Date(e["createdAt"].seconds * 1000);
      const commentAuthor = docChannelData[e["author"]];

      return (
        <Toast key={i}>
          <Toast.Header closeButton={false}>
            <Image
              src={commentAuthor["profilePicture"]}
              className="rounded"
              alt="aka"
              width={30}
              height={30}
            />
            <strong className="me-auto" style={{ marginLeft: "3px" }}>
              {commentAuthor["name"]}{" "}
              {e["author"] === authorId ? (
                <Badge bg="primary">Author</Badge>
              ) : (
                <></>
              )}
            </strong>
            <small className="text-muted">{t.toLocaleString("en-US")}</small>
          </Toast.Header>
          <Toast.Body>{e["text"]}</Toast.Body>
        </Toast>
      );
    });
    setComments(allComments);
  };

  const AddNewComment = async () => {
    if (commentText === "") return;
    console.log("Commenting ", commentText);
    const vidDoc = doc(db, "db", "videos");
    const vidSnap = await getDoc(vidDoc);

    const vidData = vidSnap.data();
    const commentsId = new ShortUniqueId({ length: 12 })();
    setLoadingComment(true);
    await setDoc(vidDoc, {
      ...vidData,
      [id]: {
        ...vidData[id],
        comments: {
          [commentsId]: {
            author: idData,
            text: commentText,
            likes: 0,
            dislikes: 0,
            replies: {},
            createdAt: Timestamp.now(),
          },
          ...vidData[id]["comments"],
        },
      },
    });
    setLoadingComment(false);
    setCommentText("");
    FetchComments();
  };

  const CopyDownloadLink = async () => {
    const downloadLink = `${location.protocol}//${location.host}/api/v/${id}`;
    navigator.clipboard.writeText(downloadLink);
  };

  const ConfirmDeleteVideo = () => {
    setDeleteConfirm(!deleteConfirm);
  };

  const DeleteVideo = async () => {
    setDeleting(true);
    const docChannelRef = doc(db, "db", "channels");
    const docChannelSnap = await getDoc(docChannelRef);
    const docChannelData = docChannelSnap.data();

    const docVidRef = doc(db, "db", "videos");
    const docVidSnap = await getDoc(docVidRef);
    const docVidData = docVidSnap.data();

    const authorId = docVidData[id]["author"];

    if (!id in docChannelData[authorId]["videos"][id]) {
      setNotFoundError(true);
      return;
    }
    const videoData = docVidData[id];
    const _author = docChannelData[authorId];

    await updateDoc(docVidRef, {
      [id]: deleteField(),
    });
    await updateDoc(docVidRef, {
      [`${authorId}.videos.${id}`]: deleteField(),
    });
    router.replace("/");
  };

  useEffect(() => {
    if (data !== false) {
      const cookieFromData = JSON.parse(data);
      const user = { ...JSON.parse(cookieFromData["user"]) }[0];
      const id = JSON.parse(cookieFromData["id"]);
      setUserData(user);
      setIdData(id);
      console.log("id == ", id);
    }
    FetchData();
    FetchComments();
  }, []);

  return notFoundError ? (
    <div>
      <Head>
        <title>loading...</title>
      </Head>
      <h1 style={{ color: "red" }}>NO VIDEO WITH ID OF {id} EXISTS!</h1>
    </div>
  ) : !loading ? (
    <>
      <Head>
        <title>{video["title"]}</title>
        <meta property="og:title" content="Sheeptube" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={location.href} />
        <meta
          property="og:description"
          content="Share your videos, posts and many more!"
        />
      </Head>
      <div style={{ marginTop: "10px" }}>
        <ReactPlayer
          url={video["url"]}
          controls
          style={{
            maxWidth: "960px",
            maxHeight: "540px",
            margin: "0 auto",
            display: "block",
            backgroundColor: "black",
          }}
          id="video"
        />
        <hr />
        <h3>{video["title"]}</h3>
        <div style={{ display: "flex" }}>
          <p style={{ marginRight: "10px" }}>by </p>
          <Link href={`${location.origin}/c/${authorId}`}>
            <a style={{ color: "black", display: "flex" }}>
              <Image
                style={{
                  position: "absolute",
                  borderRadius: "50%",
                  float: "left",
                  display: "inline-block",
                }}
                src={author["profilePicture"]}
                alt="image of channel"
                width="40px"
                height="40px"
              />
              <p style={{ marginLeft: "10px" }}>{author["name"]}</p>
            </a>
          </Link>
          <Badge
            bg="danger"
            style={{
              height: "22px",
              marginTop: "3px",
              marginLeft: "10px",
            }}
          >
            Subscribers: {subscribers}
          </Badge>
        </div>
        <br />
        <Button
          onClick={() => CopyDownloadLink()}
          style={{ marginLeft: "10px" }}
        >
          Copy download link
        </Button>
        {data !== false && authorId === idData ? (
          <>
            <Button
              variant="primary"
              onClick={() => ConfirmDeleteVideo()}
              style={{ marginLeft: "10px" }}
            >
              Delete Video
            </Button>
            {deleteConfirm === true ? (
              <Button
                variant="danger"
                style={{ marginLeft: "10px" }}
                onClick={() => DeleteVideo()}
                disabled={deleting}
              >
                Confirm?
              </Button>
            ) : (
              <></>
            )}
          </>
        ) : (
          <></>
        )}
        <h4>Description: </h4>
        <textarea
          readOnly
          rows="10"
          cols="50"
          defaultValue={video["description"]}
        ></textarea>

        <hr />
        <div>
          <h3>Comments</h3>
          <div style={{ marginBottom: "30px" }}>
            <div
              style={{
                marginBottom: "20px",
                float: "left",
                display: "inline-block",
              }}
            >
              {data !== false ? (
                <Image
                  src={userData["photoURL"]}
                  height={50}
                  width={50}
                  style={{
                    position: "absolute",
                    borderRadius: "50%",
                  }}
                />
              ) : (
                <></>
              )}
            </div>

            <input
              type="text"
              style={{
                width: "500px",
                marginRight: "3px",
                marginTop: "10px",
                marginLeft: "5px",
              }}
              maxLength={200}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Enter your comment.."
              disabled={loadingComment}
              value={commentText}
            />
            <Button
              style={{ marginBottom: "5px" }}
              onClick={() => AddNewComment()}
              disabled={data === false || loadingComment}
            >
              Comment
            </Button>
          </div>
          <ToastContainer style={{ height: "300px" }}>
            {comments}
          </ToastContainer>
        </div>
      </div>
    </>
  ) : (
    <>
      <Head>
        <title>Loading...</title>
      </Head>
      loading...
    </>
  );
};

export async function getServerSideProps({ query, res, req }) {
  let data = null;

  console.log("hi, ", ParseCookies(req));
  if (res && ParseCookies(req) !== "") {
    data = JSON.parse(JSON.stringify(ParseCookies(req)));
    console.log(data);
    if (Object.keys(data).length < 2) {
      return {
        props: {
          id: query["id"],
          data: false,
        },
      };
    }
  }

  return {
    props: {
      id: query["id"],
      data: data && JSON.stringify(data),
    },
  };
}

export default Details;
