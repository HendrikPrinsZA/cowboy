<template>
    <div v-if="isConnected">
        <h1>Directories ({{path}})</h1>
        <p>
            Path:
            <a href="#" class="breadcrumb" v-for="breadcrumb in breadcrumbs" :key="breadcrumb.path" @click="navigate(breadcrumb)">
                {{ breadcrumb.name }}
            </a>
        </p>
        <ul>
            <li v-for="directory in directories" :key="directory.name" >
                <a href="#" @click="navigate(directory)">{{ directory.name }}</a>
            </li>
        </ul>
    </div>
    <div v-else>
        Connecting...
    </div>

    <div class="debug-panel">
        <div v-for="(message, idx) in logs" :key="idx">
            <span>{{ message.type }}</span>
            <pre><code>{{ message }}</code></pre>
        </div>
    </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'

export default {
    name: 'App',

    data() {
        return {
            socket: null,
            isConnected: false,
            // path: 'storage/log',
            path: '',
            logs: [],
            directories: []
        }
    },

    computed: {
        breadcrumbs() {
            const thePaths = [{
                name: 'cowboy',
                path: '/'
            }];
            let thePath = '';
            for (const name of this.path.split('/')) {
                thePath = `${thePath}/${name}`;
                thePaths.push({
                    name: `/${name}`,
                    path: thePath
                });
            }
            return thePaths;
        }
    },

    async mounted() {
        this.listen();
    },

    methods: {

        appendLog(type, data) {
            this.logs.unshift({
                type: type,
                data: data
            });
        },

        navigate(breadcrumb) {
            this.path = breadcrumb.path;
            this.listen();
        },

        async listen() {
            const me = this;
            const socketProtocol = (window.location.protocol === 'https:' ? 'wss:' : 'ws:');
            const port = ':3000';
            const echoSocketUrl = socketProtocol + '//' + window.location.hostname + port + '/ws';
        
            if (me.socket !== null) {
                me.socket.close();
            }

            // Define socket and attach it to our data object
            me.socket = await new WebSocket(echoSocketUrl); 

            // When it opens, console log that it has opened. and send a message to the server to let it know we exist
            me.socket.onopen = () => {
                me.isConnected = true;
                const message = {
                    action: 'watch',
                    path: me.path
                };
                me.sendMessage(message);
            }

            // When we receive a message from the server, we can capture it here in the onmessage event.
            me.socket.onmessage = (event) => {
                let response = JSON.parse(event.data);
                me.appendLog('response', response);

                // Allow for simple debug passing
                if (response.debug) {
                    me.appendLog('debug', response);
                }
                
                if (response.message !== undefined) {
                    me.appendLog('message', response.message);
                }

                if (response.success && response.directories) {
                    me.directories = response.directories;
                    me.path = response.path;
                }
            }
        },

        waitForOpenConnection() {
            return new Promise((resolve, reject) => {
                const maxNumberOfAttempts = 10;
                const intervalTime = 200;

                let currentAttempt = 0;
                const interval = setInterval(() => {
                    if (currentAttempt > maxNumberOfAttempts - 1) {
                        clearInterval(interval);
                        reject(new Error('Maximum number of attempts exceeded.'));
                    } else if (this.socket.readyState === this.socket.OPEN) {
                        clearInterval(interval);
                        resolve();
                    }
                    
                    currentAttempt++;
                }, intervalTime);
            })
        },

        async sendMessage(message) {
            message = JSON.stringify(message);
            if (this.socket.readyState !== this.socket.OPEN) {
                try {
                    await this.waitForOpenConnection(this.socket);
                    this.socket.send(message);
                } catch (err) { 
                    console.error(err);
                }
            } else {
                this.socket.send(message)
            }
        }
    }
}

</script>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
}

.debug-panel {
    position: fixed;
    overflow-x: scroll;
    top: 0px;
    bottom: 0px;
    width: 500px;
    height: 100%;
    right: 0px;
}

/* .breadcrumb {
    cursor: pointer;
} */

/* .breadcrumb:after {
    content: "/";
} */
</style>
