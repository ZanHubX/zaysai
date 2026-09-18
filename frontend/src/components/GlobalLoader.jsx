import { useEffect, useState } from "react";
import "./GlobalLoader.css";

function GlobalLoader() {
    const [loading, setLoading] = useState(false);
    const [activeRequests, setActiveRequests] = useState(0);

    useEffect(() => {
        const handleStart = () => {
            setActiveRequests((count) => count + 1);
        };

        const handleStop = () => {
            setActiveRequests((count) =>
                Math.max(0, count - 1)
            );
        };

        window.addEventListener(
            "zaysai:loading:start",
            handleStart
        );

        window.addEventListener(
            "zaysai:loading:stop",
            handleStop
        );

        return () => {
            window.removeEventListener(
                "zaysai:loading:start",
                handleStart
            );

            window.removeEventListener(
                "zaysai:loading:stop",
                handleStop
            );
        };
    }, []);

    useEffect(() => {
        setLoading(activeRequests > 0);
    }, [activeRequests]);

    if (!loading) {
        return null;
    }

    return (
        <div className="global-loader">

            <div className="global-loader-content">

                <div className="global-loader-logo-wrap">

                    <div className="global-loader-ring"></div>

                    <img
                        src="/zaysai-logo.png"
                        alt="ZaySai"
                        className="global-loader-logo"
                    />

                </div>

                <div className="global-loader-text">

                    <strong>
                        Loading
                    </strong>

                    <span>
                        Please wait
                        <i></i>
                        <i></i>
                        <i></i>
                    </span>

                </div>

            </div>

        </div>
    );
}

export default GlobalLoader;