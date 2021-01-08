import { get, isArray } from 'lodash';
import {RootState} from './store';

export function selectProperty(path, defaultValue = null) {
  let stringPath = path;
  if (isArray(stringPath)) {
    stringPath = stringPath.join('.');
  }
  return (state: RootState) => get(state, stringPath, defaultValue);
}

