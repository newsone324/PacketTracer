import Packet from "./Packet.js";
import PacketType from "./PacketType.js";
import Queue from "./Queue.js";

class Node {
  constructor(name, type, network) {
    this.name = name;
    this.type = type; // "CLIENT" or "SERVER"
    this.connections = [];
    this.network = network;

    this.currSeqNum = Math.floor(Math.random() * 1000);
    this.lastReceivedSeqNum = 0; //tracks last received from peer
    this.sendQueue = new Queue(); //queue for sending packets one by one
    this.isProcessingQueue = false; //flag to prevent simultaneous queue processing

    this.receiveQueue = new Queue();

    //this is so we can send multiple packets at a time
    this.windowSize = 3;    //max packets
    this.inFlight = [];     //packets sent, but not "ACKed"
  }

  addConnection(connection) {
    this.connections.push(connection);
  }

  receive(packet) {
    if (!this.connections) {
      console.log("Warning: this.connections undefined");
      return;
    }

    const time = new Date().toLocaleTimeString();

    console.log(`[${time}] ${this.formatLabel()} <----------${packet.type}(seq=${packet.seqNum}, ack=${packet.ackNum})---------- ${packet.source.type}`);
    this.lastReceivedSeqNum = packet.seqNum;
    this.receiveQueue.enqueue(packet);

    const connection = this.connections.find(c => c.involves(packet.source));
    if (connection) {
      connection.handlePacket(packet, this);
    } else {
      console.log(`[${this.name}] WARNING: No connection to ${packet.source.name}`);
    }

    // --- ACK Handling ----
    if (packet.type === PacketType.DATA) {
      const ackPacket = new Packet(
        this,       //source is me
        packet.source,        //sending it back to the sender
        PacketType.ACK,
        null,
        packet.seqNum + 1
      );

      this.send(ackPacket);
    }

    //When an ACK arrives, remove the packet from inflight
    if (packet.type === PacketType.ACK) {
      console.log(`[${this.name} ACK received for ${packet.ackNum}]`);

      //remove packets
      this.inFlight = this.inFlight.filter(
        p => p.seqNum + 1 !== packet.ackNum
      );
    }
  }

  //sends a packet
  send(packet, network) {
    //if seqNum or ackNum are null, fill them in automatically
    if (packet.seqNum === null) {
      packet.seqNum = this.currSeqNum;
    }

    //for ACK packets, the ackNum should be based on the packet being acknowledged
    if (packet.type === PacketType.ACK && packet.ackNum === null) {
      packet.ackNum = packet.destination.lastReceivedSeqNum + 1;
    }

    const time = new Date().toLocaleTimeString();

    console.log(`[${time}] ${this.formatLabel()} ----------${packet.type}(seq=${packet.seqNum})----------> [${packet.destination.type}]`);
    this.sendQueue.enqueue(packet);
    this.processQueue();

    //increment after sending
    if (packet.type === PacketType.SYN || packet.type === PacketType.SYN_ACK || packet.type === PacketType.ACK || packet.type === PacketType.DATA) {
      this.currSeqNum += 1;
    }
  }

  //This will add a packet to the queue to be sent
  enqueue(packet) {
    this.sendQueue.enqueue(packet);
  }

  //processes the packets in the queue
  processQueue() {
    if (this.isProcessingQueue) return;

    this.isProcessingQueue = true;
    console.log(`[${this.name}] Starting queue processing (${this.sendQueue.size()} packets)`);

    const sendNext = () => {
      if (this.sendQueue.isEmpty()) {
        this.isProcessingQueue = false;
        console.log(`[${this.name}] Queue processing complete`);
        return;
      }

      while (
        !this.sendQueue.isEmpty() &&
        this.inFlight.length < this.windowSize
      ) {

        const packet = this.sendQueue.dequeue();

        console.log(`[${this.name}] TRANSMITTING: ${packet.type} (seq=${packet.seqNum}) to ${packet.destination.name}`);

        this.inFlight.push(packet);
        this.network.sendPacket(packet);
      }

      setTimeout(sendNext, 2000); // delay between packets
    };

    sendNext();
  }

  formatLabel() {
    return this.type === "CLIENT" ? "[CLIENT]" : "[SERVER]";
  }

}

export default Node;
