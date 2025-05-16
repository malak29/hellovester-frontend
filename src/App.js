import React, { useState } from "react";
import axios from "axios";
import ReactFlow from "react-flow-renderer"; // Import ReactFlow library for flowcharts
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [output, setoutput] = useState([]);

  const handleSend = async () => {
    if (input.trim() === "") return;

    // Add user's message to the chat
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    try {
      // Make API request to your backend
      const response = await axios.post("http://localhost:8000/get_response/", {
        query: input,
      });

      // Check if response contains steps
      const steps = response.data.steps || [];
      const assistantMessages = steps.length
        ? [{ role: "assistant", content: "Here is the flowchart for your steps:" }]
        : [{ role: "assistant", content: response.data.results[0].content.substring(0, 100) + "..." }];

      // If steps are present, create a flowchart
      if (steps.length > 0) {
        const newNodes = steps.map((step, index) => ({
          id: `step-${index}`,
          type: "default",
          data: { label: step },
          position: { x: 250, y: 100 * index }, // Position each node
        }));
      
        const newEdges = steps.slice(1).map((_, index) => ({
          id: `edge-${index}`,
          source: `step-${index}`,
          target: `step-${index + 1}`,
          type: "smoothstep",
        }));
      
        setNodes(newNodes);
        setEdges(newEdges);
      }
      // Add assistant's response to the chat
      setMessages([...newMessages, ...assistantMessages]);

    } catch (error) {
      console.error("Error fetching response from API:", error);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        <div className="messages-container">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.role === "user" ? "user-message" : "assistant-message"}`}
            >
              <p>{message.content}</p>
            </div>
          ))}
        </div>
      </div>
            {/* Show flowchart if available */}
            {nodes.length >0 && (
        <div className="flowchart-container">
          <ReactFlow 
            nodes={nodes} 
            edges={edges} 
            fitView 
            style={{ width: "100%", height: "100%" }} 
          />
        </div>
      )}

      <div className="input-container">
        <input
          type="text"
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
        />
        <button className="send-button" onClick={handleSend}>Send</button>
      </div>


    </div>
  );
}

const CustomNode = ({ data }) => {
  return (
    <div style={{ padding: "10px", border: "1px solid black", borderRadius: "5px" }}>
      <p>{data.label}</p>
    </div>
  );
};

export default App;