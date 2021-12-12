const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'd9mb67cy',
  database: 'todo'
});
 
connection.connect();
 
connection.query('SELECT * FROM task_data;', function (error, results, fields) {
  if (error) throw error;
  console.log(results[0]);
});
 
connection.end();