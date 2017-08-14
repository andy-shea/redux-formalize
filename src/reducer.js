function formsReducerCreator({successMatch = /_SUCCESS$/, failMatch = /_FAIL$/} = {}) {
  return (state = {}, {formName, type, errors} = {}) => {
    if (formName) {
      if (successMatch.test(type)) {
        return {...state, [formName]: {isSubmitting: false, errors: undefined}};
      }
      if (failMatch.test(type)) {
        return {...state, [formName]: {isSubmitting: false, errors}};
      }
      return {...state, [formName]: {isSubmitting: true, errors: undefined}};
    }
    return state;
  };
}

export default formsReducerCreator;
