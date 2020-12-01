import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { later } from '@ember/runloop';
import { action } from '@ember/object';

export default class SimConnService extends Service {
  @service websockets;
  @tracked simState;
  socketRef = null;

  constructor() {
    super(...arguments);
    this.simState = {};
    const socket = this.websockets.socketFor('ws://localhost:8765/');
    socket.on('open', this.openHandler, this);
    socket.on('message', this.messageHandler, this);
    socket.on('close', this.closeHandler, this);

    this.socketRef = socket;
  }

  openHandler(event) {
    console.log(`Websocket opened: ${event}`);

    let msg = {
      type: 'watch',
      real: ['b1.currentSensor.i'],
      bool: ['b1.isOpen'],
    }
    this.socketRef.send(JSON.stringify(msg));
  }

  messageHandler(event) {
    let data = JSON.parse(event.data).data;
    if (data === undefined) {
      return;
    }

    const refs = Object.keys(data);

    let obj = {};

    refs.forEach((ref, index) => {
      this.addRef(obj, ref, data[ref]);
    });

    this.simState = obj;
  }

  addRef(obj, ref, value) {
    let tokens = ref.split('.');

    let currentObj = obj;
    let last_token = tokens.pop();

    tokens.forEach((token) => {
      if (!(token in currentObj)) {
        currentObj[token] = {};
      }
      currentObj = currentObj[token]
    });

    currentObj[last_token] = value;
  }


  closeHandler(event) {
    const socket = this.websockets.socketFor('ws://localhost:8765');
    later(this, () => {
      socket.reconnect();
    }, 1000);

    console.log(`Websocket closed: ${event}`);
  }

  @action
  pulseBool(ref, value) {
    let msg = {
      type: 'set',
      ref: ref,
      value: value
    };

    this.socketRef.send(JSON.stringify(msg));
    msg.value = !value;

    later(this, () => {
      this.socketRef.send(JSON.stringify(msg));
    }, 200);
  }
}
