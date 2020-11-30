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
    const socket = this.websockets.socketFor('ws://localhost:8765/');
    console.log(socket);
    socket.on('open', this.openHandler, this);
    socket.on('message', this.messageHandler, this);
    socket.on('close', this.closeHandler, this);

    this.socketRef = socket;
  }

  openHandler(event) {
    console.log(`Websocket opened: ${event}`);
  }

  messageHandler(event) {
    this.simState = JSON.parse(event.data).data;
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
