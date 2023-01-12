class Cookies {
  constructor() {}

  set = (key, value, time = 31536000) => {
    let date = new Date();
    date.setTime(date.getTime() + time);
    let expires = "expires=" + date.toUTCString();
    document.cookie = key + "=" + value + ";" + expires;
  };

  get = (key) => {
    const name = key + "=";
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      const text = cookie.trim();
      if (text.indexOf(name) === 0) {
        return text.substring(name.length, text.length);
      }
    }
    return undefined;
  };
}

let cookies = new Cookies();
export default cookies;
