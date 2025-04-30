import React, { useContext } from 'react';
import { EmailContext, PasswordContext } from "/workspaces/deividliz-autenticacion/src/front/pages/userContext.jsx";
function Signup() {
const back_URL =  import.meta.env.VITE_BACKEND_URL
  const [email, setEmail] = useContext(EmailContext);
  const [password, setPassword] = useContext(PasswordContext);

  const submitSignup = async(e) => {
      e.preventDefault()

      if (!email || !password) { // Validamos que los campos no estén vacíos
          alert("Email and password are required!");
          return;
      }

      const response = await fetch(`${back_URL}/api/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      if (response.ok) {
        alert("User registered successfully!")
        setEmail("")
        setPassword("")
      }
    }
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h3 className="card-title text-center">Registro</h3>
              <form onSubmit={submitSignup}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Correo Electrónico</label>
                  <input type="email" className="form-control" id="email" placeholder="Ingresa tu correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Contraseña</label>
                  <input type="password" className="form-control" id="password" placeholder="Ingresa tu contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                </div>
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary">Registrarse</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Signup;