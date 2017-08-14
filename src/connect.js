import {connect} from 'react-redux';
import compose from 'recompose/compose';
import withState from 'recompose/withState';
import withHandlers from 'recompose/withHandlers';
import isFunction from 'lodash.isfunction';
import {createSelector} from 'reselect';
import serialize from 'form-serialize';

function withWillReceiveProps(willReceiveProps) {
  return BaseComponent => {
    BaseComponent.prototype.componentWillReceiveProps = willReceiveProps;
    return BaseComponent;
  };
}

function defaultShouldResetFormOnProps(props, {state: {isSubmitting, errors}}) {
  return !(isSubmitting || errors);
}

function defineInitialState(fieldNames) {
  return fieldNames.reduce((map, fieldName) => {
    map[fieldName] = '';
    return map;
  }, {});
}

function getInitialState(props, fieldNames, initialState) {
  return {
    ...defineInitialState(fieldNames),
    ...isFunction(initialState) ? initialState(props) : initialState
  };
}

function configureComponentWillReceiveProps(shouldResetFormOnProps, fieldNames, initialState) {
  return function componentWillReceiveProps(nextProps) {
    if (shouldResetFormOnProps(this.props, nextProps)) {
      this.setState({stateValue: getInitialState(nextProps, fieldNames, initialState)});
    }
  };
}

function getValue(target) {
  const type = target.type.toLowerCase();
  const value = target.value;
  if (type === 'checkbox') {
    return target.checked ? value : false;
  }
  return value;
}

function updateField({updateForm}) {
  return ({target}) => {
    const value = getValue(target);
    const {name} = target;
    updateForm(state => ({...state, [name]: value}));
  };
}

function createSubmitFormHandler(onSubmit) {
  return {
    submitForm(props) {
      return event => {
        event.preventDefault();
        onSubmit(props);
      };
    }
  };
}

function withReduxState(formName, actionCreators) {
  const getIsSubmitting = ({forms}) => forms[formName] && forms[formName].isSubmitting;
  const getErrors = ({forms}) => forms[formName] && forms[formName].errors;
  const getFormState = createSelector(
    [getIsSubmitting, getErrors],
    (isSubmitting, errors) => ({isSubmitting, errors})
  );
  return connect(state => ({state: getFormState(state)}), actionCreators);
}

function connectForm(formName, fieldNames, onSubmit, config = {}) {
  const {
    actionCreators = {},
    initialState = {},
    shouldResetFormOnProps = defaultShouldResetFormOnProps,
    handlers = {}
  } = config;

  return compose(
    withReduxState(formName, actionCreators),
    withWillReceiveProps(configureComponentWillReceiveProps(shouldResetFormOnProps, fieldNames, initialState)),
    withState('fields', 'updateForm', props => getInitialState(props, fieldNames, initialState)),
    withHandlers({updateField, ...createSubmitFormHandler(onSubmit), ...handlers})
  );
}

export default connectForm;
