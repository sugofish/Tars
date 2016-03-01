var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize')

var sequelize = new Sequelize('Elio', 'root', 'c85k40c29', {
  host: '127.0.0.1',
  dialect: 'mysql',
  pool: {
    max: 10,
    min: 0,
    idle: 10000
  }
});

var ISBN = sequelize.define('isbn', {
  isbn: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false
  }
}, {
  timestamps: true,
  createdAt: 'created_time',
  updatedAt: 'updated_time',
});
ISBN.sync();

var filePathA = path.join(__dirname, '../source/isbn-978957.csv');
var filePathB = path.join(__dirname, '../source/isbn-978986.csv');

var isbn_arrays = [];
var inserts = [];
var index = 0;

fs.readFile(filePathA, 'utf8', function (err, contents) {
  isbn_arrays = contents.split(",");
  console.log('978957:' + isbn_arrays.length);

  fs.readFile(filePathB, 'utf8', function (err, contents) {
    isbn_arrays = isbn_arrays.concat(contents.split(","))
    console.log('978986:' + isbn_arrays.length);


    var values = [];
    var count = 0;

    for (var i = 0; i < isbn_arrays.length; i++) {
      var isbn_string = isbn_arrays[i];
      if (i === 0) {
        values.push({isbn: isbn_string});
        count++;
      } else if (i % 50000 === 0) {
        values.push({isbn: isbn_string});
        inserts.push(values);
        values = [];
        count = 0;
      } else {
        values.push({isbn: isbn_string});
        count++;
      }
      if (i === isbn_arrays.length - 1) {
        //console.log('last index=' + i);
        inserts.push(values);
      }
    }

    console.log('count:' + inserts.length);
    //var lastObject = inserts[39];
    //console.log(inserts);
    //console.log('lastobject:' + lastObject.length);
    //return;
    console.log('start insert');
    insert_to_isbn(index);
  });
});

function insert_to_isbn(index) {
  ISBN.bulkCreate(inserts[index]).then(function () {
    console.log('insert:' + index + ' finish');
    if (index < inserts.length - 1) {
      index++;
      insert_to_isbn(index);
    } else {
      console.log('task finish');
    }
  })
}
