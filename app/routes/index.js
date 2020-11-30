import Route from '@ember/routing/route';

export default class IndexRoute extends Route {
  model() {
    return {
      'bus_a': {
        'load': 32,
      },
      'bus_b': {
        'load': 79,
      }
    };
  }
}
