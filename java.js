var req = new XMLHttpRequest();
req.open("GET", "Main.class", true);
req.responseType = "arraybuffer";
req.onload = mainClassFileLoaded;
req.send(null);

var mainClassFile = {};

var cpTags = {
  7: "Class",
  9: "Field",
  10: "Method",
  11: "InterfaceMethod",
  8: "String",
  3: "Integer",
  4: "Float",
  5: "Long",
  6: "Double",
  12: "NameAndType",
  1: "UTF-8",
  15: "MethodHandle",
  16: "MethodType",
  18: "InvokeDynamic"
}

function mainClassFileLoaded(event) {
  var buf = req.response;
  if (!buf) {
    alert("An error occurred!");
    return;
  }
  var arr = new Uint8Array(buf);
  console.log(arr);
  // At index 0
  var magicNumber = "";
  for (var i = 0; i < 4; i++) {
    magicNumber += arr[i].toString(16);
  }
  mainClassFile.magicNumber = magicNumber;

  // At index 4
  var version = {};
  version.minor = (arr[4] << 8) | arr[5];
  version.major = (arr[6] << 8) | arr[7];
  mainClassFile.version = version;

  // At index 8
  var i = 8;
  var constantPoolSize = ((arr[i] << 8) | arr[i+1]);
  mainClassFile.constantPoolSize = constantPoolSize;
  var constantPool = new Array(constantPoolSize);
  constantPool[0] = {};
  i = 10;
  for (var x = 1; x < constantPoolSize; x++) {
    var tag = arr[i++];
    var object = {};
    object.tag = tag;
    var type = cpTags[tag];

    if (type == "Class") {
      object.name_index = (arr[i++] << 16) | arr[i++];
    }
    else if (type == "Field" || type == "Method" || type == "InterfaceMethod") {
      object.class_index = (arr[i++] << 16) | arr[i++];
      object.name_and_type_index = (arr[i++] << 16) | arr[i++];
    }
    else if (type == "String") {
      object.string_index = (arr[i++] << 16) | arr[i++];
    }
    else if (type == "Integer" || type == "Float") {
      object.bytes = (arr[i++] << 64) | (arr[i++] << 32) | (arr[i++] << 16) | arr[i++];
    }
    else if (type == "Long" || type == "Double") {
      object.high_bytes = (arr[i++] << 64) | (arr[i++] << 32) | (arr[i++] << 16) | arr[i++];
      object.low_bytes = (arr[i++] << 64) | (arr[i++] << 32) | (arr[i++] << 16) | arr[i++];
    }
    else if (type == "NameAndType") {
      object.name_index = (arr[i++] << 16) | arr[i++];
      object.descriptor_index = (arr[i++] << 16) | arr[i++];
    }
    else if (type == "UTF-8") {
      object.length = (arr[i++] << 16) | arr[i++];
      var utfArray = new Uint8Array(object.length);
      for (var y = 0; y < object.length; y++) {
        utfArray[y] = arr[i++];
      }
      object.bytes = utfArray;
      object.toString = function() {
        var str = "";
        for (var index = 0; index < this.length; index++) {
          str += String.fromCharCode(this.bytes[index]);
        }
        return str;
      }
    }
    else if (type == "MethodHandle") {
      object.reference_kind = arr[i++];
      object.reference_index = (arr[i++] << 16) | arr[i++];
    }
    else if (type == "MethodType") {
      object.descriptor_index = arr[i++];
    }
    else if (type == "InvokeDynamic") {
      object.bootstrap_method_attr_index = (arr[i++] << 16) | arr[i++];
      object.name_and_type_index = (arr[i++] << 16) | arr[i++];
    }
    constantPool[x] = object;
  }
  mainClassFile.constantPool = constantPool;

  mainClassFile.accessFlags = (arr[i++] << 16) | arr[i++];
  mainClassFile.this_class = (arr[i++] << 16) | arr[i++];
  mainClassFile.super_class = (arr[i++] << 16) | arr[i++];
  mainClassFile.interfaces_count = (arr[i++] << 16) | arr[i++];
  var interfaces = new Uint8Array(mainClassFile.interfaces_count);
  for (var x = 0; x < mainClassFile.interfaces_count; x++) {
    interfaces[x] = arr[i++];
  }
  mainClassFile.interfaces = interfaces;


  var fields_count = (arr[i++] << 16) | arr[i++];
  mainClassFile.fields_count = fields_count;
  var fields = new Array(fields_count);
  for (var x = 0; x < fields_count; x++) {
    var fieldInfo = {};
    fieldInfo.access_flags = (arr[i++] << 16) | arr[i++];
    fieldInfo.name_index = (arr[i++] << 16) | arr[i++];
    fieldInfo.descriptor_index = (arr[i++] << 16) | arr[i++];
    fieldInfo.attributes_count = (arr[i++] << 16) | arr[i++];
    var attributes = new Array(fieldInfo.attributes_count);
    for (var y = 0; y < fieldInfo.attributes_count; y++) {
      var attribute_info = {};
      attribute_info.attribute_name_index = (arr[i++] << 16) | arr[i++];
      attribute_info.attribute_length = (arr[i++] << 64) | (arr[i++] << 32) | (arr[i++] << 16) | arr[i++];
      var info = new Uint8Array(attribute_info.attribute_length);
      for (var z = 0; z < attribute_info.attribute_length; z++) {
        info[z] = arr[i++];
      }
      attribute_info.info = info;
      attributes[y] = attribute_info;
    }
    fieldInfo.attributes = attributes;
  }
  mainClassFile.fields = fields;


  mainClassFile.methods_count = (arr[i++] << 16) | arr[i++];
  var methods = new Array(mainClassFile.methods_count);
  for (var x = 0; x < mainClassFile.methods_count; x++) {
    var methodInfo = {};
    methodInfo.access_flags = (arr[i++] << 16) | arr[i++];
    methodInfo.name_index = (arr[i++] << 16) | arr[i++];
    console.log(mainClassFile.constantPool[methodInfo.name_index].toString());
    methodInfo.descriptor_index = (arr[i++] << 16) | arr[i++];
    methodInfo.attributes_count = (arr[i++] << 16) | arr[i++];
    var attributes = new Array(methodInfo.attributes_count);
    for (var y = 0; y < methodInfo.attributes_count; y++) {
      var attribute_info = {};
      attribute_info.attribute_name_index = (arr[i++] << 16) | arr[i++];
      attribute_info.attribute_length = (arr[i++] << 64) | (arr[i++] << 32) | (arr[i++] << 16) | arr[i++];
      var info = new Uint8Array(attribute_info.attribute_length);
      for (var z = 0; z < attribute_info.attribute_length; z++) {
        info[z] = arr[i++];
      }
      attribute_info.info = info;
      attributes[y] = attribute_info;
    }
    methodInfo.attributes = attributes;
    console.log(methodInfo);
  }
  mainClassFile.methods = methods;

  mainClassFile.attributes_count = (arr[i++] << 16) | arr[i++];
  var attributes = new Array(mainClassFile.attributes_count);
  for (var y = 0; y < mainClassFile.attributes_count; y++) {
    var attribute_info = {};
    attribute_info.attribute_name_index = (arr[i++] << 16) | arr[i++];
    attribute_info.attribute_length = (arr[i++] << 64) | (arr[i++] << 32) | (arr[i++] << 16) | arr[i++];
    var info = new Uint8Array(attribute_info.attribute_length);
    for (var z = 0; z < attribute_info.attribute_length; z++) {
      info[z] = arr[i++];
    }
    attribute_info.info = info;
    attributes[y] = attribute_info;
  }
  mainClassFile.attributes = attributes;



}
