import Network from "./Network.js";
import Node from "./Node.js";
import Packet from "./Packet.js";
import PacketType from "./PacketType.js";
import Connection from "./Connection.js";

// create network
const network = new Network();

// create nodes
const client = new Node("Client", "CLIENT", network);
const server = new Node("Server", "SERVER", network);

// register nodes (if you have this method)
network.registerNode(client);
network.registerNode(server);

// create connection
const connection = new Connection(client, server, network);

console.log("[SIMULATION] Starting TCP-like handshake simulation");
console.log(`[SIMULATION] Nodes: ${client.name} (${client.type}) ↔ ${server.name} (${server.type})`);

// Start the handshake
connection.startHandshake();

// Wait a bit then send data
setTimeout(() => {
    console.log("[SIMULATION] Handshake complete, sending data packets");
    for (let i = 0; i < 3; i++) {
        const packet = new Packet(
            client,
            server,
            PacketType.DATA,
            null, // let Node fill seqNum
            null
        );

        client.send(packet);
    }
}, 10000); // after handshake completes
