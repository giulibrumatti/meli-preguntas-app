import axios from "axios";
import { useEffect, useState } from "react";

const CLIENT_ID = "TU_CLIENT_ID";
const REDIRECT_URI = "http://localhost:3000"; // o tu dominio real
const AUTH_URL = `https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`;

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [questions, setQuestions] = useState([]);

  // Cuando vuelve Mercado Libre con el ?code
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code && !accessToken) {
      // Obtener el token desde tu backend
      axios
        .post(`http://localhost:8080/meli/token?code=${code}`)
        .then((res) => {
          const token = res.data;
          setAccessToken(token);
          window.history.replaceState({}, "", "/"); // Limpia la URL
        })
        .catch((err) => console.error("Error al obtener token", err));
    }
  }, [accessToken]);

  const handleLogin = () => {
    window.location.href = AUTH_URL;
  };

  const fetchQuestions = () => {
    if (!accessToken) return;

    axios
      .get(`http://localhost:8080/meli/questions?accessToken=${accessToken}`)
      .then((res) => {
        setQuestions(res.data);
      })
      .catch((err) => console.error("Error al obtener preguntas", err));
  };

  const handleAnswer = (questionId) => {
    const text = prompt("Escribí tu respuesta:");

    if (text && accessToken) {
      axios.post(
        `http://localhost:8080/meli/answer?accessToken=${accessToken}&questionId=${questionId}&text=${encodeURIComponent(
          text
        )}`
      );
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Mercado Libre - Bot de Preguntas</h1>
      {!accessToken ? (
        <button onClick={handleLogin}>Conectar con Mercado Libre</button>
      ) : (
        <>
          <button onClick={fetchQuestions}>Ver preguntas</button>
          <ul>
            {questions.map((q) => (
              <li key={q.id}>
                <strong>{q.text}</strong> (Item: {q.item_id}){" "}
                <button onClick={() => handleAnswer(q.id)}>Responder</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;
