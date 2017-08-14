import test from 'tape';
import {formsReducerCreator} from '../src';

test('state defaults to empty object', t => {
  const reducer = formsReducerCreator();
  const newState = reducer();
  t.equal(newState.constructor, Object, 'state is an object');
  t.equal(Object.keys(newState).length, 0, 'state is empty');
  t.end();
});

test('non-form action is ignored', t => {
  const reducer = formsReducerCreator();
  const state = {};
  const newState = reducer(state, {type: 'FOO'});
  t.equal(state, newState, 'state is unchanged');
  t.end();
});

test('submit form action is reduced correctly', t => {
  const reducer = formsReducerCreator();
  const state = reducer({}, {type: 'FOO', formName: 'foo'});
  t.equal(typeof state.foo, 'object', 'form state exists');
  t.equal(Object.keys(state.foo).length, 2, 'contains two props');
  t.equal(state.foo.isSubmitting, true, 'isSubmitting is true');
  t.equal(state.foo.errors, undefined, 'errors is undefined');
  t.end();
});

test('submit form success action is reduced correctly', t => {
  const reducer = formsReducerCreator();
  const state = reducer({}, {type: 'FOO_SUCCESS', formName: 'foo'});
  t.equal(typeof state.foo, 'object', 'form state exists');
  t.equal(Object.keys(state.foo).length, 2, 'contains two props');
  t.equal(state.foo.isSubmitting, false, 'isSubmitting is false');
  t.equal(state.foo.errors, undefined, 'errors is undefined');
  t.end();
});

test('submit form fail action is reduced correctly', t => {
  const reducer = formsReducerCreator();
  const errors = {message: 'error'};
  const state = reducer({}, {type: 'FOO_FAIL', formName: 'foo', errors});
  t.equal(typeof state.foo, 'object', 'form state exists');
  t.equal(Object.keys(state.foo).length, 2, 'contains two props');
  t.equal(state.foo.isSubmitting, false, 'isSubmitting is false');
  t.equal(state.foo.errors, errors, 'correct errors object is present');
  t.end();
});

test('success action test can be overriden', t => {
  const reducer = formsReducerCreator({successMatch: /_BAZ$/});
  const state = {};
  let newState = reducer({}, {type: 'FOO_SUCCESS', formName: 'foo'});
  t.equal(newState.foo.isSubmitting, true, 'original success type is now treated as a new form submit');
  newState = reducer({}, {type: 'FOO_BAZ', formName: 'foo'});
  t.equal(newState.foo.isSubmitting, false, 'isSubmitting is false');
  t.equal(newState.foo.errors, undefined, 'errors is undefined');
  t.end();
});

test('fail action test can be overriden', t => {
  const reducer = formsReducerCreator({failMatch: /_QUX$/});
  const state = {};
  const errors = {message: 'error'};
  let newState = reducer({}, {type: 'FOO_FAIL', formName: 'foo', errors});
  t.equal(newState.foo.isSubmitting, true, 'original fail type is now treated as a new form submit');
  newState = reducer({}, {type: 'FOO_QUX', formName: 'foo', errors});
  t.equal(newState.foo.isSubmitting, false, 'isSubmitting is false');
  t.equal(newState.foo.errors, errors, 'correct errors object is present');
  t.end();
});
