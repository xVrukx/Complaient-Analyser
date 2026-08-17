import { useState } from "react";

const App = () => {
    const [Data, setData] = useState({
        ProductDetails: {},
        ComplaintDetails: {},
        AIAssessment: {},
    });

    const [RawData, setRawData] = useState("");
    const [CID, setCID] = useState(null);
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([]);
    const [file, setFile] = useState(null);

    const getData = async () => {
        if (!RawData.trim() && !file) {
            alert("Please enter a complaint or upload a PDF.");
            return;
        }

        setLoading(true);

        try {
            /*
             * Current backend expects:
             *
             * {
             *    "complaient": "...",
             *    "update": null
             * }
             *
             * For update:
             *
             * {
             *    "complaient": "...",
             *    "update": 15
             * }
             */

            const res = await fetch("https://complaient-analyser-backend.onrender.com", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    complaient: RawData,
                    update: CID,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => null);

                alert(
                    errorData?.error ||
                    "Could not process complaint"
                );

                return;
            }

            const result = await res.json();

            /*
             * Backend response:
             *
             * {
             *    id: 15,
             *    response: {...},
             *    created_at: "...",
             *    updated_at: "..."
             * }
             */

            setCID(result.id);
            setData(result.response);

            setMessages((prev) => [
                ...prev,
                {
                    role: "user",
                    content: RawData,
                },
                {
                    role: "assistant",
                    content: "Complaint processed successfully.",
                },
            ]);

            setRawData("");
            setFile(null);

        } catch (error) {
            console.error(error);
            alert("Could not connect to the backend.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (event) => {
        const selectedFile = event.target.files?.[0];

        if (!selectedFile) {
            return;
        }

        if (selectedFile.type !== "application/pdf") {
            alert("Only PDF files are supported.");
            return;
        }

        setFile(selectedFile);

        /*
         * Your current backend route example accepts JSON.
         * PDF upload requires FormData / multipart handling
         * in the backend.
         *
         * This stores the file in frontend state for now.
         */
    };

    const handleNewComplaint = () => {
        setCID(null);

        setData({
            ProductDetails: {},
            ComplaintDetails: {},
            AIAssessment: {},
        });

        setMessages([]);
        setRawData("");
        setFile(null);
    };

    const renderFields = (section) => {
        if (!section || Object.keys(section).length === 0) {
            return (
                <p className="text-sm text-gray-400">
                    No data available yet.
                </p>
            );
        }

        return Object.entries(section).map(([key, value]) => (
            <div key={key} className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700">
                    {key}
                </label>

                <input
                    type="text"
                    value={
                        value === null ||
                        value === undefined
                            ? ""
                            : String(value)
                    }
                    className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 outline-none"
                    readOnly
                />
            </div>
        ));
    };

    return (
        <div className="min-h-screen w-full bg-gray-200 p-2 sm:p-4 lg:p-6">

            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-auto lg:h-[92vh]">

                {/* LEFT PANEL */}
                <div className="w-full lg:w-[60%] bg-white rounded-2xl shadow-md p-4 sm:p-5 overflow-y-auto">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">

                        <div>
                            <h1 className="text-xl font-semibold">
                                Complaint Details
                            </h1>

                            {CID && (
                                <p className="text-sm text-gray-400 mt-1">
                                    Complaint ID: {CID}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={handleNewComplaint}
                            className="px-4 py-2 text-sm rounded-xl border hover:bg-gray-100 duration-200"
                        >
                            New
                        </button>

                    </div>

                    {/* Product Details */}
                    <section className="mb-6 rounded-xl p-2 sm:p-4">

                        <h2 className="text-lg font-semibold mb-1">
                            Product Details
                        </h2>

                        <p className="mb-4 text-sm text-gray-400">
                            Dynamically extracted product information
                        </p>

                        {renderFields(Data.ProductDetails)}

                    </section>


                    {/* Complaint Details */}
                    <section className="mb-6 rounded-xl p-2 sm:p-4">

                        <h2 className="text-lg font-semibold mb-1">
                            Complaint Details
                        </h2>

                        <p className="mb-4 text-sm text-gray-400">
                            Complaint information
                        </p>

                        {renderFields(Data.ComplaintDetails)}

                    </section>


                    {/* AI Assessment */}
                    <section className="rounded-xl p-2 sm:p-4">

                        <h2 className="text-lg font-semibold mb-1">
                            AI Complaint Assessment
                        </h2>

                        <p className="mb-4 text-sm text-gray-400">
                            AI-generated assessment
                        </p>

                        {renderFields(Data.AIAssessment)}

                    </section>
                            <button
                                onClick={getData}
                                disabled={loading}
                                className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 duration-300 text-white rounded-xl px-5 py-4 sm:px-6"
                            >
                                {loading ? "..." : "Final save"}
                            </button>
                </div>


                {/* RIGHT PANEL */}
                <div className="w-full lg:w-[40%] bg-white rounded-2xl shadow-md flex flex-col min-h-[500px] lg:min-h-0">

                    {/* Chat Header */}
                    <div className="p-4 sm:p-5 border-b">

                        <div className="flex items-center justify-between">

                            <div>
                                <h2 className="text-lg font-semibold">
                                    Wise Check
                                </h2>

                                <p className="text-sm text-gray-400">
                                    AI Complaint Assistant
                                </p>
                            </div>

                            {CID && (
                                <div className="text-xs px-3 py-1 rounded-full bg-gray-100">
                                    ID: {CID}
                                </div>
                            )}

                        </div>

                    </div>


                    {/* Chat */}
                    <section className="flex-1 p-4 sm:p-5 overflow-y-auto">

                        <div className="space-y-4">

                            {messages.length === 0 ? (

                                <div className="h-full min-h-[350px] flex items-center justify-center text-center text-gray-400">

                                    <div>
                                        <p className="text-lg font-medium">
                                            Start a complaint
                                        </p>

                                        <p className="text-sm mt-1">
                                            Enter complaint information below
                                            or upload a PDF.
                                        </p>
                                    </div>

                                </div>

                            ) : (

                                messages.map((message, index) => (

                                    <div
                                        key={index}
                                        className={`flex ${
                                            message.role === "user"
                                                ? "justify-end"
                                                : "justify-start"
                                        }`}
                                    >

                                        <div
                                            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                                                message.role === "user"
                                                    ? "bg-orange-600 text-white"
                                                    : "bg-gray-100 text-gray-800"
                                            }`}
                                        >
                                            {message.content}
                                        </div>

                                    </div>

                                ))

                            )}

                        </div>

                    </section>


                    {/* File + Input */}
                    <section className="p-3 sm:p-4 border-t">

                        {/* File */}
                        <div className="mb-3">

                            <label
                                htmlFor="pdf-upload"
                                className="inline-flex items-center cursor-pointer px-3 py-2 text-sm rounded-xl border hover:bg-gray-100 duration-200"
                            >
                                Upload PDF
                            </label>

                            <input
                                id="pdf-upload"
                                type="file"
                                accept="application/pdf"
                                className="hidden"
                                onChange={handleFileChange}
                            />

                            {file && (
                                <span className="ml-3 text-sm text-gray-500">
                                    {file.name}
                                </span>
                            )}

                        </div>


                        {/* Input */}
                        <div className="flex gap-2 sm:gap-3">

                            <input
                                type="text"
                                placeholder={
                                    CID
                                        ? "Add or correct information..."
                                        : "Describe the complaint..."
                                }
                                value={RawData}
                                onChange={(e) => setRawData(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();

                                        if (!loading) {
                                            getData();
                                        }
                                    }
                                }}
                                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
                            />

                            <button
                                onClick={getData}
                                disabled={loading}
                                className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 duration-300 text-white rounded-xl px-5 sm:px-6"
                            >
                                {loading ? "..." : "Send"}
                            </button>

                        </div>

                    </section>

                </div>

            </div>

        </div>
    );
};

export default App;