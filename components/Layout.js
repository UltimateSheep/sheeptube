import { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { ParseCookies } from "../pages/cookies";
import styles from "../styles/Home.module.css";
import { firestoreData } from "./firestoreData";
import { useRouter } from "next/router";
import { useCookies } from "react-cookie";
import { NavDropdown, OverlayTrigger, Tooltip } from "react-bootstrap";

const Layout = ({ children }) => {
  const router = useRouter();
  const [idValue, setId] = useState("");
  const [idCookies, setIdCookies] = useCookies(["id"]);
  const [token, setToken] = useCookies(["token"]);
  const [user, setUser] = useCookies(["user"]);

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

  const CheckId = () => {
    const { id } = idCookies;
    setId(id);
    console.log(id);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      CheckId();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.container}>
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand href="/">SheepTube</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip id={`tooltip`}>
                    if this button doesn't update for you, try refresh the
                    page.
                  </Tooltip>
                }
              >
                {idValue !== undefined ? (
                  <Nav.Link href={`/c/${idValue}`}>My Channel</Nav.Link>
                ) : (
                  <Nav.Link href={`/login`}>Login</Nav.Link>
                )}
              </OverlayTrigger>
              <NavDropdown title="Make Content" id="basic-nav-dropdown">
                <NavDropdown.Item
                  href="/upload"
                  disabled={idValue === undefined}
                >
                  Upload new video
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="/post" disabled>
                  Make new post
                </NavDropdown.Item>
              </NavDropdown>
              <div className="d-flex">
                <Nav.Link href="/settings" className="me-2">
                  Settings
                </Nav.Link>
              </div>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {children}
    </div>
  );
};

export default Layout;
