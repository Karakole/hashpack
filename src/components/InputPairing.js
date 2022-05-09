import React, { useState } from 'react';

const InputPairing = (props) => {

    const [copied, setCopied] = useState(false)

    const copyToClipboard = () => {
        navigator.clipboard.writeText(props.pairingString);
        setCopied(true);
    }

    return (
        <>
        <h4>Pairing String</h4>
        <input type='text' value={props.pairingString} readOnly />
        <button onClick={copyToClipboard}>Copy to clipboard</button>
        {copied && <p>Successfully copied !</p>}
        </>
    );
};

export default InputPairing;