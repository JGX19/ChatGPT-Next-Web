import axios from "axios";
import { BASE_URL } from "../../constant";

export const Get = (url, params = {}) =>
  new Promise((resolve) => {
    axios
      .get(BASE_URL + url, params)
      .then((result) => {
        resolve(result.data);
      })
      .catch((error) => {
        console.log("报错");
        resolve(error);
      });
  });

export const Post = (url, data, params = {}) => {
  return new Promise((resolve) => {
    axios
      .post(BASE_URL + url, data, params)
      .then((result) => {
        resolve(result.data);
      })
      .catch((err) => {
        resolve([err, undefined]);
      });
  });
};
