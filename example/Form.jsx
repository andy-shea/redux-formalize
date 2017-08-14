import React from 'react';
import {connectForm} from '../src';
import {actionCreators} from './redux';

function Form({fields, updateField, submitForm, state: {isSubmitting, errors}}) {
  const {text, radio, checkbox, textarea, select, shouldError} = fields;
  return (
    <form onSubmit={submitForm} onChange={updateField}>
      <p>
        <label>
          Text:&nbsp;
          <input type="text" name="text" value={text}/>
        </label>
      </p>
      <p>
        <label>
          Radio:&nbsp;
          <input name="radio" type="radio" value="radio1" checked={radio === 'radio1'}/>
          <input name="radio" type="radio" value="radio2" checked={radio === 'radio2'}/>
          <input name="radio" type="radio" value="radio3" checked={radio === 'radio3'}/>
        </label>
      </p>
      <p>
        <label>
          Checkbox:&nbsp;
          <input name="checkbox" type="checkbox" value="checkbox" checked={checkbox}/>
        </label>
      </p>
      <p>
        <label>
          Textarea:&nbsp;
          <textarea name="textarea" value={textarea}/>
        </label>
      </p>
      <p>
        <label>
          Select:&nbsp;
          <select name="select" value={select}>
            <option value="select1">select1</option>
            <option value="select2">select2</option>
            <option value="select3">select3</option>
          </select>
        </label>
      </p>
      <p>
        <label>
          Test error state?&nbsp;
          <input name="shouldError" type="checkbox" value="error" checked={shouldError}/>
        </label>
      </p>
      <p>
        <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting' : 'Submit'}</button>
      </p>
    </form>
  );
}

const fieldNames = ['text', 'radio', 'checkbox', 'textarea', 'select', 'shouldError'];

function onSubmit({saveFoo, fields}) {
  saveFoo(fields);
}

export default connectForm('form', fieldNames, onSubmit, {actionCreators})(Form);
