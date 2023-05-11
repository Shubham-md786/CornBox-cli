const isRequired = (input) =>
    input === '' ? 'This field is necessary ❌'.red : true;

export { isRequired };
