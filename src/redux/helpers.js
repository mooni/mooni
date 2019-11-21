import { get, isArray } from 'lodash';

export function createReducer(initialState, handlers) {
  return function reducer(state = initialState, action = {} ) {
    if (action.type in handlers) {
      return handlers[action.type](state, action);
    }
    return state;
  };
}

export function selectProperty(path, defaultValue = null) {
  let stringPath = path;
  if (isArray(stringPath)) {
    stringPath = stringPath.join('.');
  }
  return state => get(state, stringPath, defaultValue);
}

