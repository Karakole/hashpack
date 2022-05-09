import React from 'react';

const ButtonAuthenticate = (props) => {

    /**
     * First step before authentication
     * @returns Promise Http request
     */
    const askPayload = () => {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(props.saveDatas)
        };

        return fetch(process.env.REACT_APP_API_URL + '/askPayload', requestOptions);
    }

    /**
     * Last step authentication
     * @param {} hGraphData 
     * @returns 
     */
    const login = (hGraphData) => {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({...hGraphData, accountId: props.saveDatas.pairedAccounts[0] })
        };

        return fetch(process.env.REACT_APP_API_URL + '/login', requestOptions);
    }

    const authenticate = () => {
        askPayload()
            .then(async (response) => {
                const resJson = await response.json();
                if (!response.ok) return console.log("Error in askPayload => ", resJson);
               
                const originalPayload = resJson.payload;

                const signedPayload = resJson.signedPayload;

                const signature = new Uint8Array(Object.values(signedPayload.signature))
                console.log(typeof signature, signature);

                const authHGraph = await props.hashconnect.authenticate(
                    props.saveDatas.topic, 
                    props.saveDatas.pairedAccounts[0], 
                    signedPayload.serverSigningAccount, 
                    signature , 
                    originalPayload);


                console.log("authHgraph => ", authHGraph);

                if(!authHGraph.success) return console.log("Error while authenticating with HGraph => ", authHGraph )

                login(authHGraph)
                    .then(async logResponse => {
                        const logResJson = await logResponse.json();
                        if (!logResponse.ok) return console.log("Error in login => ", logResJson);
                        console.log(resJson.message);
                        console.log("Athenticate Token => ", resJson.token);

                    })
            })
    }

    return (
        <>
        <button onClick={authenticate} disabled={props.disabled}>Authenticate</button>
        </>
    );
};

export default ButtonAuthenticate;