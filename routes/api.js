var express = require('express');
var router = express.Router();
const mysql = require('mysql2/promise');

//MySQL 連線設定
const connectionString = {
    host:'localhost',
    user:'root',
    password:'P@ssw0rd',
    database: 'mydb'
}

//http://localhost:3000/api/categories
router.get('/categories',async(req, res)=>{
    let connection;
    try{
        connection = await mysql.createConnection(connectionString);
        const[rows] = await connection.execute('SELECT * FROM categories');
        res.json(rows)
    }catch(error){
        console.log('資料庫連線失敗：', error);
        res.status(500).send('資料庫錯誤...')
    }finally{
        if(connection){
            await connection.end();
        }
    }
})
router.get('/categories/:id', async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
      connection = await mysql.createConnection(connectionString);
      const [rows] = await connection.execute('SELECT * FROM categories WHERE CategoryId = ?', [id]);
      if (rows.length > 0) {
        res.json(rows[0]);
      } else {
        res.status(404).send('查無此分類資料');
      }
    } catch (error) {
      console.error('資料庫連線失敗:', error);
      res.status(500).send('資料庫錯誤...');
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  });
router.post('/categories', async (req, res) => {
    const { CategoryName } = req.body;
    let connection;
    try {
      connection = await mysql.createConnection(connectionString);
      const [result] = await connection.execute('INSERT INTO categories (CategoryName) VALUES (?)', [CategoryName]);
      res.status(201).json({ id: result.insertId, CategoryName});
    } catch (error) {
      console.error('資料庫連線失敗:', error);
      res.status(500).send('資料庫錯誤...');
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  });
router.delete('/categories/:id', async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
      connection = await mysql.createConnection(connectionString);
      const [result] = await connection.execute('DELETE FROM categories WHERE CategoryId = ?', [id]);
      if(result.affectedRows > 0){
        res.status(204).send()
      }else{
        res.status(404).send('找不到要刪除的分類資料');
      }
    } catch (error) {
      console.error('資料庫連線失敗:', error);
      res.status(500).send('資料庫錯誤...');
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  });
router.put('/categories/:id', async (req, res) => {
    const { id } = req.params;
    const { CategoryName } = req.body;
    let connection;
    try {
      connection = await mysql.createConnection(connectionString);
      const [result] = await connection.execute('UPDATE categories SET CategoryName = ? WHERE CategoryId = ?', [CategoryName, id]);
      if (result.affectedRows > 0) {
        res.json({ id, CategoryName });
      } else {
        res.status(404).send('找不到要修改的分類資料');
      }
    } catch (error) {
      console.error('資料庫連線失敗:', error);
      res.status(500).send('資料庫錯誤...');
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  });

router.get('/spots', async (req, res) => {
  const { keyword, categoryId, sortBy, sortType, page, pageSize } = req.query;
  
  
  let query = 'SELECT * FROM spotimagesspot WHERE 1=1';
  const params = [];
  if (keyword) {
    query += ' AND (SpotTitle LIKE ? OR SpotDescription LIKE ?)';
    params.push(`%${keyword}%`,`%${keyword}%`);
  }  
  if (categoryId) {
    query += ' AND CategoryId = ?';
    params.push(categoryId);
  }

  // 排序
  if (sortBy) {
    query += ` ORDER BY ${sortBy} ${sortType === 'asc' ? 'ASC' : 'DESC'}`;
  }

//   分頁
  const limit = (parseInt(pageSize, 10) || 10).toString();
  const offset = ((parseInt(page, 10) - 1) * limit).toString(); 

  query += ' LIMIT ? OFFSET ?';
  params.push(limit);
  params.push(offset)


let connection;
  try {
    connection = await mysql.createConnection(connectionString);
    const [results] = await connection.execute(query, params);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
  });

  router.get('/', function(req, res, next) {
    res.json({ title: 'RESTful API' });
  });
module.exports = router;
