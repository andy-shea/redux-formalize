import {createStore, applyMiddleware, compose, combineReducers} from 'redux';
import thunk from 'redux-thunk';
import {formsReducerCreator} from '../src';

export const types = {
  SAVE_FOO: 'SAVE_FOO',
  SAVE_FOO_SUCCESS: 'SAVE_FOO_SUCCESS',
  SAVE_FOO_FAIL: 'SAVE_FOO_FAIL'
};

export const actionCreators = {
  saveFoo({text, radio, checkbox, textarea, select, shouldError}) {
    const formName = 'form';
    return dispatch => {
      const payload = {text, radio, checkbox, textarea, select};
      dispatch({type: types.SAVE_FOO, payload, formName});
      setTimeout(() => {
        if (shouldError) {
          dispatch({type: types.SAVE_FOO_FAIL, payload, errors: {message: 'fubar'}, formName});
        }
        else dispatch({type: types.SAVE_FOO_SUCCESS, payload, response: {foo: 'bar'}, formName});
      }, 2000);
    };
  }
};

const defaultState = {text: null, radio: null, checkbox: null, textarea: null, select: null};
const devToolsEnhancer = window.devToolsExtension ? window.devToolsExtension() : f => f;
function reducer(state = defaultState, action) {
  switch (action.type) {
    case types.SAVE_FOO_SUCCESS: return {...action.payload};
    default: return state;
  }
}
export const store = createStore(combineReducers({
  app: reducer,
  forms: formsReducerCreator()
}), compose(applyMiddleware(thunk), devToolsEnhancer));
