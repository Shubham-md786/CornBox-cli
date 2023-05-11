const base64Encode = (str) => Buffer.from(str).toString('base64').slice(0, -1);
export { base64Encode };
