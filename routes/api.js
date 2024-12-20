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
// 建立 MySQL 連接
const connection = mysql.createPool(connectionString);

//http://localhost:3000/api/categories
router.get('/categories',async(req, res)=>{   
    try{       
        const[rows] = await connection.execute('SELECT * FROM categories');
        res.json(rows)
    }catch(error){
        console.log('資料庫連線失敗：', error);
        res.status(500).send('資料庫錯誤...')
    }
})
router.get('/categories/:id', async (req, res) => {
    const { id } = req.params;   
    try {
      const [rows] = await connection.execute('SELECT * FROM categories WHERE CategoryId = ?', [id]);
      if (rows.length > 0) {
        res.json(rows[0]);
      } else {
        res.status(404).send('查無此分類資料');
      }
    } catch (error) {
      console.error('資料庫連線失敗:', error);
      res.status(500).send('資料庫錯誤...');
    } 
  });
router.post('/categories', async (req, res) => {
    const { CategoryName } = req.body;  
    try {    
      const [result] = await connection.execute('INSERT INTO categories (CategoryName) VALUES (?)', [CategoryName]);
      res.status(201).json({ id: result.insertId, CategoryName});
    } catch (error) {
      console.error('資料庫連線失敗:', error);
      res.status(500).send('資料庫錯誤...');
    } 
  });
router.delete('/categories/:id', async (req, res) => {
    const { id } = req.params;  
    try {
      const [result] = await connection.execute('DELETE FROM categories WHERE CategoryId = ?', [id]);
      if(result.affectedRows > 0){
        res.status(204).send()
      }else{
        res.status(404).send('找不到要刪除的分類資料');
      }
    } catch (error) {
      console.error('資料庫連線失敗:', error);
      res.status(500).send('資料庫錯誤...');
    } 
  });
router.put('/categories/:id', async (req, res) => {
    const { id } = req.params;
    const { CategoryName } = req.body;   
    try {
      const [result] = await connection.execute('UPDATE categories SET CategoryName = ? WHERE CategoryId = ?', [CategoryName, id]);
      if (result.affectedRows > 0) {
        res.json({ id, CategoryName });
      } else {
        res.status(404).send('找不到要修改的分類資料');
      }
    } catch (error) {
      console.error('資料庫連線失敗:', error);
      res.status(500).send('資料庫錯誤...');
    } 
  });

router.get('/spots', async (req, res) => {
 
  const { categoryid, search, ordering, page, page_size } = req.query;
  
  let query = 'SELECT * FROM spotimagesspot WHERE 1=1';
  const params = [];
  if (search) {
    query += ' AND (SpotTitle LIKE ? OR SpotDescription LIKE ?)';
    params.push(`%${search}%`,`%${search}%`);
  }  
  if (categoryid) {
    query += ' AND CategoryId = ?';
    params.push(categoryid);
  }

  // 查詢總記錄數
  const [countResult] = await connection.execute(query, params);
  const totalPages = Math.ceil(countResult.length / parseInt(page_size, 10) || 10);

  // 排序
  if (ordering) {
    const sortBy = ordering.startsWith('-') ? ordering.substring(1) : ordering;
    const sortType = ordering.startsWith('-') ? 'desc' : 'asc';
    query += ` ORDER BY ${sortBy} ${sortType}`;
  }

//   分頁
  const limit = (parseInt(page_size, 10) || 10).toString();
  const offset = ((parseInt(page, 10) - 1) * limit).toString(); 
  query += ' LIMIT ? OFFSET ?';
  params.push(limit);
  params.push(offset)



  try {  
    const [results] = await connection.execute(query, params);
    res.json({
      totalPages,
      datas:results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
  });

  router.get('/', function(req, res, next) {
    res.json({ title: 'RESTful API' });
  });
module.exports = router;
