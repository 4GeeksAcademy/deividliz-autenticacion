import React, { useContext, useState } from 'react';
import { EmailContext, PasswordContext } from "/workspaces/deividliz-autenticacion/src/front/pages/userContext.jsx";
import { useNavigate, Link } from 'react-router-dom';

function Login() {
    const back_URL = import.meta.env.VITE_BACKEND_URL;
    const [email, setEmail] = useContext(EmailContext);
    const [password, setPassword] = useContext(PasswordContext);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const submitLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!email || !password) {
            alert("Email y contraseña son requeridos.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${back_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                if (data.access_token) {
                    localStorage.setItem('authToken', data.access_token);
                    console.log('Token guardado en localStorage');
                }
                alert("Login successful!");
                setEmail("");
                setPassword("");
                navigate('/private');
            } else {
                setError(data.message || `Error: ${response.status}`);
                setIsLoading(false);
            }
        } catch (err) {
            console.error("Error en fetch login:", err);
            setError("Error de conexión o respuesta inválida del servidor.");
            setIsLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h3 className="card-title text-center">Iniciar Sesión</h3>
                            {error && <div className="alert alert-danger" role="alert">{error}</div>}
                            <form onSubmit={submitLogin}>
                                <div className="mb-3">
                                    <label htmlFor="login-email" className="form-label">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="login-email"
                                        placeholder="Ingresa tu correo electrónico"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="login-password" className="form-label">Contraseña</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="login-password"
                                        placeholder="Ingresa tu contraseña"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="d-grid">
                                    <button type="submit" className="btn btn-success" disabled={isLoading}>
                                        {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
                                    </button>
                                </div>
                            </form>
                            <div className="text-center mt-3">
                                ¿No tienes cuenta? <Link to="/signup">Regístrate aquí</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
