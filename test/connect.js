import 'jsdom-global/register';
import test from 'tape';
import React from 'react';
import {Provider} from 'react-redux';
import configureStore from 'redux-mock-store';
import {mount} from 'enzyme';
import jsdom from 'jsdom';
import toClass from 'recompose/toClass';
import {connectForm} from '../src';

const {JSDOM} = jsdom;
const mockStore = configureStore();

function renderForm(store, Form, props = {}) {
  mount(<Provider store={store}><Form {...props}/></Provider>);
}

test('form state and functions to manage form are passed through as props', t => {
  const Form = props => {
    t.equal(Object.keys(props).length, 5, 'prop count is correct');
    t.equal(typeof props.state, 'object', 'state exists');
    t.ok(props.state.hasOwnProperty('isSubmitting'), 'isSubmitting exists');
    t.equal(typeof props.state.isSubmitting, 'undefined', 'isSubmitting is undefined');
    t.ok(props.state.hasOwnProperty('errors'), 'errors exists');
    t.equal(typeof props.state.errors, 'undefined', 'errors is undefined');
    t.equal(Object.keys(props.fields).length, 2, 'there are only two fields');
    t.equal(props.fields.foo, '', 'foo exists and is empty string');
    t.equal(props.fields.bar, '', 'bar exists and is empty string');
    t.equal(typeof props.updateForm, 'function', 'updateForm handler exists');
    t.equal(typeof props.updateField, 'function', 'updateField handler exists');
    t.equal(typeof props.submitForm, 'function', 'submitForm handler exists');
    return <form/>;
  };
  const ConnectedForm = connectForm('form', ['foo', 'bar'], () => {})(Form);
  const store = mockStore({forms: {}});
  renderForm(store, ConnectedForm);
  t.end();
});

test('form fields are initialised as empty strings', t => {
  const Form = props => {
    t.equal(props.fields.foo, '', 'foo exists and is empty string');
    t.equal(props.fields.bar, '', 'bar exists and is empty string');
    return <form/>;
  };
  const ConnectedForm = connectForm('form', ['foo', 'bar'], () => {})(Form);
  const store = mockStore({forms: {}});
  renderForm(store, ConnectedForm);
  t.end();
});

test('custom handlers are passed through as props', t => {
  const Form = props => {
    t.equal(typeof props.handler, 'function', 'custom handler exists');
    props.handler();
    return <form/>;
  };
  const handler = () => () => t.pass('handler is run');
  const ConnectedForm = connectForm('form', ['foo', 'bar'], () => {}, {handlers: {handler}})(Form);
  const store = mockStore({forms: {}});
  renderForm(store, ConnectedForm);
  t.end();
});

test('action creators are passed through as props and wrapped by dispatch', t => {
  const Form = props => {
    t.equal(typeof props.action, 'function', 'custom handler exists');
    props.action();
    return <form/>;
  };
  const action = {type: 'FOO'};
  const actionCreators = {
    action: () => action
  };
  const ConnectedForm = connectForm('form', ['foo', 'bar'], () => {}, {actionCreators})(Form);
  const store = mockStore({forms: {}});
  renderForm(store, ConnectedForm);
  const actions = store.getActions();
  t.equal(actions.length, 1, 'one action is dispatched');
  t.equal(actions[0], action, 'correct action is dispatched');
  t.end();
});

test('form field initialisation can be overriden', t => {
  const Form = props => {
    t.equal(props.fields.foo, 'baz', 'foo is initialised correctly');
    t.equal(props.fields.bar, 'qux', 'bar is initialised correctly');
    return <form/>;
  };
  const initialState = {foo: 'baz', bar: 'qux'};
  const ConnectedForm = connectForm('form', ['foo', 'bar'], () => {}, {initialState})(Form);
  const store = mockStore({forms: {}});
  renderForm(store, ConnectedForm);
  t.end();
});

test('form field initialisation can be overriden with a function that is passed props', t => {
  const Form = props => {
    t.equal(props.fields.foo, 'baz', 'foo is initialised correctly');
    t.equal(props.fields.bar, 'qux', 'bar is initialised correctly');
    return <form/>;
  };
  const initialState = props => {
    t.equal(props.test, 'prop', 'test prop exists and has correct value');
    return {foo: 'baz', bar: 'qux'};
  };
  const ConnectedForm = connectForm('form', ['foo', 'bar'], () => {}, {initialState})(Form);
  const store = mockStore({forms: {}});
  renderForm(store, ConnectedForm, {test: 'prop'});
  t.end();
});

test('provided updateForm handler updates form state', t => {
  const Form = toClass(props => <form/>);
  const ConnectedForm = connectForm('form', ['foo', 'bar'], () => {})(Form);
  const store = mockStore({forms: {}});
  const wrapper = mount(<ConnectedForm/>, {context: {store}});
  const props = wrapper.find(Form).props();
  t.equal(props.fields.foo, '', 'foo is initialised as empty string');
  t.equal(props.fields.bar, '', 'bar is initialised as empty string');
  props.updateForm(state => ({...state, foo: 'baz'}));
  wrapper.update();
  const newProps = wrapper.find(Form).props();
  t.equal(newProps.fields.foo, 'baz', 'foo is updated to baz');
  t.equal(newProps.fields.bar, '', 'bar is still empty string');
  t.end();
});

