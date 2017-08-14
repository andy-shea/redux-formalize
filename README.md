# Redux Formalize

[![Build Status](https://travis-ci.org/andy-shea/redux-formalize.svg?branch=master)](https://travis-ci.org/andy-shea/redux-formalize)
[![Code Coverage](http://codecov.io/github/andy-shea/redux-formalize/coverage.svg?branch=master)](http://codecov.io/github/andy-shea/redux-formalize?branch=master)

Seamless management of stateless forms in your React/Redux app.

## Install

```
yarn add redux-formalize
```

## Setup

### :one: Add a form reducer to your root reducer

```javascript
import {formsReducerCreator} from 'redux-formalize';

const rootReducer = combineReducers({
  [...],
  forms: formsReducerCreator()
}
```

### :two: Add form meta to your actions

Ensure your asynchronous action triad for submitting the form (pending, success, and failure actions) have the same `formName` as given to `connectForm` below.

```javascript
const actionCreators = {
  saveFormValues(payload) {
    const formName = 'myFormName';
    return dispatch => {
      dispatch({type: 'SAVE_FORM', payload, formName});
      return post('/api/save', payload).then(
        response => dispatch({type: 'SAVE_FORM_SUCCESS', payload, response, formName}),
        error => dispatch({type: 'SAVE_FORM_FAIL', payload, error, formName})
      );
    };
  }
};
```

### :three: Connect and configure your stateless form:
```javascript
import {connectForm} from 'redux-formalize';

// your stateless form enhanced with handlers and form state provided by redux-formalize
function Form({fields, updateField, submitForm, state: {isSubmitting, errors}}) {
  return (
    <form onSubmit={submitForm} onChange={updateField}>
      <p>
        <label>
          A Field:
          <input type="text" name="text" value={fields.field}/>
        </label>
      </p>
      <p>
        <label>
          Another Field:
          <input type="radio" name="anotherField" value="foo" checked={fields.anotherField === 'foo'}/>
          <input type="radio" name="anotherField" value="bar" checked={fields.anotherField === 'bar'}/>
        </label>
      </p>
      <p>
        <label>
          Last Field:
          <input type="checkbox" name="lastField" value="baz" checked={fields.lastField}/>
        </label>
      </p>
      <p>
        <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting' : 'Submit'}</button>
      </p>
    </form>
  );
}

const fieldNames = ['field', 'anotherField', 'lastField'];

// props are passed to your submit handler including any dispatched wrapped action creators
function onSubmit({saveFormValues, fields}) {
  saveFormValues(fields.field, fields.anotherField, fields.lastField);
}

// connect the form
export default connectForm('myFormName', fieldNames, onSubmit, {actionCreators})(Form);
```

That's it! :tada:

Redux Formalize will wrap your stateless form in a higher-order component that passes field values and form management functions as props to your form. Furthermore, actions dispatched with a connected form's name will have it's state automatically reduced and passed to your form as a state prop.

## API

#### `formsReducerCreator([config])`

- `config` - an optional object to configure the action type pattern matching of the reducer. Valid settings are
  * `successMatch` - a regex to match a successful form action type. Defaults to `/_SUCCESS$/`
  * `failMatch` - a regex to match a failed form action type. Defaults to `/_FAIL$/`

Returns a reducer that will reduce new form state when an action is encountered containing the `formName` property. If the action type does not match the success or fail regex's defined above, it's assumed to be an action describing a form's "pending" state. Form state is reduced as follows for a given action type:
- **Pending:** `{isSubmitting: true, errors: undefined}`
- **Success:** `{isSubmitting: false, errors: undefined}`
- **Fail:** `{isSubmitting: false, errors}` where `errors` is taken from the failed action

The form state is reduced to a property keyed by the `formName` provided in the action.

#### `connectForm(formName, fieldNames, onSubmit, [config])`

- `formName` - the name of the form. Any action associated with the form's submission must provide the same name as a property on the action for automatic form state reduction
- `fieldNames` - an array containing all field names of controlled elements within the form
- `onSubmit` - a callback function to be called when the form is submitted. The callback will be passed props containing field values and any action creators or handlers passed in the config defined below along with any custom props passed in on creation of the form
- `config` - an optional object to further configure the form. Valid settings are
  * `actionCreators` - any action creators required to submit the form. This can be in any format accepted by the `mapDispatchToProps` argument of react-redux's [`connect`](https://github.com/reactjs/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options) function
  * `initialState` - an object or function used to override the initial state of the fields in the form.  If a function is given, it will be passed the current props and is expected to return an object containing the initial state
  * `shouldResetFormOnProps` - a function that is called with the current props and is expected to return a boolean designating whether or not the form should be reset based on the new props.  By default, a function will be provided that simply returns `false` if the form is submitting or contains errors
  * `handlers` - a convenience setting to allow for further handlers required to manage the state of the form to be passed in.  For example, some custom form element components don't bubble an `onChange` event that the parent `form` can handle so instead a handler can be provided that uses `updateForm` to manually save the new field to state. The format of the handlers must conform to the `handlerCreators` defined in recomposes [`withHandlers`](https://github.com/acdlite/recompose/blob/master/docs/API.md#withhandlers) function

Returns a higher-order component that will supply the wrapped stateless form with the following props:

- `fields` - an object containing the values of all controlled form fields with the field names as the keys
- `state` - an object containing the state of the form.  It will be comprised of an `isSubmitting` boolean indicating whether the form is submitting or not and, on failed form submissions, an `errors` object taken from the failed form action
- `submitForm` - a function to be used to handle the form's `submit` event.  The function will simply prevent the event's default behaviour from executing before calling the supplied `onSubmit` function passed to `connectForm`
- `updateField` - a function to be used to handle the form elements' `change` event. It can either be placed on each form element or on the parent form to handle any `change` events via bubbling
- `updateForm` - a convenience function which can be used to manually update form elements that either don't fire `change` events or may require specific processing to extract the required value before saving to state.  Use this in combination with `handlers` defined above for custom form element change handling

## Example

`yarn && yarn start` :thumbsup:

Use Redux DevTools to monitor the actions and state changes on form submission.

## Licence

[MIT](./LICENSE)
