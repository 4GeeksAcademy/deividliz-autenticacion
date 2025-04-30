import React, { createContext, useState } from 'react';

export const EmailContext = createContext();
export const PasswordContext = createContext()

export const UserContextProvider = ({ children }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("")

    return (
        <EmailContext.Provider value={[email, setEmail]}>
            <PasswordContext.Provider value={[password, setPassword]}>
                {children}
            </PasswordContext.Provider>
        </EmailContext.Provider>
    );
};