test('form resets on prop change by default unless is submitting or has errors', t => {
  const Form = toClass(props => <form/>);
  const ConnectedForm = connectForm('form', ['foo', 'bar'], () => {})(Form);
  let state = {forms: {}};
  const getState = () => state;
  const store = mockStore(getState);
  const wrapper = mount(<ConnectedForm/>, {context: {store}});
  wrapper.find(Form).props().updateForm(state => ({...state, foo: 'baz'}));
  wrapper.update();
  wrapper.setProps({baz: 'qux'});
  const props = wrapper.find(Form).props();
  t.equal(props.fields.foo, '', 'foo is reset to empty string');
  t.equal(props.fields.bar, '', 'bar is reset to as empty string');
  props.updateForm(state => ({...state, foo: 'baz'}));
  state = {forms: {form: {isSubmitting: true}}};
  store.dispatch({type: 'FOO'});
  wrapper.update();
  t.equal(wrapper.find(Form).props().fields.foo, 'baz', 'foo is still baz');
  state = {forms: {form: {errors: {message: 'fubar'}}}};
  store.dispatch({type: 'FOO'});
  wrapper.update();
  t.equal(wrapper.find(Form).props().fields.foo, 'baz', 'foo is still baz');
  t.end();
});

test('form reset behaviour can be overriden', t => {
  const Form = toClass(props => <form/>);
  const shouldResetFormOnProps = (props, {reset}) => reset;
  const ConnectedForm = connectForm('form', ['foo', 'bar'], () => {}, {shouldResetFormOnProps})(Form);
  let state = {forms: {}};
  const getState = () => state;
  const store = mockStore(getState);
  const wrapper = mount(<ConnectedForm/>, {context: {store}});
  const formWapper = wrapper.find(Form);
  wrapper.find(Form).props().updateForm(state => ({...state, foo: 'baz'}));
  wrapper.setProps({baz: 'qux'});
  wrapper.update();
  t.equal(wrapper.find(Form).props().fields.foo, 'baz', 'foo is still baz');
  state = {forms: {form: {isSubmitting: true}}};
  store.dispatch({type: 'FOO'});
  wrapper.update();
  t.equal(wrapper.find(Form).props().fields.foo, 'baz', 'foo is still baz');
  wrapper.setProps({reset: true});
  t.equal(wrapper.find(Form).props().fields.foo, '', 'foo is reset to empty string');
  t.end();
});

test('updateField saves controlled input changes to state', t => {
  const Form = toClass(({fields: {foo}, updateField}) => (
    <form onChange={updateField}>
      <input type="text" name="foo" value={foo}/>
    </form>
  ));
  const ConnectedForm = connectForm('form', ['foo'], () => {})(Form);
  const store = mockStore({forms: {}});
  global.document.body.appendChild(JSDOM.fragment('<div id="app"/>'));
  const wrapper = mount(<ConnectedForm/>, {context: {store}, attachTo: global.document.getElementById('app')});
  const inputWapper = wrapper.find('input');
  inputWapper.instance().value = 'baz';
  inputWapper.simulate('change');
  t.equal(wrapper.find(Form).props().fields.foo, 'baz', 'foo is baz');
  t.end();
});

test('updateField saves controlled checkbox changes to state', t => {
  const Form = toClass(({fields: {foo}, updateField}) => (
    <form onChange={updateField}>
      <input name="foo" type="checkbox" value="checkbox" checked={foo}/>
    </form>
  ));
  const ConnectedForm = connectForm('form', ['foo'], () => {})(Form);
  const store = mockStore({forms: {}});
  global.document.body.appendChild(JSDOM.fragment('<div id="app"/>'));
  const wrapper = mount(<ConnectedForm/>, {context: {store}, attachTo: global.document.getElementById('app')});
  t.equal(wrapper.find(Form).props().fields.foo, '', 'foo is initialised to empty string');
  const inputWapper = wrapper.find('input');
  inputWapper.instance().checked = true;
  inputWapper.simulate('change');
  t.equal(wrapper.find(Form).props().fields.foo, 'checkbox', 'foo is checked');
  inputWapper.instance().checked = false;
  inputWapper.simulate('change');
  t.equal(wrapper.find(Form).props().fields.foo, false, 'foo is unchecked');
  t.end();
});

test('submitForm is called with props when form is submitted', t => {
  const Form = toClass(({submitForm}) => <form onSubmit={submitForm}/>);
  const onSubmit = props => {
    t.pass('submitForm is called');
    t.equal(Object.keys(props.fields).length, 2, 'there are only two fields');
    t.equal(props.fields.foo, '', 'foo exists and is empty string');
    t.equal(props.fields.bar, '', 'bar exists and is empty string');
  };
  const ConnectedForm = connectForm('form', ['foo', 'bar'], onSubmit)(Form);
  const store = mockStore({forms: {}});
  global.document.body.appendChild(JSDOM.fragment('<div id="app"/>'));
  const wrapper = mount(<ConnectedForm/>, {context: {store}, attachTo: global.document.getElementById('app')});
  const formWapper = wrapper.find(Form);
  formWapper.simulate('submit');
  t.end();
});

test('default event handling is prevented when submitting', t => {
  const Form = toClass(({submitForm}) => <form onSubmit={submitForm}/>);
  const ConnectedForm = connectForm('form', ['foo', 'bar'], () => {})(Form);
  const store = mockStore({forms: {}});
  global.document.body.appendChild(JSDOM.fragment('<div id="app"/>'));
  const wrapper = mount(<ConnectedForm/>, {context: {store}, attachTo: global.document.getElementById('app')});
  const formWapper = wrapper.find(Form);
  formWapper.simulate('submit', {
    preventDefault() {
      t.pass('preventDefault is called');
    }
  });
  t.end();
});
