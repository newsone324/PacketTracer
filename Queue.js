/**
 * Simple Queue implementation for managing packets
 */
class Queue {
    constructor() {
        this.items = [];
    }

    // Add item to end of queue
    enqueue(item) {
        this.items.push(item);
    }

    // Remove and return item from front of queue
    dequeue() {
        if (this.isEmpty()) {
            return undefined;
        }
        return this.items.shift();
    }

    // View item at front without removing
    peek() {
        if (this.isEmpty()) {
            return undefined;
        }
        return this.items[0];
    }

    // Check if queue is empty
    isEmpty() {
        return this.items.length === 0;
    }

    // Get queue size
    size() {
        return this.items.length;
    }

    // Clear the queue
    clear() {
        this.items = [];
    }

    // Get all items
    getAll() {
        return [...this.items];
    }
}

export default Queue;
