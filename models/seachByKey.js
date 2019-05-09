function searchByKey(obj, key ) {
  status = 0;
  var data = {};
  for (var index in obj) {
    if (key == index) { 
      status = 1;
      data = obj;
      break;
    }
    if (typeof obj[index] == "object" && status == 0) {
      data=searchByKey(obj[index], key);
    }
  }
  return data;
}
module.exports = searchByKey;
