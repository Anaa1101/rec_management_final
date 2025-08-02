import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [hover, setHover] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage("Logging in...");

  try {
    const response = await fetch("http://localhost:5117/api/auth/login", { // adjust port
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      setMessage("Invalid Credentials");
      return;
    }

    const data = await response.json();

    // ✅ Check designation from backend
    if (data.designation === "Manager") {
      navigate("/manager");
    } else if (data.designation === "HR") {
      navigate("/hr");
    }
    else if (data.designation === "SuperAdmin" ) {
  setMessage("Login Successful!");
  navigate("/superuser");
    }

     else {
      setMessage("Unknown designation. Contact admin.");
    }
  } catch (error) {
    console.error("Login error:", error);
    setMessage("Server error. Please try again later.");
  }
};



  return (
    <div style={styles.page}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <h2 style={styles.brand}>ANAGHAA_MANVITHA.CO</h2>
        <button
          style={{
            ...styles.applyButton,
            ...(hover ? styles.applyButtonHover : {}),
          }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onClick={() => navigate("/joblist")} 
        >
          APPLY FOR JOBS
        </button>
      </nav>

      {/* Main Content */}
      <div style={styles.main}>
        {/* Left Side: Login + Description */}
        <div style={styles.leftContent}>
          <h1 style={{ color: colors.textDark, fontWeight: "500" }}>
            We Are Cool
          </h1>
          <p
            style={{
              color: colors.textDark,
              maxWidth: "400px",
              marginBottom: "30px",
            }}
          >
            At Cool, we help businesses grow through innovation and creativity.
            Join our team to explore limitless opportunities and shape the
            future with us.
          </p>
          <div style={styles.card}>
            <h2 style={{ color: colors.primary, marginBottom: "20px" }}>Login</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <input
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />
              <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                required
              />
              <button type="submit" style={styles.button}>
                Login
              </button>
            </form>
            {message && (
              <p style={{ marginTop: "15px", color: colors.textGray }}>
                {message}
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Zigzag Collage Images */}
        <div style={styles.rightContent}>
          <img
            src="https://i.pinimg.com/736x/ba/73/65/ba73659f5f0652bf502daf8f32cc3b95.jpg"
            alt="office"
            style={styles.imageTop}
          />
          <img
            src="https://i.pinimg.com/736x/cf/f5/e1/cff5e1cba8964bcaeaee87cf0eaecb59.jpg"
            alt="business"
            style={styles.imageMiddle}
          />
          <img
            src="https://i.pinimg.com/1200x/98/97/e0/9897e09d9e65a1c1560c1a1c17dc1708.jpg"
            alt="tech"
            style={styles.imageBottom}
          />
        </div>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        © 2025 Cool | All Rights Reserved
      </footer>
    </div>
  );
}

// 🎨 Color Palette
const colors = {
  primary: "#4e8ef7",      // Main blue
  primaryLight: "#e6f0ff", // Light blue for cards/backgrounds
  accentGreen: "#4caf50",  // For success states
  accentYellow: "#fdd835", // For warning states
  textDark: "#1a1a1a",     // Darker text
  textGray: "#555555",     // Subtext
  inputBg: "#ffffff",      // Input background
  buttonHover: "#3c75d6",  // Slightly darker blue for hover
};

// 💠 Styles
const styles = {
  page: {
    minHeight: "100vh",
    background: `linear-gradient(135deg, ${colors.primaryLight}, #c2e9fb)`,
    display: "flex",
    flexDirection: "column",
  },
  navbar: {
    width: "100%",
    padding: "15px 40px",
    background: "rgba(20, 20, 30, 0.85)", // unchanged
    backdropFilter: "blur(10px)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  brand: {
    color: "#f0f0f0",
    letterSpacing: "1px",
    fontWeight: "600",
  },
  applyButton: {
    color: "#ffffff",
    backgroundColor: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.3)",
    padding: "8px 20px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "500",
    transition: "0.3s",
    marginRight: "50px",
  },
  applyButtonHover: {
    backgroundColor: "rgba(255,255,255,0.2)",
    transform: "scale(1.05)",
  },
  main: {
    display: "flex",
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: "40px 80px",
    color: colors.textDark,
  },
  leftContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  rightContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "40px",
    position: "relative",
  },

  // Zigzag Images
  imageTop: {
    width: "280px",
    height: "220px",
    objectFit: "cover",
    borderRadius: "16px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    alignSelf: "flex-end",
  },
  imageMiddle: {
    width: "280px",
    height: "220px",
    objectFit: "cover",
    borderRadius: "16px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    alignSelf: "flex-start",
    marginLeft: "-80px",
  },
  imageBottom: {
    width: "280px",
    height: "220px",
    objectFit: "cover",
    borderRadius: "16px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    alignSelf: "flex-end",
  },

  // Card
  card: {
    background: colors.primaryLight,
    padding: "30px",
    borderRadius: "20px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    textAlign: "center",
    width: "320px",
    backdropFilter: "blur(8px)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    margin: "10px 0",
    padding: "12px",
    fontSize: "16px",
    borderRadius: "10px",
    border: `1px solid ${colors.primary}`,
    outline: "none",
    backgroundColor: colors.inputBg,
  },
  button: {
    padding: "12px",
    fontSize: "16px",
    backgroundColor: colors.primary,
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    marginTop: "10px",
    transition: "0.3s",
  },
  buttonHover: {
    backgroundColor: colors.buttonHover,
  },

  footer: {
    textAlign: "center",
    padding: "15px",
    backgroundColor: "rgba(0, 0, 0, 0.79)",
    color: "#dbd3d3ff",
  },
};

export default LoginPage;
