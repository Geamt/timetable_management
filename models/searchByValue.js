function searchByValue(obj, value) {
  status = 0;
  var data = {};
  for (var index in obj) {
    if (value == obj[index]) {
      status = 1;
      data = obj;
      break;
    }
    if (typeof obj[index] == "object" && status == 0) {
      data = searchByValue(obj[index], value);
    }
  }
  return data;
}
module.exports = searchByValue;
