/*
The Queue

We need to be able trigger commands from within the container to the client.

Summary of the problem: Commands should be pooled from the clientside to ensure 
the logical flow can be followed. 

Root cause: The issues between different technologies and how they interplay 
with the TTY

Potential benefits
- Hook for interactivity between child/parent

Example of current: 
1. cowboy open test123
  2. cowboy new test123
    3. cowboy open test123

Example of to-be:
1. cowboy open test123
2. cowboy riffle new test123
3. cowboy riffle open test123
4. cowboy riffle 

#### Examples of usage

1. Command line (direct via ./queue.js)
```sh
./queue.js add-clip 'echo "Example one"'
````

2. Node
```js

```

*/

module.exports = class Queue {
  constructor(name) {
    this.name = name;
  }

  append(message) {

    // Get the current value
    console.log({
      fn: 'Queue.append',
      name: this.name,
      message: message,
    });
  }
}

// class Queue {
//   // (i) If we need to group commands (might become applicable, not yet)
//   // addClip() { }

//   append() {
//     const { argv, argv0 } = process;
//     const cleanArgs = argv.slice(2);
  

//   }
// }

// module.exports = Queue;