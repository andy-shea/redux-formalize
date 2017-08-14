import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {store} from './redux';
import Form from './Form';

render(
  <Provider store={store}><Form/></Provider>,
  document.getElementById('root')
);
