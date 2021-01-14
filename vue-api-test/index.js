import express from 'express'
import mysql from 'mysql'
import cors from 'cors'

import JsonResultModel from './model/JsonResultModel.mjs'

let app = express()
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

/* mysql config */
let conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'dkdlwkr',
    database: 'test',
})
conn.connect();

/* mysql config END */

const defaultErrorHandler = (err, onSuccess, onFailure) => {
    
    const json = new JsonResultModel(!err);
    if (!!err) {
        console.error(err)
        if (!!onFailure && typeof onFailure === 'function') onFailure(json);
        else {
            json.msg = 'common error'
        }
    } else {
        if (!!onSuccess && typeof onSuccess === 'function') onSuccess(json);
        else {
            json.msg = 'success'
        }
    }
    return json
}

/* controller */

app.get('/', (req, res) => {
    res.send('hello world')
})

app.get('/list', async (req, res) => {

    const isPagingRequired = !!req.query.perPage
    let size = 0;

    //  count
    await conn.query(
        'SELECT count(*) as cnt FROM board',
        (err, result) => {
            size = result[0].cnt
        }
    );

    const getPagingLimit = ()=>{
        if(!isPagingRequired) return '';

        const page = req.query.page
        const perPage = req.query.perPage

        let fromIndex = (page - 1) * perPage

        return `LIMIT ${fromIndex}, ${perPage}`
    }
    
    conn.query(
        'SELECT * FROM board '+
        'ORDER BY regdate DESC '+
        getPagingLimit(),
        (err, result) => {
            res.status(200)
                .send(defaultErrorHandler(err,
                    json => {
                        json.list = result
                        json.size = size
                    }, json => {
                        json.err = err
                    }))
        }
    )
})

app.post('/create', (req, res) => {
    conn.query(
        'INSERT INTO board(title, description, author, password) '+
        'VALUES(?, ?, ?, ?)' ,
        [req.body.title, req.body.description, req.body.author, req.body.password],
        (err, result) => {
            res.send(defaultErrorHandler(err))
        }
    )
})

app.post('/update/:idx', (req, res) => {
    conn.query(
        'UPDATE board SET title = ?, description = ? WHERE idx = ? and password = ?',
        [req.body.title, req.body.description, req.body.idx, req.body.password],
        (err, result) => {
            res.send(defaultErrorHandler(err))
        }
    )
})

app.post('/delete/:id', (req, res) => {
    conn.query(
        'DELETE FROM board WHERE idx = ? and password = ?',
        [req.body.idx, req.body.password],
        (err, result) => {
            res.send(defaultErrorHandler(err))
        }
    )
})

/* controller end */

const port = 3000

app.listen(port, () => {
    console.log(`Server running on port:${port}`)
})
