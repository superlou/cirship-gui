import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class ValueBarComponent extends Component {
  get markerStyle() {
    let value = (this.args.value - this.args.min) / (this.args.max - this.args.min) * 100;
    value = Math.max(0, Math.min(value, 100));
    let style = "left:" + value + "%";
    return Ember.String.htmlSafe(style);
  }
}
