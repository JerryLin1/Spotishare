import React, { useState, useEffect, createContext } from "react";
import Client from "../client";

export const ClientContext = React.createContext({ client: null });

export const ClientProvider = ({ children }) => {
    const [client, setClient] = useState(new Client())

    return (
        <ClientContext.Provider value={client}>{children}</ClientContext.Provider>
    )
}